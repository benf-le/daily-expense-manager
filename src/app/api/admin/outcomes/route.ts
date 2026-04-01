import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/outcomes - List ALL outcomes from ALL users (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

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
    console.error('Admin get outcomes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
