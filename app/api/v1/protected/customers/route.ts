import { $Enums, Prisma } from '@/generated/prisma/client';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search') || '';
  const page = searchParams.get('page') || '1';
  const status = searchParams.get('status') || '';
  const role = searchParams.get('role') || '';
  const limit = searchParams.get('limit') || '100';

  const whereConditions: Prisma.UserWhereInput[] = [];

  whereConditions.push({ isDelete: false });
  whereConditions.push({ role: { in: ['CUSTOMER'] } });

  if (search) {
    whereConditions.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  if (status) {
    const isActive = status === 'active' ? true : false;
    whereConditions.push({ isActive });
  }

  if (role) {
    whereConditions.push({ role: role as $Enums.UserRole });
  }

  const where: Prisma.UserWhereInput = whereConditions.length
    ? { AND: whereConditions }
    : {};

  try {
    const { error, payload } = await authenticateRequest(request);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const count = await prisma.user.count({ where });
    const totalPages = Math.ceil(count / Number(limit));
    const users = await prisma.user.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        data: users,
        meta: { count, totalPages, page: Number(page), limit: Number(limit) },
      },
      { status: 200 }
    );

    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
