import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/outcomes/[id]
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
    const outcome = await prisma.outcome.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!outcome) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(outcome);
  } catch (error) {
    console.error('Get outcome error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/outcomes/[id]
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

    const existing = await prisma.outcome.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const outcome = await prisma.outcome.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
      },
    });

    return NextResponse.json(outcome);
  } catch (error) {
    console.error('Update outcome error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/outcomes/[id]
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

    const existing = await prisma.outcome.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.outcome.delete({ where: { id } });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete outcome error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
