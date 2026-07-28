import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savings, userProfile, milesHistory } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid pagination parameters',
        code: 'INVALID_PAGINATION' 
      }, { status: 400 });
    }

    const results = await db.select()
      .from(savings)
      .where(eq(savings.userId, userId))
      .orderBy(desc(savings.date))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const savingsId = parseInt(id);

    // Get the savings record
    const savingsRecord = await db.select()
      .from(savings)
      .where(eq(savings.id, savingsId))
      .limit(1);

    if (savingsRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Savings record not found',
        code: 'SAVINGS_NOT_FOUND' 
      }, { status: 404 });
    }

    const savingsData = savingsRecord[0];

    // Check if already cancelled
    if (savingsData.cancelled) {
      return NextResponse.json({ 
        error: 'Savings already cancelled',
        code: 'ALREADY_CANCELLED' 
      }, { status: 409 });
    }

    // Get user profile
    const profile = await db.select()
      .from(userProfile)
      .where(eq(userProfile.userId, savingsData.userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ 
        error: 'User profile not found',
        code: 'PROFILE_NOT_FOUND' 
      }, { status: 404 });
    }

    const currentProfile = profile[0];

    // Calculate new values
    const newTotalSavings = Math.max(0, currentProfile.totalSavings - savingsData.amount);
    const newDailyDesistCount = currentProfile.dailyDesistCount + 1;
    const newWeeklyDesistCount = currentProfile.weeklyDesistCount + 1;
    const newConsistencyScore = Math.max(0, currentProfile.consistencyScore - 15);

    // 1. Mark savings as cancelled
    const updatedSavings = await db.update(savings)
      .set({
        cancelled: true
      })
      .where(eq(savings.id, savingsId))
      .returning();

    if (updatedSavings.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to cancel savings',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    // 2. Update user profile
    await db.update(userProfile)
      .set({
        totalSavings: newTotalSavings,
        dailyDesistCount: newDailyDesistCount,
        weeklyDesistCount: newWeeklyDesistCount,
        consistencyScore: newConsistencyScore
      })
      .where(eq(userProfile.userId, savingsData.userId));

    // 3. Update corresponding miles history record
    await db.update(milesHistory)
      .set({
        status: 'cancelled'
      })
      .where(and(
        eq(milesHistory.userId, savingsData.userId),
        eq(milesHistory.milesEarned, savingsData.milesEarned),
        eq(milesHistory.createdAt, savingsData.createdAt),
        eq(milesHistory.source, 'earn_miles')
      ));

    return NextResponse.json({
      message: 'Savings cancelled successfully',
      savings: updatedSavings[0],
      profileUpdates: {
        totalSavings: newTotalSavings,
        dailyDesistCount: newDailyDesistCount,
        weeklyDesistCount: newWeeklyDesistCount,
        consistencyScore: newConsistencyScore
      }
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}