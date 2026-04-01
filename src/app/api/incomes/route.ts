import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/incomes - List incomes for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { userId: session.user.id };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(incomes);
  } catch (error) {
    console.error('Get incomes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/incomes - Create a new income
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, amount, category, description, date } = await req.json();

    if (!title || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const income = await prisma.income.create({
      data: {
        title,
        amount: parseFloat(amount),
        category,
        description: description || '',
        date: new Date(date),
        userId: session.user.id,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error('Create income error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
