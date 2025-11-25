import * as z from 'zod';

import { hashPassword } from '@/lib/bcrypt';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { UsersType } from '@/types/users.types';

const userSchema = z
  .object({
    name: z.string().optional(),
    email: z.email().optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN']).optional(),
    password: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { error, payload } = await authenticateRequest(request);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!id) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    await prisma.user.update({
      where: { id: +id, isDelete: false },
      data: { isDelete: true },
    });
    return NextResponse.json(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PATCH = catchAsyncNext<{ params: Promise<{ id: string }> }>(
  async (request, context) => {
    if (!context?.params) throw new Error('Missing params');
    const { id: userId } = await context.params;

    const { error, payload } = await authenticateRequest(request);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!userId) throw new Error('Missing userId parameter');

    const body = await request.json();
    const { id, ...rest } = body;
    const parsed = userSchema.parse(rest);

    const existingUser = await prisma.user.findUnique({ where: { id: +id } });
    if (!existingUser || existingUser.isDelete)
      throw new Error('User not found');

    const updateData: Partial<UsersType> = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.email !== undefined) updateData.email = parsed.email;
    if (parsed.role !== undefined)
      updateData.role = parsed.role as 'SUPER_ADMIN' | 'ADMIN';
    if (parsed.isActive !== undefined) updateData.isActive = parsed.isActive;
    if (parsed.password)
      updateData.password = await hashPassword(parsed.password);

    const updatedUser = await prisma.user.update({
      where: { id: +userId },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  }
);
