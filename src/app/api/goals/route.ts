import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { goals } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    // Single goal by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const goal = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, parseInt(id)), eq(goals.userId, userId)))
        .limit(1);

      if (goal.length === 0) {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
      }

      return NextResponse.json(goal[0], { status: 200 });
    }

    // List goals with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(userGoals, { status: 200 });
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
    const { userId, name, targetAmount, deadline } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (targetAmount === undefined || targetAmount === null) {
      return NextResponse.json(
        { error: 'Target amount is required', code: 'MISSING_TARGET_AMOUNT' },
        { status: 400 }
      );
    }

    if (typeof targetAmount !== 'number' || targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be a positive number', code: 'INVALID_TARGET_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate deadline if provided
    if (deadline !== undefined && deadline !== null) {
      if (typeof deadline !== 'number' || deadline < 0) {
        return NextResponse.json(
          { error: 'Deadline must be a valid unix timestamp', code: 'INVALID_DEADLINE' },
          { status: 400 }
        );
      }
    }

    const now = Date.now();

    const newGoal = await db
      .insert(goals)
      .values({
        userId: userId,
        name: name.trim(),
        targetAmount,
        currentAmount: 0,
        deadline: deadline || null,
        completed: false,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(newGoal[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if goal exists
    const existingGoal = await db
      .select()
      .from(goals)
      .where(eq(goals.id, parseInt(id)))
      .limit(1);

    if (existingGoal.length === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const { currentAmount, completed, name, targetAmount, deadline } = body;

    // Build update object with only provided fields
    const updates: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (targetAmount !== undefined) {
      if (typeof targetAmount !== 'number' || targetAmount <= 0) {
        return NextResponse.json(
          { error: 'Target amount must be a positive number', code: 'INVALID_TARGET_AMOUNT' },
          { status: 400 }
        );
      }
      updates.targetAmount = targetAmount;
    }

    if (currentAmount !== undefined) {
      if (typeof currentAmount !== 'number' || currentAmount < 0) {
        return NextResponse.json(
          { error: 'Current amount must be a non-negative number', code: 'INVALID_CURRENT_AMOUNT' },
          { status: 400 }
        );
      }
      updates.currentAmount = currentAmount;
    }

    if (deadline !== undefined) {
      if (deadline !== null && (typeof deadline !== 'number' || deadline < 0)) {
        return NextResponse.json(
          { error: 'Deadline must be a valid unix timestamp or null', code: 'INVALID_DEADLINE' },
          { status: 400 }
        );
      }
      updates.deadline = deadline;
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return NextResponse.json(
          { error: 'Completed must be a boolean', code: 'INVALID_COMPLETED' },
          { status: 400 }
        );
      }
      updates.completed = completed;
    }

    // Auto-complete if currentAmount >= targetAmount
    const finalCurrentAmount = currentAmount !== undefined ? currentAmount : existingGoal[0].currentAmount;
    const finalTargetAmount = targetAmount !== undefined ? targetAmount : existingGoal[0].targetAmount;

    if (finalCurrentAmount >= finalTargetAmount) {
      updates.completed = true;
    }

    const updatedGoal = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, parseInt(id)))
      .returning();

    if (updatedGoal.length === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(updatedGoal[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if goal exists
    const existingGoal = await db
      .select()
      .from(goals)
      .where(eq(goals.id, parseInt(id)))
      .limit(1);

    if (existingGoal.length === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const deleted = await db
      .delete(goals)
      .where(eq(goals.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Goal deleted successfully',
        goal: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}