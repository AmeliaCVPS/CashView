import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required',
        code: 'MISSING_EMAIL' 
      }, { status: 400 });
    }

    // Search for user by email
    const foundUser = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.email, email.toLowerCase().trim()))
      .limit(1);

    if (foundUser.length === 0) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado com este email',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(foundUser[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}
