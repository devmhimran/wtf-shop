import { Prisma } from '@/generated/prisma/client';
import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category');
  const subCategory = searchParams.get('subCategory');
  const priceOrder = searchParams.get('price');

  const skip = (page - 1) * limit;

  const productWhere: Prisma.ProductWhereInput = {
    isDelete: false,
    isActive: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { catalogId: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(category && category !== 'all' && { categoryId: parseInt(category) }),
    ...(subCategory &&
      subCategory !== 'all' && { subCategoryId: parseInt(subCategory) }),
  };

  const productIds = (
    await prisma.product.findMany({
      where: productWhere,
      select: { id: true },
    })
  ).map((p) => p.id);

  if (productIds.length === 0) {
    return NextResponse.json({
      message: 'Products fetched successfully',
      data: [],
      meta: {
        page,
        limit,
        count: 0,
        totalPages: 0,
      },
    });
  }

  const aggregated = await prisma.productVariant.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds } },
    _min: { price: true },
    _max: { price: true },
    _sum: { quantity: true },
  });

  let sorted = aggregated;
  if (priceOrder && priceOrder !== 'all') {
    if (priceOrder === 'LOW_TO_HIGH') {
      sorted = aggregated.sort(
        (a, b) => (a._min.price ?? 0) - (b._min.price ?? 0)
      );
    } else if (priceOrder === 'HIGH_TO_LOW') {
      sorted = aggregated.sort(
        (a, b) => (b._max.price ?? 0) - (a._max.price ?? 0)
      );
    }
  }

  const pageItems = sorted.slice(skip, skip + limit);

  const pageProductIds = pageItems
    .map((p) => p.productId)
    .filter((id): id is number => id !== null);

  const products = await prisma.product.findMany({
    where: { id: { in: pageProductIds } },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      subCategory: {
        select: {
          name: true,
          slug: true,
        },
      },
      mainImage: true,
      alternativeImage: true,
    },
  });

  const merged = pageItems.map((aggr) => {
    const product = products.find((p) => p.id === aggr.productId);

    return {
      id: product?.id,
      title: product?.title,
      slug: product?.slug,
      mainImage: product?.mainImage,
      alternativeImage: product?.alternativeImage,
      category: product?.category,
      subCategory: product?.subCategory,
      minPrice: aggr._min.price ?? 0,
      maxPrice: aggr._max.price ?? 0,
      inStock: (aggr._sum.quantity ?? 0) > 0,
    };
  });

  return NextResponse.json({
    message: 'Products fetched successfully',
    data: merged,
    meta: {
      page,
      limit,
      count: productIds.length,
      totalPages: Math.ceil(productIds.length / limit),
    },
  });
});
