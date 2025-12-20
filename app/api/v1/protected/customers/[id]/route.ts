import * as z from 'zod';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextResponse } from 'next/server';
import { CustomersType } from '@/types';
import { hashPassword } from '@/lib/bcrypt';

const userSchema = z
  .object({
    name: z.string().optional(),
    email: z.email().optional(),
    password: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

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
      throw new Error('Customer not found');

    const updateData: Partial<CustomersType> = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.email !== undefined) updateData.email = parsed.email;

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
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedUser,
    });
  }
);
