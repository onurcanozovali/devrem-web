import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Container } from '@/components/site/container';
import { SiteLogo } from '@/components/site/site-logo';

type FooterLink = { label: string; href: string };

const footerGroups: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Birlikler',
    links: [
      { label: 'Tüm Birlikler', href: '/birlikler' },
      { label: 'Şehirlere Göre Birlikler', href: '/#populer-birlikler' },
    ],
  },
  {
    title: 'Askerlik',
    links: [
      { label: 'Celp & Sevk', href: '/blog/2026-askerlik-celp-sevk-tarihleri' },
      { label: 'Bedelli Askerlik', href: '/bedelli' },
      { label: 'Askerlik Rehberi', href: '/blog' },
      { label: 'Askerlik Araçları', href: '/#araclar' },
    ],
  },
  {
    title: 'İçerik',
    links: [
      { label: 'Haberler', href: '/#haberler' },
      { label: 'Blog', href: '/blog' },
      { label: 'Rehberler', href: '/#rehberler' },
    ],
  },
  {
    title: 'Devrem',
    links: [
      { label: 'Hakkımızda', href: '/#hakkimizda' },
      { label: 'İletişim', href: '/support' },
      { label: 'Reklam & İş Birlikleri', href: 'mailto:iletisim@devrem.co?subject=Reklam%20ve%20iş%20birliği' },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { label: 'Gizlilik Politikası', href: '/privacy' },
      { label: 'Kullanım Koşulları', href: '/terms' },
      { label: 'Çerez Politikası', href: '/cerez-politikasi' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_2.2fr] lg:py-18">
        <div className="max-w-sm">
          <SiteLogo />
          <p className="mt-5 text-sm leading-6 text-secondary-foreground">
            Birlik bilgileri, celp ve sevk tarihleri, bedelli askerlik verileri
            ve hazırlık rehberleri için kapsamlı askerlik bilgi platformu.
          </p>
          <a className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-ink hover:text-primary-dark" href="mailto:iletisim@devrem.co">
            <Mail className="size-4" aria-hidden="true" /> iletisim@devrem.co
          </a>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:grid-cols-5">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">{group.title}</p>
              <ul className="mt-5 space-y-3 text-sm text-secondary-foreground">
                {group.links.map((item) => (
                  <li key={`${group.title}-${item.label}`}>
                    <Link className="transition hover:text-primary-ink" href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <div className="border-t border-border">
        <Container className="flex flex-col gap-3 py-6 text-xs text-secondary-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Devrem. Tüm hakları saklıdır.</p>
          <p>Devrem resmî bir kamu kurumu değildir. Resmî işlemlerde MSB ve e-Devlet kayıtları esastır.</p>
        </Container>
      </div>
    </footer>
  );
}
