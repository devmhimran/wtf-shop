import { CustomProductPageContent } from '@/components/public-pages/custom-products';
import { productApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { generateQueryString } from '@/lib/utils';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Metadata } from 'next';
import { ProductType, PublicCategoryType } from '@/types';
import Head from 'next/head';

// Define interfaces for search params
interface SearchParams {
  page?: number;
  search?: string;
  category?: string;
  subCategory?: string;
  sortBy?: string;
}

// Generate dynamic metadata based on search params
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const currentPage = params.page ? Number(params.page) : 1;
  const categorySlug = params.category || '';
  const search = params.search || '';
  const sortBy = params.sortBy || '';

  // Get category information if filter is applied
  let categoryName = '';

  if (categorySlug) {
    try {
      const categoriesResponse =
        await productApi.public.categories.getCategories();
      const categories: PublicCategoryType[] =
        categoriesResponse.data?.data || [];
      const currentCategory = categories.find(
        (cat) => cat.slug === categorySlug
      );
      if (currentCategory) {
        categoryName = currentCategory.name;
      }
    } catch (error) {
      console.error('Failed to fetch category for metadata:', error);
    }
  }

  // Build dynamic title and description
  const baseTitle = categoryName
    ? `Custom ${categoryName} - Personalized Collection`
    : 'Custom Products - Personalized Australian Streetwear';

  const title =
    currentPage > 1
      ? `${baseTitle} | Page ${currentPage} | What the Funk`
      : `${baseTitle} | What the Funk`;

  const description = categoryName
    ? `Create your own custom ${categoryName.toLowerCase()} with What the Funk. Premium personalized Australian streetwear with free shipping over $100.`
    : 'Design your own custom apparel with What the Funk. Personalized T-shirts, hoodies, and more. Premium Australian custom streetwear with free shipping over $100.';

  // Build canonical URL
  const baseUrl = `${process.env.Next_PUBLIC_BASE_SITE_URL}/custom-products`;
  const urlParams = new URLSearchParams();
  if (categorySlug) urlParams.append('category', categorySlug);
  if (sortBy) urlParams.append('sortBy', sortBy);
  if (search) urlParams.append('search', search);
  if (currentPage > 1) urlParams.append('page', currentPage.toString());

  const canonicalUrl = urlParams.toString()
    ? `${baseUrl}?${urlParams.toString()}`
    : baseUrl;

  return {
    title,
    description,
    keywords: [
      'what the funk',
      'custom products',
      'personalized apparel',
      'custom t-shirts australia',
      'personalized streetwear',
      'custom clothing',
      'bespoke apparel',
      'design your own',
      ...(categoryName
        ? [
            `custom ${categoryName.toLowerCase()}`,
            `personalized ${categoryName.toLowerCase()}`,
          ]
        : []),
      'australian fashion',
      'online custom clothing',
      'quality custom apparel',
    ],

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale: 'en_AU',
      siteName: 'What the Funk',
      images: [
        {
          url: `${process.env.Next_PUBLIC_BASE_SITE_URL}/og.jpg`,
          width: 1200,
          height: 630,
          alt: `${baseTitle} - What the Funk`,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${process.env.Next_PUBLIC_BASE_SITE_URL}/og.jpg`],
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

// Function to create comprehensive JSON-LD for custom products page
async function createCustomProductsJsonLd(searchParams: SearchParams) {
  const params = await searchParams;
  const currentPage = params.page ? Number(params.page) : 1;
  const categorySlug = params.category || '';
  const search = params.search || '';
  const sortBy = params.sortBy || '';

  let categoryInfo: PublicCategoryType | null = null;
  let products: ProductType[] = [];

  try {
    // Get category info if filter is applied
    if (categorySlug) {
      const categoriesResponse =
        await productApi.public.categories.getCategories();
      const categories: PublicCategoryType[] =
        categoriesResponse.data?.data || [];
      categoryInfo =
        categories.find((cat) => cat.slug === categorySlug) || null;
    }

    // Get products for the page
    const queryParams = {
      page: currentPage.toString(),
      search,
      category: categorySlug,
      subCategory: params.subCategory || '',
      sortBy,
    };
    const queryString = generateQueryString(queryParams);
    const productsResponse = await productApi.public.products.getProducts(
      queryString + '&productType=CUSTOM'
    );
    products = productsResponse.data?.data || [];
  } catch (error) {
    console.error('Failed to fetch data for JSON-LD:', error);
  }

  const baseUrl = `${process.env.Next_PUBLIC_BASE_SITE_URL}/custom-products`;
  const urlParams = new URLSearchParams();
  if (categorySlug) urlParams.append('category', categorySlug);
  if (sortBy) urlParams.append('sortBy', sortBy);
  if (search) urlParams.append('search', search);
  if (currentPage > 1) urlParams.append('page', currentPage.toString());

  const currentUrl = urlParams.toString()
    ? `${baseUrl}?${urlParams.toString()}`
    : baseUrl;

  // Static SEO keywords for custom products
  const staticKeywords = [
    'custom australian t shirt',
    'personalized t shirt australia',
    'custom apparel australia',
    'bespoke t shirts',
    'design your own t shirt',
    'custom printed shirts australia',
    'personalized clothing',
    'custom streetwear australia',
    'unique t shirt designs',
    'custom graphic tees',
    'personalized fashion',
    'custom merchandise australia',
    'what the funk custom',
  ];

  const allKeywords = Array.from(new Set([...staticKeywords]));

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
      name: 'Custom Products',
      item: baseUrl,
    },
  ];

  if (categoryInfo) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: categoryInfo.name,
      item: currentUrl,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // CollectionPage
      {
        '@type': 'CollectionPage',
        '@id': `${currentUrl}#webpage`,
        url: currentUrl,
        name: categoryInfo?.name
          ? `Custom ${categoryInfo.name} Collection | What the Funk`
          : 'Custom Products - Personalized Australian Streetwear | What the Funk',
        description:
          'Design your own custom apparel with What the Funk. Create personalized T-shirts, hoodies, and more. Premium Australian custom streetwear.',
        isPartOf: {
          '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/#website`,
        },
        breadcrumb: {
          '@id': `${currentUrl}#breadcrumb`,
        },
        mainEntity: {
          '@id': `${currentUrl}#products`,
        },
        keywords: allKeywords,
      },

      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        '@id': `${currentUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },

      // Product List
      {
        '@type': 'ItemList',
        '@id': `${currentUrl}#products`,
        name: categoryInfo?.name
          ? `Custom ${categoryInfo.name} Products`
          : 'Custom Products',
        description: 'Personalized streetwear and custom clothing collection',
        numberOfItems: products.length,
        keywords: [
          'custom australian t shirt',
          'personalized t shirt australia',
          'custom apparel australia',
          'design your own',
          'bespoke clothing',
          'custom streetwear',
          'personalized fashion',
          'quality custom products',
        ],
        itemListElement: products.map((product, index) => ({
          '@type': 'Product',
          position: index + 1,
          name: product.title || `Product ${index + 1}`,
          description:
            product.shortDescription ||
            product.description ||
            'Premium quality custom product from What the Funk',
          url: `${process.env.Next_PUBLIC_BASE_SITE_URL}/custom-products/${product.slug}`,
          image: product.mainImage?.fileUrl
            ? product.mainImage.fileUrl
            : `${process.env.Next_PUBLIC_BASE_SITE_URL}/og.jpg`,
          brand: {
            '@type': 'Brand',
            name: 'What the Funk',
          },
          offers: {
            '@type': 'Offer',
            price: product.minPrice?.toString() || '0',
            priceCurrency: 'AUD',
            availability: product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: 'What the Funk',
            },
          },
        })),
      },

      // Organization reference
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

      // Website reference
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

export default async function CustomProductPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = params.page ? params.page : 1;
  const search = params.search || '';

  const queryParams = {
    page: page.toString(),
    search,
    category: params.category || '',
    subCategory: params.subCategory || '',
    sortBy: params.sortBy || '',
  };

  const queryString = generateQueryString(queryParams);
  const queryClient = getQueryClient();

  // Prefetch products data
  await queryClient.prefetchQuery({
    queryKey: ['public-products', queryString + '&productType=CUSTOM'],
    queryFn: () =>
      productApi.public.products
        .getProducts(queryString + '&productType=CUSTOM' || '')
        .then((response) => response.data),
  });

  // Prefetch categories data (needed for filtering UI)
  await queryClient.prefetchQuery({
    queryKey: ['public-categories'],
    queryFn: () =>
      productApi.public.categories
        .getCategories()
        .then((response) => response.data),
  });

  // Generate JSON-LD with the same searchParams used for fetching
  const jsonLd = await createCustomProductsJsonLd(searchParams);

  return (
    <>
      <Head>
        <script
          id='custom-products-json-ld'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </Head>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <CustomProductPageContent />
      </HydrationBoundary>
    </>
  );
}
