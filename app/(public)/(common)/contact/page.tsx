import { ContactPageContent } from '@/components/public-pages/contact';
import { Metadata } from 'next';
import Head from 'next/head';

export const metadata: Metadata = {
  title: 'Contact Us | What the Funk',
  description:
    'Get in touch with What the Funk. Contact us for custom orders, inquiries about our premium Australian streetwear, or any questions. Free shipping over $100.',
  keywords: [
    'contact what the funk',
    'customer service',
    'custom orders',
    'streetwear inquiries',
    'australian clothing contact',
    'get in touch',
    'support',
    'help',
  ],

  alternates: {
    canonical: `${process.env.Next_PUBLIC_BASE_SITE_URL}/contact`,
  },

  openGraph: {
    title: 'Contact Us | What the Funk',
    description:
      'Get in touch with What the Funk. Contact us for custom orders, inquiries about our premium Australian streetwear, or any questions.',
    url: `${process.env.Next_PUBLIC_BASE_SITE_URL}/contact`,
    type: 'website',
    locale: 'en_AU',
    siteName: 'What the Funk',
    images: [
      {
        url: `${process.env.Next_PUBLIC_BASE_SITE_URL}/og-contact.jpg`,
        width: 1200,
        height: 630,
        alt: 'Contact What the Funk',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | What the Funk',
    description:
      'Get in touch with What the Funk for custom orders and inquiries about our premium Australian streetwear.',
    images: [`${process.env.Next_PUBLIC_BASE_SITE_URL}/og-contact.jpg`],
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

// JSON-LD for Contact Page
const contactJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // ContactPage
    {
      '@type': 'ContactPage',
      '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/contact#webpage`,
      url: `${process.env.Next_PUBLIC_BASE_SITE_URL}/contact`,
      name: 'Contact Us - What the Funk',
      description:
        'Get in touch with What the Funk for custom orders, inquiries, and support.',
      isPartOf: {
        '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/#website`,
      },
      breadcrumb: {
        '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/contact#breadcrumb`,
      },
    },

    // BreadcrumbList
    {
      '@type': 'BreadcrumbList',
      '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/contact#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: process.env.Next_PUBLIC_BASE_SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Contact',
          item: `${process.env.Next_PUBLIC_BASE_SITE_URL}/contact`,
        },
      ],
    },

    // Organization with contact details
    {
      '@type': 'Organization',
      '@id': `${process.env.Next_PUBLIC_BASE_SITE_URL}/#organization`,
      name: 'What the Funk',
      url: process.env.Next_PUBLIC_BASE_SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.Next_PUBLIC_BASE_SITE_URL}/what-the-funk.png`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        areaServed: 'AU',
        availableLanguage: 'English',
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

export default function Contact() {
  return (
    <>
      <Head>
        <script
          id='contact-json-ld'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(contactJsonLd),
          }}
        />
      </Head>

      <ContactPageContent />
    </>
  );
}
