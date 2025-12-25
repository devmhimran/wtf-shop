import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, Oswald } from 'next/font/google';
import { Toaster } from 'sonner';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

import './globals.css';
import { cn } from '@/lib/utils';
import { Loading } from '@/components/shared';
import { DefaultLayout } from '@/components/layouts';
import { productApi } from '@/lib/api-helper';

const oswald = Oswald({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-oswald',
});

const inter = Inter({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-inter',
});

const baseUrl =
  process.env.Next_PUBLIC_BASE_SITE_URL || 'https://www.whatthefunk.com.au';

// export const metadata: Metadata = {
//   title: 'Whatthefunk - Custom T-Shirts & Apparel Australia',
//   description:
//     "Create your own custom T-shirts with Whatthefunk, Australia's premier destination for personalized apparel. Design unique T-shirts, custom hats, and more with high-quality prints.",
//   keywords: [
//     'Whatthefunk T-Shirts Online',
//     'Ozzmix T-Shirts Online',
//     'Custom T-Shirts Australia',
//     'Personalized T-Shirts Australia',
//     'Custom Printed T-Shirts',
//     'Design Your Own T-Shirt Australia',
//     'Ozzmix Custom T-Shirts',
//     'Australian Graphic Tees',
//     'Custom Hats Australia',
//     'Custom Embroidered Hats',
//     'Ozzmix Clothing Brand',
//     'Printed Hoodies and T-Shirts',
//     'Customized Apparel Australia',
//     'Unique Australian T-Shirts',
//     'Trendy T-Shirts Australia',
//     'Ozzmix Streetwear',
//     'Custom Workwear T-Shirts',
//     'Eco-Friendly T-Shirts Australia',
//     'Custom Sports T-Shirts',
//     'Personalised Caps and Hats',
//     'Custom Uniform Printing Australia',
//     'Australian Fashion T-Shirts',
//     'Ozzmix Custom Apparel',
//     'Funny Australian T-Shirts',
//     'High-Quality T-Shirt Printing',
//     'Ozzmix Custom Designs',
//     'Custom Polo Shirts Australia',
//     'Australian Streetwear Clothing',
//     'Branded Merchandise Australia',
//     'Custom Festival T-Shirts',
//     'Stylish T-Shirts Online Australia',
//     'Custom Hats and Caps Australia',
//     'Ozzmix Lifestyle Apparel',
//     'T-Shirt Printing Services Australia',
//   ],
//   robots: {
//     index: true,
//     follow: true,
//   },
//   openGraph: {
//     type: 'website',
//     title: 'Ozzmix - Custom T-Shirts & Apparel Australia',
//     description:
//       "Design and shop custom T-shirts, hats, and apparel with Ozzmix, Australia's leading brand for personalized clothing.",
//     url: baseUrl,
//     images: [
//       {
//         url: `${baseUrl}/og.jpg`,
//         width: 1200,
//         height: 630,
//         alt: 'Ozzmix Custom T-Shirts and Apparel',
//       },
//     ],
//     siteName: 'Ozzmix - Custom T-Shirts & Apparel',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Ozzmix - Custom T-Shirts & Apparel Australia',
//     description:
//       'Design your own custom T-shirts and hats with Ozzmix. High-quality personalized apparel made in Australia.',
//     images: [`${baseUrl}/og.jpg`],
//   },
//   metadataBase: new URL(baseUrl),
// };

// const categories = await productApi.public.categories
//   .getCategories('?limit=25&page=1')
//   .then((res) => res.data);

// const categoryHas = categories.data.map((category, idx) => ({
//   '@type': 'WebPage',
//   url: `${baseUrl}/new-drops?page=1&category=${encodeURIComponent(
//     category.slug || ''
//   )}`,
//   name: category?.name,
//   position: idx + 1,
// }));

// const jsonLd = {
//   '@context': 'https://schema.org',
//   '@type': 'WebSite',
//   name: 'Ozzmix - Custom T-Shirts & Apparel',
//   url: baseUrl,
//   author: {
//     '@type': 'Organization',
//     name: 'Ozzmix',
//     url: baseUrl,
//   },
//   sameAs: [
//     'https://www.facebook.com/ozzmix',
//     'https://www.instagram.com/ozzmix',
//     'https://www.twitter.com/ozzmix',
//   ],
//   hasPart: [
//     ...categoryHas,
//     {
//       '@type': 'WebPage',
//       url: `${baseUrl}/collections/new-drops?page=1`,
//       name: 'Shop All Products',
//       description:
//         'Explore Ozzmix’s range of custom T-shirts, hats, and apparel.',
//       position: categoryHas.length + 1,
//     },
//   ],
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''}
        />
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
        {/* <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        /> */}
      </head>
      <body
        className={cn(
          oswald.variable,
          inter.variable,
          'antialiased bg-gray-50/50'
        )}
        suppressHydrationWarning
      >
        <Suspense fallback={<Loading />}>
          <DefaultLayout>
            {children}
            <Toaster richColors position='top-center' />
          </DefaultLayout>
        </Suspense>
      </body>
    </html>
  );
}
