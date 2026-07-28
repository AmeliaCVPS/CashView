import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { milesHistory, userProfile } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Get userId from bearer token if not provided
    let finalUserId = userId;
    
    if (!finalUserId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const session = await db.query.session.findFirst({
          where: (sessions, { eq }) => eq(sessions.token, token),
        });
        
        if (session) {
          finalUserId = session.userId;
        }
      }
    }

    if (!finalUserId) {
      return NextResponse.json(
        { error: 'userId is required or provide valid bearer token', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Get user profile for total miles
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, finalUserId))
      .limit(1);

    const totalMiles = profile.length > 0 ? profile[0].totalMiles : 0;

    // Get miles history with pagination
    const history = await db
      .select()
      .from(milesHistory)
      .where(eq(milesHistory.userId, finalUserId))
      .orderBy(desc(milesHistory.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      totalMiles,
      history,
    });
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
    const body = await request.json();
    const { userId, milesEarned, reason, source, status = 'pending' } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!milesEarned || typeof milesEarned !== 'number') {
      return NextResponse.json(
        { error: 'milesEarned is required and must be a number', code: 'INVALID_MILES_EARNED' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'reason is required and must be a string', code: 'INVALID_REASON' },
        { status: 400 }
      );
    }

    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { error: 'source is required and must be a string', code: 'INVALID_SOURCE' },
        { status: 400 }
      );
    }

    const now = Date.now();
    const isReleased = status === 'released';

    // Use transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Insert into miles_history
      const milesHistoryData = {
        userId,
        milesEarned,
        reason: reason.trim(),
        source: source.trim(),
        status,
        createdAt: now,
        releasedAt: isReleased ? now : null,
      };

      const newMilesHistory = await tx
        .insert(milesHistory)
        .values(milesHistoryData)
        .returning();

      // If status is 'released', update or create userProfile
      if (isReleased) {
        const existingProfile = await tx
          .select()
          .from(userProfile)
          .where(eq(userProfile.userId, userId))
          .limit(1);

        if (existingProfile.length > 0) {
          // Update existing profile
          await tx
            .update(userProfile)
            .set({
              totalMiles: existingProfile[0].totalMiles + milesEarned,
            })
            .where(eq(userProfile.userId, userId));
        } else {
          // Create new profile
          await tx.insert(userProfile).values({
            userId,
            totalMiles: milesEarned,
            fundBalance: 0,
            monthlyReturn: 0,
            accountCreatedAt: now,
          });
        }
      }

      return newMilesHistory[0];
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}