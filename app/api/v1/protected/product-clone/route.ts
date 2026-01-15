import { catchAsyncNext } from '@/lib/catch-async';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = catchAsyncNext(async (request: NextRequest) => {
  //   const { payload, error } = await authenticateRequest(request);

  //   if (error) return error;

  //   if (payload.role === 'CUSTOMER') {
  //     return NextResponse.json(
  //       { error: 'Unauthorized: Insufficient permissions' },
  //       { status: 403 }
  //     );
  //   }

  const { productId } = await request.json();
  const findProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      subCategory: true,
      mainImage: true,
      alternativeImage: true,
      variants: {
        select: {
          id: true,
          price: true,
          quantity: true,
          color: {
            select: {
              id: true,
              name: true,
            },
          },
          size: {
            select: {
              id: true,
              name: true,
            },
          },
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

  if (!findProduct) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (findProduct.isDelete) {
    return NextResponse.json(
      { error: 'Cannot clone a deleted product' },
      { status: 400 }
    );
  }

  const newSlug = `${findProduct.slug}-1`;
  const newCatalogId = `${findProduct.catalogId}-1`;

  const {
    id,
    createdAt,
    updatedAt,
    category,
    subCategory,
    mainImage,
    alternativeImage,
    variants,
    quantityDiscounts,
    gallery,
    ...productData
  } = findProduct;

  const payload = {
    ...productData,
    slug: newSlug,
    catalogId: newCatalogId,
    categoryId: findProduct.category?.id || null,
    subCategoryId: findProduct.subCategory?.id || null,
    mainImageId: findProduct.mainImage?.id || null,
    alternativeImageId: findProduct.alternativeImage?.id || null,
    variants: {
      create: findProduct.variants.map((variant) => ({
        price: variant.price,
        quantity: variant.quantity,
        colorId: variant.color?.id || null,
        sizeId: variant.size?.id || null,
      })),
    },
    quantityDiscounts: {
      create:
        findProduct.quantityDiscounts.map((discount) => ({
          minQty: discount.minQty,
          maxQty: discount.maxQty,
          amount: discount.amount,
          note: discount.note || '',
        })) || [],
    },
    ...(findProduct.gallery &&
      findProduct.gallery.length > 0 && {
        gallery: {
          create: findProduct.gallery.map((image) => ({
            mediaId: image.media?.id,
          })),
        },
      }),
  };

  const newProduct = await prisma.product.create({
    data: payload,
  });

  return NextResponse.json(
    {
      success: true,
      message: 'Product cloned successfully',
      data: {
        title: newProduct.title,
        slug: newProduct.slug,
        catalogId: newProduct.catalogId,
        id: newProduct.id,
      },
    },
    { status: 201 }
  );
});
