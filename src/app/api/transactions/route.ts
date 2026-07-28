import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions, milesHistory, userProfile, savings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, session.userId))
      .orderBy(desc(transactions.date));

    return NextResponse.json({ transactions: userTransactions }, { status: 200 });
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

    const body = await request.json();
    const { amount, description, type, postponed } = body;

    if (!amount || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = Date.now();
    let milesEarned = 0;

    // Se for despesa adiada, NÃO criar transação (não foi gasto!)
    if (type === 'expense' && postponed) {
      // Buscar perfil do usuário
      let profile = await db.query.userProfile.findFirst({
        where: (profiles, { eq }) => eq(profiles.userId, session.userId),
      });

      // Se não existir perfil, criar um
      if (!profile) {
        const newProfile = await db.insert(userProfile).values({
          userId: session.userId,
          totalMiles: 0,
          fundBalance: 0,
          monthlyReturn: 0,
          accountCreatedAt: now,
          consistencyScore: 100,
          accountAge: 0,
          totalSavings: 0,
          totalDonations: 0,
        }).returning();
        profile = newProfile[0];
      }

      // Calcular milhas baseado no valor economizado
      // Sistema proporcional: R$ 1 economizado = 1 milha
      milesEarned = Math.round(amount);

      // Registrar milhas como LIBERADAS IMEDIATAMENTE
      await db.insert(milesHistory).values({
        userId: session.userId,
        milesEarned,
        reason: `Compra adiada: ${description}`,
        source: 'postponed_expense',
        createdAt: now,
        status: 'released',
        releasedAt: now,
      });

      // Atualizar perfil do usuário - ADICIONAR MILHAS IMEDIATAMENTE
      await db
        .update(userProfile)
        .set({
          dailyDesistCount: (profile?.dailyDesistCount || 0) + 1,
          weeklyDesistCount: (profile?.weeklyDesistCount || 0) + 1,
          totalSavings: (profile?.totalSavings || 0) + amount,
          totalMiles: (profile?.totalMiles || 0) + milesEarned,
        })
        .where(eq(userProfile.userId, session.userId));

      // Registrar economia na tabela savings
      await db.insert(savings).values({
        userId: session.userId,
        amount,
        date: now,
        cancelled: false,
        milesEarned,
        createdAt: now,
      });

      // Verificar conquistas automaticamente
      try {
        await fetch(`${request.nextUrl.origin}/api/achievements/check`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: session.userId }),
        });
      } catch (error) {
        console.error('Erro ao verificar conquistas:', error);
      }

      // Retornar SEM criar transação
      return NextResponse.json(
        {
          transaction: null,
          milesEarned,
          message: `Compra adiada! Você ganhou ${milesEarned} milhas e NÃO gastou o dinheiro.`,
        },
        { status: 201 }
      );
    }

    // Para receitas ou despesas normais (não adiadas), criar transação normalmente
    const newTransaction = await db
      .insert(transactions)
      .values({
        userId: session.userId,
        amount,
        description,
        type,
        date: now,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(
      {
        transaction: newTransaction[0],
        milesEarned: 0,
        message: 'Transação registrada com sucesso.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: 'Valid transaction ID is required' },
        { status: 400 }
      );
    }

    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, parsedId))
      .limit(1);

    if (existingTransaction.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Verificar se a transação pertence ao usuário
    if (existingTransaction[0].userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const deleted = await db
      .delete(transactions)
      .where(eq(transactions.id, parsedId))
      .returning();

    return NextResponse.json(
      {
        message: 'Transaction deleted successfully',
        transaction: deleted[0],
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