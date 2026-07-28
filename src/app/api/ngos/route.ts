import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ngos } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single NGO by ID
    if (id) {
      const ngoId = parseInt(id);
      
      if (isNaN(ngoId)) {
        return NextResponse.json(
          { 
            error: "Valid ID is required",
            code: "INVALID_ID" 
          },
          { status: 400 }
        );
      }

      const ngo = await db.select()
        .from(ngos)
        .where(eq(ngos.id, ngoId))
        .limit(1);

      if (ngo.length === 0) {
        return NextResponse.json(
          { 
            error: 'NGO not found',
            code: 'NGO_NOT_FOUND' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json(ngo[0], { status: 200 });
    }

    // List all active NGOs with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { 
          error: "Invalid limit parameter",
          code: "INVALID_LIMIT" 
        },
        { status: 400 }
      );
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { 
          error: "Invalid offset parameter",
          code: "INVALID_OFFSET" 
        },
        { status: 400 }
      );
    }

    const activeNgos = await db.select()
      .from(ngos)
      .where(eq(ngos.active, true))
      .orderBy(asc(ngos.name))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(activeNgos, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}