import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { achievements } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId query parameter is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    const userAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));

    return NextResponse.json(userAchievements, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, achievementId, progress, target } = body;

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId field is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (!achievementId) {
      return NextResponse.json(
        { 
          error: 'achievementId field is required',
          code: 'MISSING_ACHIEVEMENT_ID' 
        },
        { status: 400 }
      );
    }

    // Check if achievement already exists
    const existingAchievement = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.achievementId, achievementId)
        )
      )
      .limit(1);

    if (existingAchievement.length > 0) {
      return NextResponse.json(
        { 
          error: 'Achievement already unlocked',
          code: 'DUPLICATE_ACHIEVEMENT' 
        },
        { status: 409 }
      );
    }

    const newAchievement = await db
      .insert(achievements)
      .values({
        userId: userId.trim(),
        achievementId: achievementId.trim(),
        unlockedAt: Date.now(),
        progress: progress !== undefined ? progress : 0,
        target: target !== undefined ? target : 1
      })
      .returning();

    return NextResponse.json(newAchievement[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}