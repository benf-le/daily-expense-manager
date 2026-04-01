import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/incomes/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const income = await prisma.income.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!income) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error('Get income error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/incomes/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { title, amount, category, description, date } = await req.json();

    // Check ownership
    const existing = await prisma.income.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const income = await prisma.income.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
      },
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error('Update income error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/incomes/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.income.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.income.delete({ where: { id } });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete income error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
