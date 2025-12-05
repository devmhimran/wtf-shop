import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

const updateProductSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters long' })
      .max(200, { message: 'Title must not exceed 200 characters' })
      .optional(),
    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters long' })
      .refine(
        (val) => {
          const strippedText = val.replace(/<[^>]*>/g, '').trim();
          return strippedText.length > 0;
        },
        { message: 'Description cannot be empty.' }
      )
      .optional(),
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
      )
      .optional(),
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
      )
      .optional(),
    slug: z
      .string()
      .min(3, { message: 'Slug must be at least 3 characters long' })
      .max(200, { message: 'Slug must not exceed 200 characters' })
      .regex(/^[a-z0-9-]+$/, {
        message:
          'Slug must contain only lowercase letters, numbers, and hyphens',
      })
      .optional(),
    catalogId: z
      .string()
      .min(3, { message: 'Catalog ID must be at least 3 characters long' })
      .max(100, { message: 'Catalog ID must not exceed 100 characters' })
      .optional()
      .nullable(),
    discountNote: z.string().optional().nullable(),
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
    metaKeyword: z.array(z.string()).optional(),
    isNew: z.boolean().optional(),
    category: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .optional(),
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
          id: z.number().optional(), // For existing variants
          colorId: z.number(),
          colorName: z.string(),
          sizeId: z.number(),
          sizeName: z.string(),
          quantity: z.number().int().min(0),
          price: z.number().min(0),
        })
      )
      .optional(),
    quantityDiscounts: z
      .array(
        z.object({
          id: z.number().optional(), // For existing discounts
          minQty: z.number().int().min(1),
          maxQty: z.number().int().min(1),
          amount: z.number().min(0),
          note: z.string().optional().nullable(),
        })
      )
      .optional(),
    featuredImage: z
      .object({
        id: z.number(),
        fileUrl: z.string(),
        fileName: z.string(),
      })
      .optional(),
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

type RouteParams = {
  id: string;
};

export const DELETE = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id: productId } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const id = Number(productId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: { id },
      data: { isDelete: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  }
);

export const PUT = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id: productId } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    // Only ADMIN and SUPER_ADMIN can update products
    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const id = Number(productId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        quantityDiscounts: true,
        gallery: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = updateProductSchema.parse(body);

    // Check slug uniqueness if slug is being updated
    if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update product with transaction
    await prisma.$transaction(async (tx) => {
      // Update basic product fields
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(validatedData.title && { title: validatedData.title }),
          ...(validatedData.description && {
            description: validatedData.description,
          }),
          ...(validatedData.shortDescription && {
            shortDescription: validatedData.shortDescription,
          }),
          ...(validatedData.additionalDesc && {
            additionalDesc: validatedData.additionalDesc,
          }),
          ...(validatedData.slug && { slug: validatedData.slug }),
          ...(validatedData.catalogId !== undefined && {
            catalogId: validatedData.catalogId,
          }),
          ...(validatedData.discountNote !== undefined && {
            discountNote: validatedData.discountNote,
          }),
          ...(validatedData.metaTitle !== undefined && {
            metaTitle: validatedData.metaTitle,
          }),
          ...(validatedData.metaDescription !== undefined && {
            metaDescription: validatedData.metaDescription,
          }),
          ...(validatedData.metaKeyword && {
            metaKeyword: validatedData.metaKeyword.join(', '),
          }),
          ...(validatedData.isNew !== undefined && {
            isNew: validatedData.isNew,
          }),
          ...(validatedData.category && {
            categoryId: validatedData.category.id,
          }),
          ...(validatedData.subCategory !== undefined && {
            subCategoryId: validatedData.subCategory?.id || null,
          }),
          ...(validatedData.featuredImage && {
            mainImageId: validatedData.featuredImage.id,
          }),
          ...(validatedData.alternativeImage !== undefined && {
            alternativeImageId: validatedData.alternativeImage?.id || null,
          }),
        },
      });

      // Update variants if provided
      if (validatedData.variants) {
        // Delete old variants
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        // Create new variants
        await tx.productVariant.createMany({
          data: validatedData.variants.map((variant) => ({
            productId: id,
            colorId: variant.colorId,
            sizeId: variant.sizeId,
            price: variant.price,
            quantity: variant.quantity,
          })),
        });
      }

      // Update quantity discounts if provided
      if (validatedData.quantityDiscounts) {
        // Delete old quantity discounts
        await tx.quantityDiscount.deleteMany({
          where: { productId: id },
        });

        // Create new quantity discounts
        if (validatedData.quantityDiscounts.length > 0) {
          await tx.quantityDiscount.createMany({
            data: validatedData.quantityDiscounts.map((discount) => ({
              productId: id,
              minQty: discount.minQty,
              maxQty: discount.maxQty,
              amount: discount.amount,
              note: discount.note || null,
            })),
          });
        }
      }

      // Update gallery images if provided
      if (validatedData.galleryImages) {
        // Delete old gallery images
        await tx.productGallery.deleteMany({
          where: { productId: id },
        });

        // Create new gallery images
        if (validatedData.galleryImages.length > 0) {
          await tx.productGallery.createMany({
            data: validatedData.galleryImages.map((image) => ({
              productId: id,
              mediaId: image.id,
            })),
          });
        }
      }

      return product;
    });

    // Fetch the updated product with all relations
    const productWithRelations = await prisma.product.findUnique({
      where: { id },
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
        quantityDiscounts: true,
        gallery: {
          include: {
            media: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: productWithRelations,
    });
  }
);

export const GET = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    return NextResponse.json({
      message: 'GET product by ID not implemented yet',
    });
  }
);
