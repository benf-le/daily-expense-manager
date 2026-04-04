import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        budgetLimit: true,
        currency: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
        ...user,
        avatar: user.avatar ? user.avatar.toString() : null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, budgetLimit, currency, password, avatar } = await req.json();

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (budgetLimit !== undefined) dataToUpdate.budgetLimit = parseFloat(budgetLimit);
    if (currency) dataToUpdate.currency = currency;
    if (avatar !== undefined) dataToUpdate.avatar = avatar;
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: { name: true, email: true, budgetLimit: true, currency: true, avatar: true },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Update profile error:', error);
    if (error.code === 'P2002' && error.meta?.target.includes('email')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
