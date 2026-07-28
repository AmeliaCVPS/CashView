import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fundHistory, userProfile } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Get user profile
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const userProfileData = profile[0];

    // Handle projections request - return projections based on user investor profile
    if (action === 'projections') {
      const currentBalance = userProfileData.fundBalance;
      const investorProfileType = userProfileData.investorProfile;

      // Calculate projections for 6, 12, 24 months
      const months = [6, 12, 24];
      
      // Define rates based on investor profile
      let rates = {
        conservador: 0.005,  // 0.5% monthly
        moderado: 0.01,      // 1% monthly
        agressivo: 0.02      // 2% monthly
      };

      const conservative = months.map(month => {
        const rate = rates.conservador;
        const projectedValue = currentBalance * Math.pow(1 + rate, month);
        return {
          month,
          value: Math.round(projectedValue * 100) / 100
        };
      });

      const moderate = months.map(month => {
        const rate = rates.moderado;
        const projectedValue = currentBalance * Math.pow(1 + rate, month);
        return {
          month,
          value: Math.round(projectedValue * 100) / 100
        };
      });

      const aggressive = months.map(month => {
        const rate = rates.agressivo;
        const projectedValue = currentBalance * Math.pow(1 + rate, month);
        return {
          month,
          value: Math.round(projectedValue * 100) / 100
        };
      });

      return NextResponse.json({
        currentBalance,
        investorProfile: investorProfileType,
        projections: {
          conservador: conservative,
          moderado: moderate,
          agressivo: aggressive
        }
      });
    }

    // Handle regular fund history request
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const history = await db
      .select()
      .from(fundHistory)
      .where(eq(fundHistory.userId, userId))
      .orderBy(desc(fundHistory.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      fundBalance: userProfileData.fundBalance,
      monthlyReturn: userProfileData.monthlyReturn,
      history
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
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { error: 'action parameter is required', code: 'MISSING_ACTION' },
        { status: 400 }
      );
    }

    if (!['convert', 'return', 'withdraw'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be convert, return, or withdraw', code: 'INVALID_ACTION' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userId, milesAmount, value } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Get user profile
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const userProfileData = profile[0];
    const now = Date.now();

    if (action === 'convert') {
      // Validate milesAmount
      if (!milesAmount || typeof milesAmount !== 'number' || milesAmount <= 0) {
        return NextResponse.json(
          { error: 'Valid milesAmount is required', code: 'INVALID_MILES_AMOUNT' },
          { status: 400 }
        );
      }

      // Check if user has enough miles
      if (userProfileData.totalMiles < milesAmount) {
        return NextResponse.json(
          { error: 'Insufficient miles balance', code: 'INSUFFICIENT_MILES' },
          { status: 400 }
        );
      }

      // Calculate deposit value (1 mile = R$ 0.01)
      const depositValue = Math.round(milesAmount * 0.01 * 100) / 100;
      const newBalance = Math.round((userProfileData.fundBalance + depositValue) * 100) / 100;
      const newMilesBalance = userProfileData.totalMiles - milesAmount;

      // Use transaction to update both tables atomically
      const result = await db.transaction(async (tx) => {
        // Update user profile - deduct miles and add to fund
        await tx
          .update(userProfile)
          .set({
            totalMiles: newMilesBalance,
            fundBalance: newBalance,
            lastFundUpdate: now
          })
          .where(eq(userProfile.userId, userId));

        // Create fund history record
        const historyRecord = await tx
          .insert(fundHistory)
          .values({
            userId,
            type: 'deposit',
            value: depositValue,
            balanceAfter: newBalance,
            createdAt: now
          })
          .returning();

        return historyRecord[0];
      });

      return NextResponse.json(result, { status: 201 });
    }

    if (action === 'return') {
      // Validate value
      if (!value || typeof value !== 'number' || value <= 0) {
        return NextResponse.json(
          { error: 'Valid value is required', code: 'INVALID_VALUE' },
          { status: 400 }
        );
      }

      const newBalance = Math.round((userProfileData.fundBalance + value) * 100) / 100;
      const newMonthlyReturn = Math.round((userProfileData.monthlyReturn + value) * 100) / 100;

      // Use transaction to update both tables atomically
      const result = await db.transaction(async (tx) => {
        // Update user profile
        await tx
          .update(userProfile)
          .set({
            fundBalance: newBalance,
            monthlyReturn: newMonthlyReturn,
            lastFundUpdate: now
          })
          .where(eq(userProfile.userId, userId));

        // Create fund history record
        const historyRecord = await tx
          .insert(fundHistory)
          .values({
            userId,
            type: 'return',
            value,
            balanceAfter: newBalance,
            createdAt: now
          })
          .returning();

        return historyRecord[0];
      });

      return NextResponse.json(result, { status: 201 });
    }

    if (action === 'withdraw') {
      // Validate value
      if (!value || typeof value !== 'number' || value <= 0) {
        return NextResponse.json(
          { error: 'Valid value is required', code: 'INVALID_VALUE' },
          { status: 400 }
        );
      }

      // Check if user has sufficient fund balance
      if (userProfileData.fundBalance < value) {
        return NextResponse.json(
          { error: 'Insufficient fund balance', code: 'INSUFFICIENT_BALANCE' },
          { status: 400 }
        );
      }

      const newBalance = Math.round((userProfileData.fundBalance - value) * 100) / 100;

      // Use transaction to update both tables atomically
      const result = await db.transaction(async (tx) => {
        // Update user profile
        await tx
          .update(userProfile)
          .set({
            fundBalance: newBalance,
            lastFundUpdate: now
          })
          .where(eq(userProfile.userId, userId));

        // Create fund history record
        const historyRecord = await tx
          .insert(fundHistory)
          .values({
            userId,
            type: 'withdrawal',
            value,
            balanceAfter: newBalance,
            createdAt: now
          })
          .returning();

        return historyRecord[0];
      });

      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action', code: 'INVALID_ACTION' },
      { status: 400 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}