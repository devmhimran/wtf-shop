import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = {
  slug: string;
};

export const GET = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { slug } = await context.params;

    if (typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid product Slug' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug, isDelete: false },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        flatDiscount: true,
        twoSidePrice: true,
        additionalDesc: true,
        catalogId: true,
        categoryId: true,
        subCategoryId: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        subCategory: true,
        mainImage: true,
        alternativeImage: true,
        productType: true,
        metaTitle: true,
        metaDescription: true,
        metaKeyword: true,

        variants: {
          select: {
            id: true,
            price: true,
            quantity: true,
            color: { select: { id: true, name: true } },
            size: { select: { id: true, name: true } },
          },
        },

        quantityDiscounts: true,

        gallery: {
          select: {
            media: {
              select: {
                id: true,
                title: true,
                alt: true,
                fileUrl: true,
                fileName: true,
                createdById: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate aggregated fields
    const aggregation = await prisma.productVariant.aggregate({
      where: { productId: product.id },
      _min: { price: true },
      _max: { price: true },
      _sum: { quantity: true },
    });

    const minPrice = aggregation._min.price ?? 0;
    const maxPrice = aggregation._max.price ?? 0;
    const quantity = aggregation._sum.quantity ?? 0;
    const inStock = quantity > 0;

    // Flatten gallery structure
    // const gallery =
    //   (product.gallery as Omit<MediaType, ''>[])?.map((g) => ({
    //     id: g.media.id,
    //     title: g.media.title,
    //     alt: g.media.alt,
    //     fileUrl: g.media.fileUrl,
    //     fileName: g.media.fileName,
    //   })) || [];

    return NextResponse.json({
      success: true,
      message: 'Product fetched successfully',
      data: {
        ...product,
        gallery: product.gallery,
        minPrice,
        maxPrice,
        quantity,
        inStock,
      },
    });
  }
);
