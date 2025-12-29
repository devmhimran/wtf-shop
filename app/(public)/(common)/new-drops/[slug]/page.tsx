import { ProductDetailsContent } from '@/components/public-pages/product-details';
import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Metadata } from 'next';
import { PublicProductDetailsType } from '@/types';
import Head from 'next/head';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
  let product: PublicProductDetailsType | null = null;

  try {
    const response = await productApi.public.products.getSingleProduct(slug);
    product = response.data?.data || null;
  } catch (error) {
    console.error('Failed to fetch product for metadata:', error);
  }

  if (!product) {
    return {
      title: 'Product Not Found | What the Funk',
      description: 'The product you are looking for could not be found.',
    };
  }

  // Use custom meta fields if available, otherwise use product data
  const title = product.metaTitle
    ? `${product.metaTitle} | What the Funk`
    : product.title
    ? `${product.title} | What the Funk`
    : 'Product Details | What the Funk';

  const description =
    product.metaDescription ||
    product.shortDescription ||
    product.description ||
    `Shop ${product.title} from What the Funk. Premium Australian streetwear with free shipping over $100.`;

  // Parse metaKeyword - it's a comma-separated string from backend
  let keywords: string[] = [
    'what the funk',
    'australian streetwear',
    'premium apparel',
    'custom t-shirts',
  ];

  if (product.metaKeyword) {
    const metaKeywords = product.metaKeyword
      .split(',')
      .map((k: string) => k.trim())
      .filter(Boolean);
    keywords = [...keywords, ...metaKeywords];
  } else {
    // Fallback to category, subcategory, and title
    keywords.push(
      product.category?.name?.toLowerCase() || '',
      product.subCategory?.name?.toLowerCase() || '',
      product.title?.toLowerCase() || ''
    );
  }

  keywords = keywords.filter(Boolean);

  const productUrl = `${process.env.Next_PUBLIC_BASE_SITE_URL}/new-drops/${slug}`;
  const imageUrl = product.mainImage?.fileUrl
    ? product.mainImage.fileUrl
    : `${process.env.Next_PUBLIC_BASE_SITE_URL}/default-product-image.jpg`;

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical: productUrl,
    },

    openGraph: {
      title,
      description,
      url: productUrl,
      type: 'website',
      locale: 'en_AU',
      siteName: 'What the Funk',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.title,
        },
        ...(product.alternativeImage?.fileUrl
          ? [
              {
                url: product.alternativeImage.fileUrl,
                width: 1200,
                height: 1200,
                alt: `${product.title} - Alternative view`,
              },
            ]
          : []),
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Function to create comprehensive JSON-LD for product details
async function createProductJsonLd(slug: string) {
  let product: PublicProductDetailsType | null = null;

  try {
    const response = await productApi.public.products.getSingleProduct(slug);
    product = response.data?.data || null;
  } catch (error) {
    console.error('Failed to fetch product for JSON-LD:', error);
    return null;
  }

  if (!product) return null;

  const productUrl = `${process.env.Next_PUBLIC_BASE_SITE_URL}/new-drops/${slug}`;
  const imageUrl = product.mainImage?.fileUrl || '';

  // Collect all product images
  const productImages = [
    imageUrl,
    ...(product.alternativeImage?.fileUrl
      ? [product.alternativeImage.fileUrl]
      : []),
    ...(product.gallery?.map((g) => g.media?.fileUrl).filter(Boolean) || []),
  ];

  // Calculate aggregated rating (you can modify this based on actual reviews if available)
  const hasReviews = false; // Set to true if you have review data
  const aggregateRating = hasReviews
    ? {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: '1',
      }
    : undefined;

  // Build breadcrumb
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: process.env.Next_PUBLIC_BASE_SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'New Drops',
      item: `${process.env.Next_PUBLIC_BASE_SITE_URL}/new-drops`,
    },
  ];

  if (product.category) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: product.category.name,
      item: `${process.env.Next_PUBLIC_BASE_SITE_URL}/new-drops?category=${product.category.slug}`,
    });
  }

  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: product.title,
    item: productUrl,
  });

  // Build offers array with variants
  const offers = product.variants.map((variant) => ({
    '@type': 'Offer',
    price: variant.price.toString(),
    priceCurrency: 'AUD',
    availability:
      variant.quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    url: productUrl,
    priceValidUntil: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    )
      .toISOString()
      .split('T')[0],
    seller: {
      '@type': 'Organization',
      name: 'What the Funk',
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Product Schema
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.title,
        description: product.description || product.shortDescription,
        image: productImages,
        sku: product.catalogId || `WTF-${product.id}`,
        brand: {
          '@type': 'Brand',
          name: 'What the Funk',
        },
        category: product.category?.name || 'Streetwear',
        offers:
          offers.length === 1
            ? offers[0]
            : {
                '@type': 'AggregateOffer',
                lowPrice: product.minPrice.toString(),
                highPrice: product.maxPrice.toString(),
                priceCurrency: 'AUD',
                availability: product.inStock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                offerCount: offers.length,
                offers: offers,
              },
        ...(aggregateRating && { aggregateRating }),
      },

      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        '@id': `${productUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },

      // WebPage
      {
        '@type': 'WebPage',
        '@id': `${productUrl}#webpage`,
        url: productUrl,
        name: `${product.title} - What the Funk`,
        description: product.shortDescription || product.description,
        isPartOf: {
          '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/#website`,
        },
        breadcrumb: {
          '@id': `${productUrl}#breadcrumb`,
        },
        mainEntity: {
          '@id': `${productUrl}#product`,
        },
      },

      // Organization
      {
        '@type': 'Organization',
        '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/#organization`,
        name: 'What the Funk',
        url: process.env.Next_PUBLIC_BASE_SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.Next_PUBLIC_BASE_SITE_URL}/what-the-funk.png`,
        },
      },

      // Website
      {
        '@type': 'WebSite',
        '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/#website`,
        url: process.env.Next_PUBLIC_BASE_SITE_URL,
        name: 'What the Funk',
        publisher: {
          '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/#organization`,
        },
      },
    ],
  };
}

export default async function NewDropsPageDetails({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['public-products', slug],
    queryFn: async () => {
      const res = await productApi.public.products
        .getSingleProduct(slug)
        .then((response) => response.data);
      return res;
    },
  });

  const jsonLd = await createProductJsonLd(slug);

  return (
    <>
      <Head>
        {jsonLd && (
          <script
            id='product-json-ld'
            type='application/ld+json'
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd),
            }}
          />
        )}
      </Head>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetailsContent />
      </HydrationBoundary>
    </>
  );
}
