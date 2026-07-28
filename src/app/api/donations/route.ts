import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { donations, ngos, userProfile } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const results = await db
      .select()
      .from(donations)
      .where(eq(donations.userId, userId))
      .orderBy(desc(donations.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const body = await request.json();
    const { userId, ngoId, milesAmount, investmentValue, status = 'active' } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!ngoId) {
      return NextResponse.json(
        { error: 'ngoId is required', code: 'MISSING_NGO_ID' },
        { status: 400 }
      );
    }

    if (!milesAmount || milesAmount <= 0) {
      return NextResponse.json(
        { error: 'milesAmount is required and must be greater than 0', code: 'INVALID_MILES_AMOUNT' },
        { status: 400 }
      );
    }

    if (investmentValue === undefined || investmentValue === null || investmentValue < 0) {
      return NextResponse.json(
        { error: 'investmentValue is required and must be non-negative', code: 'INVALID_INVESTMENT_VALUE' },
        { status: 400 }
      );
    }

    // Check if NGO exists and is active
    const ngo = await db
      .select()
      .from(ngos)
      .where(eq(ngos.id, ngoId))
      .limit(1);

    if (ngo.length === 0) {
      return NextResponse.json(
        { error: 'NGO not found', code: 'NGO_NOT_FOUND' },
        { status: 400 }
      );
    }

    if (!ngo[0].active) {
      return NextResponse.json(
        { error: 'NGO is not active', code: 'NGO_INACTIVE' },
        { status: 400 }
      );
    }

    // Check if milesAmount meets minimum requirement
    if (milesAmount < ngo[0].minMiles) {
      return NextResponse.json(
        { 
          error: `Donation amount must be at least ${ngo[0].minMiles} miles`, 
          code: 'INSUFFICIENT_MILES_AMOUNT',
          minMiles: ngo[0].minMiles 
        },
        { status: 400 }
      );
    }

    // Check if user has enough miles
    const userProf = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    if (userProf.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'USER_PROFILE_NOT_FOUND' },
        { status: 400 }
      );
    }

    if (userProf[0].totalMiles < milesAmount) {
      return NextResponse.json(
        { 
          error: 'Insufficient miles balance', 
          code: 'INSUFFICIENT_MILES',
          availableMiles: userProf[0].totalMiles,
          requiredMiles: milesAmount
        },
        { status: 400 }
      );
    }

    // Perform transaction: create donation and update user miles
    const result = await db.transaction(async (tx) => {
      // Insert donation record
      const newDonation = await tx
        .insert(donations)
        .values({
          userId,
          ngoId,
          milesAmount,
          investmentValue,
          status,
          createdAt: Date.now(),
        })
        .returning();

      // Deduct miles from user profile
      const updatedProfile = await tx
        .update(userProfile)
        .set({
          totalMiles: userProf[0].totalMiles - milesAmount,
        })
        .where(eq(userProfile.userId, userId))
        .returning();

      return {
        donation: newDonation[0],
        updatedMiles: updatedProfile[0].totalMiles,
      };
    });

    // Verificar conquistas automaticamente
    if (token) {
      try {
        await fetch(`${request.nextUrl.origin}/api/achievements/check`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Erro ao verificar conquistas:', error);
        // Não falhar a doação se a verificação de conquistas falhar
      }
    }

    return NextResponse.json(
      {
        ...result.donation,
        remainingMiles: result.updatedMiles,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}