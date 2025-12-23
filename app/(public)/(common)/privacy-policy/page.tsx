import { PrivacyPolicyPageContent } from '@/components/public-pages/privacy-policy';
import { Metadata } from 'next';
import Head from 'next/head';

export const metadata: Metadata = {
  title: 'Privacy Policy | What the Funk',
  description:
    "Read What the Funk's privacy policy. Learn how we collect, use, and protect your personal information when you shop our premium Australian streetwear.",
  keywords: [
    'privacy policy',
    'data protection',
    'personal information',
    'what the funk privacy',
    'customer privacy',
    'data security',
  ],

  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/privacy-policy`,
  },

  openGraph: {
    title: 'Privacy Policy | What the Funk',
    description:
      "Read What the Funk's privacy policy. Learn how we collect, use, and protect your personal information.",
    url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/privacy-policy`,
    type: 'website',
    locale: 'en_AU',
    siteName: 'What the Funk',
  },

  twitter: {
    card: 'summary',
    title: 'Privacy Policy | What the Funk',
    description:
      "Read What the Funk's privacy policy and learn how we protect your personal information.",
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

const privacyPolicyJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/privacy-policy#webpage`,
      url: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/privacy-policy`,
      name: 'Privacy Policy - What the Funk',
      description:
        'Privacy Policy for What the Funk. Learn how we collect, use, and protect your personal information.',
      isPartOf: {
        '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/#website`,
      },
      breadcrumb: {
        '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/privacy-policy#breadcrumb`,
      },
    },

    // BreadcrumbList
    {
      '@type': 'BreadcrumbList',
      '@id': `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/privacy-policy#breadcrumb`,
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
          name: 'Privacy Policy',
          item: `${process.env.NEXT_PUBLIC_BASE_SITE_URL}/privacy-policy`,
        },
      ],
    },

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

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <script
          id='privacy-policy-json-ld'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(privacyPolicyJsonLd),
          }}
        />
      </Head>

      <PrivacyPolicyPageContent />
    </>
  );
}
