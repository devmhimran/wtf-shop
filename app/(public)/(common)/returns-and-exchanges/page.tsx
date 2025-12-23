import { ReturnsAndExchangesPageContent } from '@/components/public-pages/returns-and-exchanges';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Returns & Exchanges | What the Funk',
  description:
    "Learn about What the Funk's returns and exchanges policy. Easy returns and exchanges on our premium Australian streetwear. Customer satisfaction guaranteed.",
  keywords: [
    'returns policy',
    'exchanges',
    'refund policy',
    'what the funk returns',
    'return process',
    'exchange policy',
    'customer service',
  ],

  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/returns-and-exchanges`,
  },

  openGraph: {
    title: 'Returns & Exchanges | What the Funk',
    description:
      "Learn about What the Funk's returns and exchanges policy. Easy returns and exchanges on our premium Australian streetwear.",
    url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/returns-and-exchanges`,
    type: 'website',
    locale: 'en_AU',
    siteName: 'What the Funk',
  },

  twitter: {
    card: 'summary',
    title: 'Returns & Exchanges | What the Funk',
    description:
      "Learn about What the Funk's returns and exchanges policy. Customer satisfaction guaranteed.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// JSON-LD for Returns and Exchanges Page
const returnsAndExchangesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // WebPage
    {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/returns-and-exchanges#webpage`,
      url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/returns-and-exchanges`,
      name: 'Returns & Exchanges - What the Funk',
      description:
        'Returns and Exchanges Policy for What the Funk. Learn about our easy return and exchange process.',
      isPartOf: {
        '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#website`,
      },
      breadcrumb: {
        '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/returns-and-exchanges#breadcrumb`,
      },
    },

    // BreadcrumbList
    {
      '@type': 'BreadcrumbList',
      '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/returns-and-exchanges#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: process.env.NEXT_PUBLIC_BASE_SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Returns & Exchanges',
          item: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/returns-and-exchanges`,
        },
      ],
    },

    // Organization
    {
      '@type': 'Organization',
      '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#organization`,
      name: 'What the Funk',
      url: process.env.NEXT_PUBLIC_BASE_SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/what-the-funk.png`,
      },
    },

    // Website
    {
      '@type': 'WebSite',
      '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#website`,
      url: process.env.NEXT_PUBLIC_BASE_SITE_URL,
      name: 'What the Funk',
      publisher: {
        '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#organization`,
      },
    },
  ],
};

export default function ReturnsAndExchanges() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id='returns-and-exchanges-json-ld'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(returnsAndExchangesJsonLd),
        }}
      />

      <ReturnsAndExchangesPageContent />
    </>
  );
}
