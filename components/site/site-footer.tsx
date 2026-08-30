import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import { Container } from '@/components/site/container';
import { SiteLogo } from '@/components/site/site-logo';

type FooterLink = { label: string; href: string | null };

const footerGroups: { title: string; links: FooterLink[] }[] = [
  { title: 'Devrem', links: [{ label: 'Hakkımızda', href: null }, { label: 'Uygulama', href: '/#uygulama' }, { label: 'İletişim', href: 'mailto:iletisim@devrem.co' }] },
  { title: 'Askerlik', links: [{ label: 'Birlikler', href: '/#birlikler' }, { label: 'Celp Dönemleri', href: '/#devreler' }, { label: 'Bedelli Askerlik', href: '/#bedelli' }, { label: 'Askerlik Rehberi', href: '/#rehberler' }] },
  { title: 'İçerik', links: [{ label: 'Haberler', href: '/#gundem' }, { label: 'Rehberler', href: '/#rehberler' }, { label: 'Araçlar', href: '/#araclar' }] },
  { title: 'Kurumsal', links: [{ label: 'Reklam & İş Birlikleri', href: 'mailto:iletisim@devrem.co?subject=Reklam%20ve%20iş%20birliği' }, { label: 'Gizlilik', href: null }, { label: 'Kullanım Koşulları', href: null }] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-12 py-14 md:grid-cols-[1.3fr_2fr] lg:py-18">
        <div className="max-w-sm">
          <SiteLogo />
          <p className="mt-5 text-sm leading-6 text-secondary-foreground">Askere hazırlık, birlik bilgileri, araçlar ve devre topluluğu için büyüyen Türkiye platformu.</p>
          <a className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25" href="mailto:iletisim@devrem.co"><Mail className="size-4" aria-hidden="true" /> iletisim@devrem.co</a>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">{group.title}</h2>
              <ul className="mt-5 space-y-3 text-sm text-secondary-foreground">
                {group.links.map((item) => (
                  <li key={item.label}>
                    {item.href ? <Link className="inline-flex items-center gap-1 transition hover:text-primary" href={item.href}>{item.label}{item.href.startsWith('mailto:') ? <ArrowUpRight className="size-3" aria-hidden="true" /> : null}</Link> : <span className="inline-flex items-center gap-2 opacity-65" title="Sonraki aşamada eklenecek">{item.label}<small className="rounded-full bg-secondary px-1.5 py-0.5 text-[7px] font-bold uppercase">Yakında</small></span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <div className="border-t border-border"><Container className="flex flex-col gap-3 py-6 text-xs text-secondary-foreground sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Devrem. Tüm hakları saklıdır.</p><p>Devrem resmî bir kamu kurumu veya askerlik uygulaması değildir.</p></Container></div>
    </footer>
  );
}
