import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { isIndexingEnabled, seoConfig } from '@/src/config/seo';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.origin),
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.defaultDescription,
  applicationName: seoConfig.siteName,
  authors: [{ name: seoConfig.siteName, url: seoConfig.origin }],
  creator: seoConfig.siteName,
  publisher: seoConfig.siteName,
  robots: {
    index: isIndexingEnabled,
    follow: isIndexingEnabled,
    googleBot: { index: isIndexingEnabled, follow: isIndexingEnabled },
  },
  icons: {
    icon: '/devrem-favicon.png',
    apple: '/apple-touch-icon.png',
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Devrem',
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: `${seoConfig.origin}/`,
    images: [
      {
        url: `${seoConfig.origin}${seoConfig.defaultImage.path}`,
        width: seoConfig.defaultImage.width,
        height: seoConfig.defaultImage.height,
        alt: seoConfig.defaultImage.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [`${seoConfig.origin}${seoConfig.defaultImage.path}`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${poppins.variable} antialiased`}>
        <a className="skip-link" href="#ana-icerik">
          Ana içeriğe geç
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
