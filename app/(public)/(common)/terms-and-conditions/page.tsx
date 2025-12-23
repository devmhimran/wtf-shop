import { TermsAndConditionsPageContent } from '@/components/public-pages/terms-and-conditions';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Terms & Conditions | What the Funk',
  description:
    "Read What the Funk's terms and conditions. Understand the terms of use for shopping our premium Australian streetwear and custom apparel.",
  keywords: [
    'terms and conditions',
    'terms of service',
    'terms of use',
    'what the funk terms',
    'legal terms',
    'user agreement',
  ],

  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/terms-and-conditions`,
  },

  openGraph: {
    title: 'Terms & Conditions | What the Funk',
    description:
      "Read What the Funk's terms and conditions. Understand the terms of use for shopping our premium Australian streetwear.",
    url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/terms-and-conditions`,
    type: 'website',
    locale: 'en_AU',
    siteName: 'What the Funk',
  },

  twitter: {
    card: 'summary',
    title: 'Terms & Conditions | What the Funk',
    description:
      "Read What the Funk's terms and conditions and user agreement.",
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

// JSON-LD for Terms and Conditions Page
const termsAndConditionsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // WebPage
    {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/terms-and-conditions#webpage`,
      url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/terms-and-conditions`,
      name: 'Terms & Conditions - What the Funk',
      description:
        'Terms and Conditions for What the Funk. Understand the terms of use for our services.',
      isPartOf: {
        '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#website`,
      },
      breadcrumb: {
        '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/terms-and-conditions#breadcrumb`,
      },
    },

    // BreadcrumbList
    {
      '@type': 'BreadcrumbList',
      '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/terms-and-conditions#breadcrumb`,
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
          name: 'Terms & Conditions',
          item: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/terms-and-conditions`,
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

export default function TermsAndConditions() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id='terms-and-conditions-json-ld'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(termsAndConditionsJsonLd),
        }}
      />

      <TermsAndConditionsPageContent />
    </>
  );
}
