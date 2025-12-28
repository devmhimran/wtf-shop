import { AboutUsPageContent } from '@/components/public-pages/about-us';
import { Metadata } from 'next';
import Head from 'next/head';

// export const metadata: Metadata = {
//   title: 'About Us | What the Funk',
//   description:
//     'Learn about What the Funk - your premium Australian streetwear brand. Discover our story, values, and commitment to quality custom apparel. Free shipping over $100.',
//   keywords: [
//     'about what the funk',
//     'australian streetwear brand',
//     'premium apparel australia',
//     'custom clothing company',
//     'streetwear story',
//     'quality clothing australia',
//     'our story',
//     'brand values',
//   ],

//   alternates: {
//     canonical: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/about-us`,
//   },

//   openGraph: {
//     title: 'About Us | What the Funk',
//     description:
//       'Learn about What the Funk - your premium Australian streetwear brand. Discover our story, values, and commitment to quality custom apparel.',
//     url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/about-us`,
//     type: 'website',
//     locale: 'en_AU',
//     siteName: 'What the Funk',
//     images: [
//       {
//         url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/og-about-us.jpg`,
//         width: 1200,
//         height: 630,
//         alt: 'About What the Funk',
//       },
//     ],
//   },

//   twitter: {
//     card: 'summary_large_image',
//     title: 'About Us | What the Funk',
//     description:
//       'Learn about What the Funk - your premium Australian streetwear brand. Discover our story and commitment to quality.',
//     images: [`${process.env.NEXT_PUBLIC_BASE_SITE_URL}/og-about-us.jpg`],
//   },

//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//     },
//   },
// };

// // JSON-LD for About Us Page
// const aboutUsJsonLd = {
//   '@context': 'https://schema.org',
//   '@graph': [
//     // AboutPage
//     {
//       '@type': 'AboutPage',
//       '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/about-us#webpage`,
//       url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/about-us`,
//       name: 'About Us - What the Funk',
//       description:
//         'Learn about What the Funk, our story, values, and commitment to delivering premium Australian streetwear and custom apparel.',
//       isPartOf: {
//         '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#website`,
//       },
//       breadcrumb: {
//         '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/about-us#breadcrumb`,
//       },
//     },

//     // BreadcrumbList
//     {
//       '@type': 'BreadcrumbList',
//       '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/about-us#breadcrumb`,
//       itemListElement: [
//         {
//           '@type': 'ListItem',
//           position: 1,
//           name: 'Home',
//           item: process.env.NEXT_PUBLIC_BASE_SITE_URL,
//         },
//         {
//           '@type': 'ListItem',
//           position: 2,
//           name: 'About Us',
//           item: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/about-us`,
//         },
//       ],
//     },

//     // Organization
//     {
//       '@type': 'Organization',
//       '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#organization`,
//       name: 'What the Funk',
//       url: process.env.NEXT_PUBLIC_BASE_SITE_URL,
//       logo: {
//         '@type': 'ImageObject',
//         url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/what-the-funk.png`,
//       },
//       description:
//         'What the Funk is a premium Australian streetwear brand specializing in custom apparel and quality clothing.',
//       areaServed: 'AU',
//       foundingLocation: {
//         '@type': 'Place',
//         address: {
//           '@type': 'PostalAddress',
//           addressCountry: 'AU',
//         },
//       },
//     },

//     // Website
//     {
//       '@type': 'WebSite',
//       '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#website`,
//       url: process.env.NEXT_PUBLIC_BASE_SITE_URL,
//       name: 'What the Funk',
//       publisher: {
//         '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#organization`,
//       },
//     },
//   ],
// };

export default function AboutUs() {
  return (
    <>
      {/* <Head>
        <script
          id='about-us-json-ld'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(aboutUsJsonLd),
          }}
        />
      </Head> */}

      <AboutUsPageContent />
    </>
  );
}
