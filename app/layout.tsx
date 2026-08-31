import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://devrem.co'),
  title: {
    default: 'Devrem | Askere Gitmeden Önce Devrelerinle Tanış',
    template: '%s | Devrem',
  },
  description:
    'Aynı celp döneminde aynı birliğe gidecek devrelerinle tanış; Bedelli verilerini karşılaştır ve sade askerlik rehberlerine ulaş.',
  alternates: { canonical: '/' },
  icons: { icon: '/devrem-favicon.png' },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Devrem',
    title: 'Devrem | Askere Gitmeden Önce Devrelerinle Tanış',
    description:
      'Aynı dönem ve birlikteki devrelerinle tanış; Bedelli verilerini ve askerlik rehberlerini keşfet.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Devrem — Askere gitmeden önce devrelerinle tanış',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devrem | Askere Gitmeden Önce Devrelerinle Tanış',
    description:
      'Aynı dönem ve birlikteki devrelerinle tanış; Bedelli verilerini ve askerlik rehberlerini keşfet.',
    images: ['/og.png'],
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
