import { Prisma } from '@/generated/prisma/client';
import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const slug = searchParams.get('slug');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '6');

  if (!productId && !slug) {
    return NextResponse.json(
      { error: 'Product ID or slug is required' },
      { status: 400 }
    );
  }

  const productWhere: Prisma.ProductWhereInput = {
    isDelete: false,
    ...(productId && { id: parseInt(productId) }),
    ...(slug && { slug }),
  };

  // Find the product first
  const product = await prisma.product.findFirst({
    where: productWhere,
    select: {
      id: true,
      categoryId: true,
      subCategoryId: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Find related products based on category and subcategory
  const relatedProducts = await prisma.product.findMany({
    where: {
      isDelete: false,
      id: { not: product.id },
      OR: [
        // Same subcategory (highest priority)
        ...(product.subCategoryId
          ? [{ subCategoryId: product.subCategoryId }]
          : []),
        // Same category
        { categoryId: product.categoryId },
      ],
    },
    take: limit,
    orderBy: [
      // Prioritize same subcategory
      ...(product.subCategoryId ? [{ subCategoryId: 'desc' as const }] : []),
      { createdAt: 'desc' as const },
    ],
    include: {
      category: true,
      subCategory: true,
      mainImage: true,
      alternativeImage: true,
      variants: {
        select: {
          price: true,
          quantity: true,
          color: { select: { name: true } },
          size: { select: { name: true } },
        },
      },
    },
  });

  // Add price aggregations
  const productsWithAggregations = await Promise.all(
    relatedProducts.map(async (p) => {
      const aggregation = await prisma.productVariant.aggregate({
        where: { productId: p.id },
        _min: { price: true },
        _max: { price: true },
        _sum: { quantity: true },
      });

      const minPrice = aggregation._min.price ?? 0;
      const maxPrice = aggregation._max.price ?? 0;
      const quantity = aggregation._sum.quantity ?? 0;
      const inStock = quantity > 0;

      return {
        title: p.title,
        slug: p.slug,
        mainImage: p.mainImage,
        alternativeImage: p.alternativeImage,
        category: p.category,
        subCategory: p.subCategory,
        minPrice,
        maxPrice,
        quantity,
        inStock,
      };
    })
  );

  return NextResponse.json({
    message: 'Related products fetched successfully',
    data: productsWithAggregations,
    meta: {
      page,
      limit,
      count: productsWithAggregations.length,
      totalPages: Math.ceil(productsWithAggregations.length / limit),
    },
  });
});
