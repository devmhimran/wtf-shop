import { productApi } from '@/lib/api-helper';
import { MetadataRoute } from 'next';

function encodeUrl(url: string) {
  // Only encode & to &amp; for XML safety
  return url.replace(/&/g, '&amp;');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_SITE_URL || 'https://www.whatthefunk.com.au';

  const products = await productApi.public.products
    .getProducts('?limit=60')
    .then((response) => response.data);

  const categories = await productApi.public.categories
    .getCategories('?limit=20')
    .then((response) => response.data);

  // Dynamic product URLs
  const productUrls = (products?.data || []).map(
    (product: { slug: string; updatedAt?: string; createdAt?: string }) => ({
      url: encodeUrl(`${baseUrl}/new-drops/${product.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      lastModified: new Date(
        product.updatedAt || product.createdAt || Date.now()
      ).toISOString(),
    })
  );

  // Dynamic category URLs for new-drops
  const categoryUrls = (categories?.data || []).map(
    (cat: { slug: string; updatedAt?: string; createdAt?: string }) => ({
      url: encodeUrl(`${baseUrl}/new-drops?page=1&category=${cat.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      lastModified: new Date(
        cat.updatedAt || cat.createdAt || Date.now()
      ).toISOString(),
    })
  );

  return [
    {
      url: encodeUrl(`${baseUrl}/`),
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date().toISOString(),
    },
    {
      url: encodeUrl(`${baseUrl}/new-drops`),
      changeFrequency: 'daily',
      priority: 0.9,
      lastModified: new Date().toISOString(),
    },
    {
      url: encodeUrl(`${baseUrl}/custom-products`),
      changeFrequency: 'weekly',
      priority: 0.8,
      lastModified: new Date().toISOString(),
    },
    // Dynamic category URLs
    ...categoryUrls,
    // Dynamic product URLs
    ...productUrls,
  ];
}
