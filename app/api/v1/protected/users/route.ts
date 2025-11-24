import * as z from 'zod';

import { $Enums, Prisma } from '@/generated/prisma/client';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/bcrypt';

const userSchema = z
  .object({
    name: z
      .string()
      .min(4, { message: 'Name must be at least 4 characters long' }),
    email: z.email(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN']),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    isActive: z.boolean(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search') || '';
  const page = searchParams.get('page') || '1';
  const status = searchParams.get('status') || '';
  const role = searchParams.get('role') || '';
  const limit = searchParams.get('limit') || '100';

  const whereConditions: Prisma.UserWhereInput[] = [];

  whereConditions.push({ isDelete: false });
  whereConditions.push({ role: { in: ['ADMIN', 'SUPER_ADMIN'] } });

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

    return NextResponse.json(
      {
        success: true,
        data: users,
        meta: {
          meta: { count, totalPages, page: Number(page), limit: Number(limit) },
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = catchAsyncNext(async (request: NextRequest) => {
  const { error, payload } = await authenticateRequest(request);
  if (error) return error;

  if (payload.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = userSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.email },
  });
  if (existingUser && !existingUser.isDelete) {
    return NextResponse.json(
      { error: 'User with this email already exists' },
      { status: 400 }
    );
  }
  const hashedPassword = await hashPassword(parsed.password);
  const newUser = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role as 'SUPER_ADMIN' | 'ADMIN',
      password: hashedPassword,
      isActive: parsed.isActive,
    },
  });

  const {
    password,
    refreshToken,
    refreshTokenUpdatedAt,
    ...userWithoutPassword
  } = newUser;

  return NextResponse.json(
    {
      message: 'Successfully created user',
      data: userWithoutPassword,
    },
    { status: 201 }
  );
});
