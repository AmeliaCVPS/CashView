import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfile, savings, donations, milesHistory } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

const VALID_INVESTOR_PROFILES = ['conservative', 'moderate', 'aggressive', 'conservador', 'moderado', 'agressivo'] as const;
type InvestorProfile = typeof VALID_INVESTOR_PROFILES[number];

function isValidInvestorProfile(value: any): value is InvestorProfile {
  return VALID_INVESTOR_PROFILES.includes(value);
}

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params or bearer token
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const session = await db.query.session.findFirst({
          where: (sessions, { eq }) => eq(sessions.token, token),
        });
        
        if (session) {
          userId = session.userId;
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required or provide valid bearer token',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Get or create profile
    let profile = await db.select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      // Create default profile
      const newProfile = await db.insert(userProfile).values({
        userId,
        totalMiles: 0,
        fundBalance: 0,
        monthlyReturn: 0,
        accountCreatedAt: Date.now(),
        consistencyScore: 100,
        accountAge: 0,
        totalSavings: 0,
        totalDonations: 0,
      }).returning();
      
      profile = newProfile;
    }

    // Get total savings amount
    const totalSavingsResult = await db.select({
      total: sql<number>`COALESCE(SUM(${savings.amount}), 0)`
    })
      .from(savings)
      .where(
        sql`${savings.userId} = ${userId} AND ${savings.cancelled} = 0`
      );
    
    const totalSavingsAmount = totalSavingsResult[0]?.total || 0;

    // Get total donations count
    const totalDonationsResult = await db.select({
      total: sql<number>`COALESCE(COUNT(*), 0)`
    })
      .from(donations)
      .where(eq(donations.userId, userId));
    
    const totalDonationsCount = totalDonationsResult[0]?.total || 0;

    // Get total released miles
    const totalReleasedMilesResult = await db.select({
      total: sql<number>`COALESCE(SUM(${milesHistory.milesEarned}), 0)`
    })
      .from(milesHistory)
      .where(
        sql`${milesHistory.userId} = ${userId} AND ${milesHistory.status} = 'released'`
      );
    
    const totalReleasedMiles = totalReleasedMilesResult[0]?.total || 0;

    return NextResponse.json({
      ...profile[0],
      totalSavingsAmount,
      totalDonationsCount,
      totalReleasedMiles,
    }, { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { investorProfile: newInvestorProfile } = body;

    if (!newInvestorProfile) {
      return NextResponse.json(
        { 
          error: 'Investor profile is required',
          code: 'MISSING_INVESTOR_PROFILE'
        },
        { status: 400 }
      );
    }

    if (!isValidInvestorProfile(newInvestorProfile)) {
      return NextResponse.json(
        { 
          error: `Invalid investor profile. Must be one of: conservative, moderate, aggressive, conservador, moderado, agressivo`,
          code: 'INVALID_INVESTOR_PROFILE'
        },
        { status: 400 }
      );
    }

    const existingProfile = await db.select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    if (existingProfile.length === 0) {
      const newProfile = await db.insert(userProfile)
        .values({
          userId,
          investorProfile: newInvestorProfile,
          totalMiles: 0,
          fundBalance: 0,
          monthlyReturn: 0,
          accountCreatedAt: Date.now()
        })
        .returning();

      return NextResponse.json(newProfile[0], { status: 200 });
    }

    const updatedProfile = await db.update(userProfile)
      .set({
        investorProfile: newInvestorProfile
      })
      .where(eq(userProfile.userId, userId))
      .returning();

    return NextResponse.json(updatedProfile[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}