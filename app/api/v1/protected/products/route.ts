import { Prisma } from '@/generated/prisma/client';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

const productSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters long' })
      .max(200, { message: 'Title must not exceed 200 characters' }),
    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters long' })
      .refine(
        (val) => {
          const strippedText = val.replace(/<[^>]*>/g, '').trim();
          return strippedText.length > 0;
        },
        { message: 'Description cannot be empty.' }
      ),
    shortDescription: z
      .string()
      .min(10, {
        message: 'Short Description must be at least 10 characters long',
      })
      .refine(
        (val) => {
          const strippedText = val.replace(/<[^>]*>/g, '').trim();
          return strippedText.length > 0;
        },
        { message: 'Short Description cannot be empty.' }
      ),
    additionalDesc: z
      .string()
      .min(10, {
        message: 'Additional Description must be at least 10 characters long',
      })
      .refine(
        (val) => {
          const strippedText = val.replace(/<[^>]*>/g, '').trim();
          return strippedText.length > 0;
        },
        { message: 'Additional Description cannot be empty.' }
      ),
    slug: z
      .string()
      .min(3, { message: 'Slug must be at least 3 characters long' })
      .max(200, { message: 'Slug must not exceed 200 characters' })
      .regex(/^[a-z0-9-]+$/, {
        message:
          'Slug must contain only lowercase letters, numbers, and hyphens',
      }),
    catalogId: z
      .string()
      .min(3, { message: 'Catalog ID must be at least 3 characters long' })
      .max(100, { message: 'Catalog ID must not exceed 100 characters' })
      .optional(),
    discountNote: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeyword: z.array(z.string()).optional(),
    isNew: z.boolean().optional(),
    category: z.object({
      id: z.number(),
      name: z.string(),
    }),
    subCategory: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .nullable()
      .optional(),
    variants: z
      .array(
        z.object({
          colorId: z.number(),
          colorName: z.string(),
          sizeId: z.number(),
          sizeName: z.string(),
          quantity: z.number().int().min(1),
          price: z.number().min(0),
        })
      )
      .min(1, { message: 'At least one variant is required.' }),
    quantityDiscounts: z
      .array(
        z.object({
          minQty: z.number().int().min(1),
          maxQty: z.number().int().min(1),
          amount: z.number().min(0),
          note: z.string().optional(),
        })
      )
      .optional(),
    featuredImage: z.object({
      id: z.number(),
      fileUrl: z.string(),
      fileName: z.string(),
    }),
    alternativeImage: z
      .object({
        id: z.number(),
        fileUrl: z.string(),
        fileName: z.string(),
      })
      .nullable()
      .optional(),
    galleryImages: z
      .array(
        z.object({
          id: z.number(),
          fileUrl: z.string(),
          fileName: z.string(),
        })
      )
      .optional(),
  })
  .strict();

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error } = await authenticateRequest(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId');
  const subCategoryId = searchParams.get('subCategoryId');

  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    isDelete: false,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { catalogId: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(categoryId && { categoryId: parseInt(categoryId) }),
    ...(subCategoryId && { subCategoryId: parseInt(subCategoryId) }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subCategory: true,
        mainImage: true,
        alternativeImage: true,
        variants: {
          select: {
            price: true,
            quantity: true,
            color: {
              select: {
                name: true,
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
    }),
    prisma.product.count({ where }),
  ]);

  // Add aggregated fields using database aggregation for each product
  const productsWithAggregations = await Promise.all(
    products.map(async (product) => {
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

      return {
        ...product,
        minPrice,
        maxPrice,
        quantity,
        inStock,
      };
    })
  );

  return NextResponse.json({
    message: 'Products fetched successfully',
    data: productsWithAggregations,
    meta: {
      page,
      limit,
      count: total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  // Only ADMIN and SUPER_ADMIN can create products
  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const validatedData = productSchema.parse(body);

  const existingProduct = await prisma.product.findUnique({
    where: { slug: validatedData.slug },
  });

  if (existingProduct) {
    return NextResponse.json(
      { message: 'Product with this slug already exists' },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      title: validatedData.title,
      description: validatedData.description,
      shortDescription: validatedData.shortDescription,
      additionalDesc: validatedData.additionalDesc,
      slug: validatedData.slug,
      metaTitle: validatedData.metaTitle || null,
      metaDescription: validatedData.metaDescription || null,
      metaKeyword: validatedData.metaKeyword?.join(', ') || null,
      isNew: validatedData.isNew || false,
      catalogId: validatedData.catalogId || null,
      categoryId: validatedData.category.id,
      subCategoryId: validatedData.subCategory?.id || null,
      mainImageId: validatedData.featuredImage.id,
      alternativeImageId: validatedData.alternativeImage?.id || null,
      createdById: payload.userId,
      productType: 'STANDARD',
      variants: {
        create: validatedData.variants.map((variant) => ({
          colorId: variant.colorId,
          sizeId: variant.sizeId,
          price: variant.price,
          quantity: variant.quantity,
        })),
      },
      quantityDiscounts: {
        create:
          validatedData.quantityDiscounts?.map((discount) => ({
            minQty: discount.minQty,
            maxQty: discount.maxQty,
            amount: discount.amount,
            note: discount.note || null,
          })) || [],
      },
      ...(validatedData.galleryImages &&
        validatedData.galleryImages.length > 0 && {
          gallery: {
            create: validatedData.galleryImages.map((image) => ({
              mediaId: image.id,
            })),
          },
        }),
    },
    include: {
      category: true,
      subCategory: true,
      mainImage: true,
      alternativeImage: true,
      variants: {
        include: {
          color: true,
          size: true,
        },
      },
      gallery: {
        include: {
          media: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      message: 'Product created successfully',
      data: product,
    },
    { status: 201 }
  );
});
