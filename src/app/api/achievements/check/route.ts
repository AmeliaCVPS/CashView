import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { achievements, userProfile, savings, donations, milesHistory } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

interface AchievementRule {
  id: string;
  checkCondition: (userData: any) => boolean;
  reward: number;
}

const ACHIEVEMENT_RULES: AchievementRule[] = [
  {
    id: 'first-save',
    checkCondition: (data) => data.totalSavingsAmount >= 1,
    reward: 50,
  },
  {
    id: 'save-100',
    checkCondition: (data) => data.totalSavingsAmount >= 100,
    reward: 100,
  },
  {
    id: 'save-1000',
    checkCondition: (data) => data.totalSavingsAmount >= 1000,
    reward: 500,
  },
  {
    id: 'first-goal',
    checkCondition: (data) => data.completedGoals >= 1,
    reward: 100,
  },
  {
    id: 'goal-master',
    checkCondition: (data) => data.completedGoals >= 10,
    reward: 1000,
  },
  {
    id: 'first-donation',
    checkCondition: (data) => data.totalDonationsCount >= 1,
    reward: 100,
  },
  {
    id: 'donate-1000',
    checkCondition: (data) => data.totalDonatedMiles >= 1000,
    reward: 500,
  },
  {
    id: 'first-simulation',
    checkCondition: (data) => data.simulationCount >= 1,
    reward: 50,
  },
];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const session = await db.query.session.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = session.userId;

    // Get user data for checking achievements
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    // Get total savings amount
    const totalSavingsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${savings.amount}), 0)`,
      })
      .from(savings)
      .where(sql`${savings.userId} = ${userId} AND ${savings.cancelled} = 0`);

    const totalSavingsAmount = totalSavingsResult[0]?.total || 0;

    // Get total donations count
    const totalDonationsResult = await db
      .select({
        total: sql<number>`COALESCE(COUNT(*), 0)`,
      })
      .from(donations)
      .where(eq(donations.userId, userId));

    const totalDonationsCount = totalDonationsResult[0]?.total || 0;

    // Get total donated miles
    const totalDonatedMilesResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${donations.milesAmount}), 0)`,
      })
      .from(donations)
      .where(eq(donations.userId, userId));

    const totalDonatedMiles = totalDonatedMilesResult[0]?.total || 0;

    // Get existing achievements
    const existingAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));

    const existingAchievementIds = new Set(
      existingAchievements.map((a) => a.achievementId)
    );

    const userData = {
      totalSavingsAmount,
      totalDonationsCount,
      totalDonatedMiles,
      completedGoals: 0, // TODO: Implement goals tracking
      simulationCount: 0, // TODO: Implement simulation tracking
    };

    const newlyUnlocked: any[] = [];

    // Check each achievement rule
    for (const rule of ACHIEVEMENT_RULES) {
      // Skip if already unlocked
      if (existingAchievementIds.has(rule.id)) {
        continue;
      }

      // Check if condition is met
      if (rule.checkCondition(userData)) {
        // Unlock achievement
        const newAchievement = await db
          .insert(achievements)
          .values({
            userId,
            achievementId: rule.id,
            unlockedAt: Date.now(),
            progress: 0,
            target: 1,
          })
          .returning();

        // Award miles
        await db.insert(milesHistory).values({
          userId,
          milesEarned: rule.reward,
          reason: `Conquista desbloqueada: ${rule.id}`,
          source: 'achievement',
          createdAt: Date.now(),
          status: 'released',
          releasedAt: Date.now(),
        });

        // Update user profile miles
        if (profile.length > 0) {
          await db
            .update(userProfile)
            .set({
              totalMiles: profile[0].totalMiles + rule.reward,
            })
            .where(eq(userProfile.userId, userId));
        }

        newlyUnlocked.push({
          achievement: newAchievement[0],
          reward: rule.reward,
        });
      }
    }

    return NextResponse.json(
      {
        message: `${newlyUnlocked.length} conquista(s) desbloqueada(s)`,
        newlyUnlocked,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
