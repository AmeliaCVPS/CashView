import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { friends, user } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

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

    // Get all friend relationships where userId matches
    const friendships = await db
      .select({
        friendshipId: friends.id,
        userId: friends.userId,
        friendId: friends.friendId,
        createdAt: friends.createdAt,
        friendName: user.name,
        friendEmail: user.email,
        friendImage: user.image,
        friendUserId: user.id,
      })
      .from(friends)
      .leftJoin(user, eq(friends.friendId, user.id))
      .where(eq(friends.userId, userId))
      .orderBy(desc(friends.createdAt));

    const friendsList = friendships.map((friendship) => ({
      friendshipId: friendship.friendshipId,
      friend: {
        id: friendship.friendUserId,
        name: friendship.friendName,
        email: friendship.friendEmail,
        image: friendship.friendImage,
      },
      createdAt: friendship.createdAt,
    }));

    return NextResponse.json(friendsList, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, friendId } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    if (!friendId) {
      return NextResponse.json({ 
        error: 'friendId is required',
        code: 'MISSING_FRIEND_ID' 
      }, { status: 400 });
    }

    if (userId === friendId) {
      return NextResponse.json({ 
        error: 'Cannot add yourself as a friend',
        code: 'SELF_FRIEND_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const friendExists = await db
      .select()
      .from(user)
      .where(eq(user.id, friendId))
      .limit(1);

    if (friendExists.length === 0) {
      return NextResponse.json({ 
        error: 'Friend user does not exist',
        code: 'FRIEND_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if friendship already exists (bidirectional)
    const existingFriendship = await db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
          and(eq(friends.userId, friendId), eq(friends.friendId, userId))
        )
      )
      .limit(1);

    if (existingFriendship.length > 0) {
      return NextResponse.json({ 
        error: 'Friendship already exists',
        code: 'DUPLICATE_FRIENDSHIP' 
      }, { status: 409 });
    }

    const now = Date.now();

    // Create BIDIRECTIONAL friendship
    await db.insert(friends).values([
      {
        userId,
        friendId,
        createdAt: now,
      },
      {
        userId: friendId,
        friendId: userId,
        createdAt: now,
      }
    ]);

    return NextResponse.json({ 
      message: 'Friendship created successfully (bidirectional)',
      userId,
      friendId
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid friendship ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const friendshipId = parseInt(id);

    // Check if friendship exists
    const existingFriendship = await db
      .select()
      .from(friends)
      .where(eq(friends.id, friendshipId))
      .limit(1);

    if (existingFriendship.length === 0) {
      return NextResponse.json({ 
        error: 'Friendship not found',
        code: 'FRIENDSHIP_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete friendship by ID
    const deleted = await db
      .delete(friends)
      .where(eq(friends.id, friendshipId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Friendship not found',
        code: 'FRIENDSHIP_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Friendship removed successfully',
      friendship: deleted[0] 
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}