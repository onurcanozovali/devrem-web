import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import { Container } from '@/components/site/container';
import { SiteLogo } from '@/components/site/site-logo';

type FooterLink = { label: string; href: string };

const footerGroups: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Keşfet',
    links: [
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Devrem Uygulaması', href: '/#uygulama' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'İçerik',
    links: [
      { label: 'Bedelli Karşılaştırma', href: '/bedelli' },
      {
        label: 'Sevk Belgesi Rehberi',
        href: '/blog/sevk-belgesi-nedir-nasil-alinir',
      },
      { label: 'Devrem Vlog', href: '/vlog/birlik-yolculugu-ilk-bolum' },
    ],
  },
  {
    title: 'İletişim',
    links: [
      { label: 'Bize Ulaşın', href: 'mailto:iletisim@devrem.co' },
      {
        label: 'Reklam & İş Birlikleri',
        href: 'mailto:iletisim@devrem.co?subject=Reklam%20ve%20iş%20birliği',
      },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { label: 'Gizlilik Politikası', href: '/privacy' },
      { label: 'KVKK Aydınlatma Metni', href: '/kvkk' },
      { label: 'Kullanım Koşulları', href: '/terms' },
      { label: 'Hesap Silme', href: '/account-deletion' },
      { label: 'Topluluk Kuralları', href: '/community-guidelines' },
      { label: 'Destek ve İletişim', href: '/support' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-12 py-14 md:grid-cols-[1.3fr_2fr] lg:py-18">
        <div className="max-w-sm">
          <SiteLogo />
          <p className="mt-5 text-sm leading-6 text-secondary-foreground">
            Askere gitmeden önce doğru bilgiye ulaş, Bedelli verilerini
            karşılaştır ve Devrem uygulamasında aynı yolculuğu paylaşacağın
            insanlarla tanış.
          </p>
          <a
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-ink hover:text-primary-dark focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
            href="mailto:iletisim@devrem.co"
          >
            <Mail className="size-4" aria-hidden="true" /> iletisim@devrem.co
          </a>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">
                {group.title}
              </p>
              <ul className="mt-5 space-y-3 text-sm text-secondary-foreground">
                {group.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      className="inline-flex items-center gap-1 transition hover:text-primary-ink"
                      href={item.href}
                    >
                      {item.label}
                      {item.href.startsWith('mailto:') ? (
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                      ) : null}
                    </Link>
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
          <p>Devrem resmî bir kamu kurumu veya askerlik uygulaması değildir.</p>
        </Container>
      </div>
    </footer>
  );
}
