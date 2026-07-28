import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savings, milesHistory, userProfile, fraudLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, amount, date } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json({ 
        error: "Amount is required",
        code: "MISSING_AMOUNT" 
      }, { status: 400 });
    }

    if (date === undefined || date === null) {
      return NextResponse.json({ 
        error: "Date is required",
        code: "MISSING_DATE" 
      }, { status: 400 });
    }

    // Validate amount is positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ 
        error: "Amount must be a positive number",
        code: "INVALID_AMOUNT" 
      }, { status: 400 });
    }

    // Validate date is valid unix timestamp
    if (typeof date !== 'number' || date <= 0) {
      return NextResponse.json({ 
        error: "Date must be a valid unix timestamp",
        code: "INVALID_DATE" 
      }, { status: 400 });
    }

    // Get or create user profile
    let profile = await db.select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      // Create new user profile
      const now = Date.now();
      profile = await db.insert(userProfile)
        .values({
          userId: userId,
          totalMiles: 0,
          fundBalance: 0,
          monthlyReturn: 0,
          accountCreatedAt: now,
          consistencyScore: 100,
          accountAge: 0,
          dailyDesistCount: 0,
          weeklyDesistCount: 0,
          hasBankIntegration: false,
          totalSavings: 0,
          totalDonations: 0
        })
        .returning();
    }

    const userProfileData = profile[0];

    // Antifraude checks
    if (userProfileData.dailyDesistCount >= 3 || userProfileData.weeklyDesistCount >= 5) {
      // Log fraud attempt
      const now = Date.now();
      await db.insert(fraudLogs).values({
        userId: userId,
        action: 'earn_miles_attempt',
        riskLevel: 'high',
        details: JSON.stringify({
          dailyDesistCount: userProfileData.dailyDesistCount,
          weeklyDesistCount: userProfileData.weeklyDesistCount,
          amount: amount,
          date: date
        }),
        createdAt: now
      });

      return NextResponse.json({ 
        error: "Fraud limit exceeded. Too many desist attempts.",
        code: "FRAUD_LIMIT_EXCEEDED",
        details: {
          dailyDesistCount: userProfileData.dailyDesistCount,
          weeklyDesistCount: userProfileData.weeklyDesistCount
        }
      }, { status: 429 });
    }

    // Miles calculation
    let baseMiles = amount * 0.5;

    // Apply multiplier based on investor profile
    let multiplier = 1.0;
    if (userProfileData.investorProfile === 'moderado') {
      multiplier = 1.2;
    } else if (userProfileData.investorProfile === 'agressivo') {
      multiplier = 1.5;
    }

    const calculatedMiles = Math.round(baseMiles * multiplier);

    // Calculate consistency score
    let newConsistencyScore = userProfileData.consistencyScore;
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    if (userProfileData.lastSavingDate) {
      if (userProfileData.lastSavingDate >= sevenDaysAgo) {
        // Within last 7 days: increase score
        newConsistencyScore = Math.min(newConsistencyScore + 5, 100);
      } else {
        // More than 7 days ago: decrease score
        newConsistencyScore = Math.max(newConsistencyScore - 10, 0);
      }
    }

    // Execute database transaction
    const now = Date.now();

    // Insert into savings table
    const newSaving = await db.insert(savings)
      .values({
        userId: userId,
        amount: amount,
        date: date,
        cancelled: false,
        milesEarned: calculatedMiles,
        createdAt: now
      })
      .returning();

    if (newSaving.length === 0) {
      throw new Error('Failed to create savings record');
    }

    // Insert into miles history
    await db.insert(milesHistory)
      .values({
        userId: userId,
        milesEarned: calculatedMiles,
        reason: 'saving_recorded',
        source: 'earn_miles',
        status: 'pending',
        createdAt: now,
        releasedAt: null
      });

    // Update user profile
    await db.update(userProfile)
      .set({
        totalSavings: userProfileData.totalSavings + amount,
        lastSavingDate: date,
        consistencyScore: newConsistencyScore
      })
      .where(eq(userProfile.userId, userId));

    // Return success response
    return NextResponse.json({
      id: newSaving[0].id,
      userId: newSaving[0].userId,
      amount: newSaving[0].amount,
      date: newSaving[0].date,
      milesEarned: newSaving[0].milesEarned,
      status: 'pending',
      createdAt: newSaving[0].createdAt
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/miles/earn error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}