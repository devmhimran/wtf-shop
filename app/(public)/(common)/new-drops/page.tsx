import { NewDropsPageContent } from '@/components/public-pages/new-drops';
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
    ? `${categoryName} - New Drops Collection`
    : 'New Drops - Latest Premium Collection';

  const title =
    currentPage > 1
      ? `${baseTitle} | Page ${currentPage} | What the Funk`
      : `${baseTitle} | What the Funk`;

  const description = categoryName
    ? `Shop premium ${categoryName.toLowerCase()} from What the Funk's latest drops. High-quality Australian streetwear with free shipping over $100.`
    : "Discover What the Funk's latest premium collection. New drops featuring high-quality T-shirts, pants, and more. Australian streetwear with free shipping over $100.";

  // Build canonical URL
  const baseUrl = `${process.env.Next_PUBLIC_BASE_SITE_URL}/new-drops`;
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
      'new drops',
      'latest collection',
      'premium streetwear',
      'australian fashion',
      'custom t-shirts',
      'personalised apparel',
      ...(categoryName
        ? [
            categoryName.toLowerCase(),
            `${categoryName.toLowerCase()} collection`,
          ]
        : []),
      'online shopping',
      'quality clothing',
      'comfortable apparel',
      'trendy streetwear',
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

// Function to create comprehensive JSON-LD for new drops page
async function createNewDropsJsonLd(searchParams: SearchParams) {
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
      queryString
    );
    products = productsResponse.data?.data || [];
  } catch (error) {
    console.error('Failed to fetch data for JSON-LD:', error);
  }

  const baseUrl = `${process.env.Next_PUBLIC_BASE_SITE_URL}/new-drops`;
  const urlParams = new URLSearchParams();
  if (categorySlug) urlParams.append('category', categorySlug);
  if (sortBy) urlParams.append('sortBy', sortBy);
  if (search) urlParams.append('search', search);
  if (currentPage > 1) urlParams.append('page', currentPage.toString());

  const currentUrl = urlParams.toString()
    ? `${baseUrl}?${urlParams.toString()}`
    : baseUrl;

  // Static SEO keywords
  const staticKeywords = [
    'australian t shirt',
    'custom australian t shirt',
    'premium t shirt australia',
    'personalised t shirt australia',
    'unique t shirt designs',
    'custom apparel australia',
    'printed t shirts australia',
    'bespoke t shirts',
    'fashion t shirts australia',
    'streetwear australia',
    'graphic tees australia',
    'online clothing store',
    'quality apparel',
    'latest drops',
    'trendy shirts',
    'new arrivals',
    'what the funk',
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
      name: 'New Drops',
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
          ? `${categoryInfo.name} - New Drops Collection | What the Funk`
          : 'New Drops - Latest Premium Collection | What the Funk',
        description:
          "Discover What the Funk's latest premium collection of streetwear and clothing. New drops featuring high-quality T-shirts, custom apparel, and more.",
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
          ? `${categoryInfo.name} Products - New Drops`
          : 'New Drops Products',
        description:
          'Premium streetwear and clothing collection - Latest arrivals',
        numberOfItems: products.length,
        keywords: [
          'australian t shirt',
          'custom australian t shirt',
          'premium t shirt australia',
          'unique t shirt designs',
          'streetwear australia',
          'fashion t shirts australia',
          'latest drops',
          'quality clothing',
          'new arrivals',
        ],
        itemListElement: products.map((product, index) => ({
          '@type': 'Product',
          position: index + 1,
          name: product.title || `Product ${index + 1}`,
          description:
            product.shortDescription ||
            product.description ||
            'Premium quality product from What the Funk',
          url: `${process.env.Next_PUBLIC_BASE_SITE_URL}/products/${product.slug}`,
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
          url: `${process.env.Next_PUBLIC_BASE_SITE_URL}/og.jpg`,
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

export default async function NewDropsPage({
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
    queryKey: ['public-products', queryString],
    queryFn: () =>
      productApi.public.products
        .getProducts(queryString || '')
        .then((response) => response.data),
  });

  await queryClient.prefetchQuery({
    queryKey: ['public-categories'],
    queryFn: () =>
      productApi.public.categories
        .getCategories()
        .then((response) => response.data),
  });

  const jsonLd = await createNewDropsJsonLd(searchParams);

  return (
    <>
      <Head>
        <script
          id='new-drops-json-ld'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </Head>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <NewDropsPageContent />
      </HydrationBoundary>
    </>
  );
}
