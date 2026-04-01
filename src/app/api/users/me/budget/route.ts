import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { budgetLimit: true },
    });

    return NextResponse.json({ budgetLimit: user?.budgetLimit ?? 0 });
  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { budgetLimit } = await req.json();
    const parsedBudgetLimit = Number(budgetLimit);

    if (!Number.isFinite(parsedBudgetLimit) || parsedBudgetLimit <= 0) {
      return NextResponse.json(
        { error: 'Budget limit must be greater than 0' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { budgetLimit: parsedBudgetLimit },
      select: { budgetLimit: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
