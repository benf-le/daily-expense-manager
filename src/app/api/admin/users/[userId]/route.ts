import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        budgetLimit: true,
        currency: true,
        createdAt: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();

    // Monthly data for charts (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthIncome = await prisma.income.aggregate({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      });

      const monthOutcome = await prisma.outcome.aggregate({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      });

      const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      monthlyData.push({
        month: monthNames[monthStart.getMonth()],
        income: monthIncome._sum.amount || 0,
        outcome: monthOutcome._sum.amount || 0,
      });
    }

    // Recent transactions (last 20)
    const recentIncomes = await prisma.income.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
      select: { id: true, title: true, amount: true, category: true, date: true, description: true },
    });

    const recentOutcomes = await prisma.outcome.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
      select: { id: true, title: true, amount: true, category: true, date: true, description: true },
    });

    const transactions = [
      ...recentIncomes.map((i) => ({ ...i, type: 'income' as const })),
      ...recentOutcomes.map((o) => ({ ...o, type: 'outcome' as const })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

    return NextResponse.json({
      user: targetUser,
      monthlyData,
      transactions,
    });
  } catch (error) {
    console.error('Fetch user detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await req.json();

    if (!body.password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

