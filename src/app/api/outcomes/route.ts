import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/outcomes - List outcomes for the current user
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

    const outcomes = await prisma.outcome.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(outcomes);
  } catch (error) {
    console.error('Get outcomes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/outcomes - Create a new outcome
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, amount, category, description, date } = await req.json();

    if (!title || !amount || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const outcome = await prisma.outcome.create({
      data: {
        title,
        amount: parseFloat(amount),
        category,
        description: description || '',
        date: new Date(date),
        userId: session.user.id,
      },
    });

    return NextResponse.json(outcome, { status: 201 });
  } catch (error) {
    console.error('Create outcome error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
