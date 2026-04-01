import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/stats - Get statistics across ALL users (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();

    // Overall totals
    const totalIncome = await prisma.income.aggregate({ _sum: { amount: true } });
    const totalOutcome = await prisma.outcome.aggregate({ _sum: { amount: true } });

    // User count
    const userCount = await prisma.user.count();
    const incomeCount = await prisma.income.count();
    const outcomeCount = await prisma.outcome.count();

    // Per-user stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        budgetLimit: true,
        incomes: { select: { amount: true } },
        outcomes: { select: { amount: true } },
      },
    });

    const userStats = users.map((u) => {
      const totalInc = u.incomes.reduce((sum, i) => sum + i.amount, 0);
      const totalOut = u.outcomes.reduce((sum, o) => sum + o.amount, 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        totalIncome: totalInc,
        totalOutcome: totalOut,
        balance: totalInc - totalOut,
        budgetLimit: u.budgetLimit,
      };
    });

    // Monthly data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthIncome = await prisma.income.aggregate({
        where: { date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      });

      const monthOutcome = await prisma.outcome.aggregate({
        where: { date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      });

      const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      monthlyData.push({
        month: monthNames[monthStart.getMonth()],
        income: monthIncome._sum.amount || 0,
        outcome: monthOutcome._sum.amount || 0,
      });
    }

    return NextResponse.json({
      totalIncome: totalIncome._sum.amount || 0,
      totalOutcome: totalOutcome._sum.amount || 0,
      balance: (totalIncome._sum.amount || 0) - (totalOutcome._sum.amount || 0),
      userCount,
      incomeCount,
      outcomeCount,
      userStats,
      monthlyData,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
