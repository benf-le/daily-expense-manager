import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/stats - Get statistics for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Total income & outcome (all time)
    const totalIncome = await prisma.income.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const totalOutcome = await prisma.outcome.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    // This month stats
    const monthlyIncome = await prisma.income.aggregate({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const monthlyOutcome = await prisma.outcome.aggregate({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    // Transaction count
    const incomeCount = await prisma.income.count({ where: { userId } });
    const outcomeCount = await prisma.outcome.count({ where: { userId } });

    // Get user budget
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { budgetLimit: true },
    });

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

    // Recent transactions (last 10)
    const recentIncomes = await prisma.income.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
      select: { id: true, title: true, amount: true, category: true, date: true },
    });

    const recentOutcomes = await prisma.outcome.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
      select: { id: true, title: true, amount: true, category: true, date: true },
    });

    const recentTransactions = [
      ...recentIncomes.map((i) => ({ ...i, type: 'income' as const })),
      ...recentOutcomes.map((o) => ({ ...o, type: 'outcome' as const })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    // Budget alert
    const monthlyOutcomeAmount = monthlyOutcome._sum.amount || 0;
    const budgetLimit = user?.budgetLimit || 5000000;
    const budgetPercent = Math.round((monthlyOutcomeAmount / budgetLimit) * 100);
    const budgetStatus = budgetPercent >= 100 ? 'exceeded' : budgetPercent >= 80 ? 'warning' : 'safe';

    return NextResponse.json({
      totalIncome: totalIncome._sum.amount || 0,
      totalOutcome: totalOutcome._sum.amount || 0,
      balance: (totalIncome._sum.amount || 0) - (totalOutcome._sum.amount || 0),
      monthlyIncome: monthlyIncome._sum.amount || 0,
      monthlyOutcome: monthlyOutcomeAmount,
      transactionCount: incomeCount + outcomeCount,
      budgetLimit,
      budgetPercent,
      budgetStatus,
      budgetRemaining: budgetLimit - monthlyOutcomeAmount,
      monthlyData,
      recentTransactions,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
