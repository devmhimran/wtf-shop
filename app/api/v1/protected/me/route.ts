export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { error, payload } = await authenticateRequest(request);
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        orders: {
          select: {
            id: true,
            customNote: true,
            createdAt: true,
            updatedAt: true,
            items: {
              select: {
                id: true,
                quantity: true,
                price: true,
                total: true,
                product: {
                  select: {
                    id: true,
                    title: true,
                    mainImage: true,
                  },
                },
                variant: {
                  select: {
                    id: true,
                    color: {
                      select: {
                        name: true,
                        hex: true,
                      },
                    },
                    size: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            customImages: {
              select: {
                id: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const responseData = {
      message: 'Protected data',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ...(user.role === 'CUSTOMER' && { orders: user.orders }),
      },
    };

    const response = NextResponse.json(responseData, { status: 200 });
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
