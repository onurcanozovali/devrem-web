import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Home, Search } from 'lucide-react';
import { Container } from '@/components/site/container';

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı',
  description: 'Aradığınız sayfa taşınmış, yayından kaldırılmış veya hiç var olmamış olabilir.',
  robots: { index: false, follow: false },
};

const links = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/blog', label: 'Blog', icon: Search },
  { href: '/#uygulama', label: 'Devrem nasıl çalışır?', icon: ArrowRight },
];

export default function NotFoundPage() {
  return (
    <main className="not-found-page" id="ana-icerik">
      <Container>
        <section className="not-found-card">
          <p className="not-found-code">404</p>
          <h1>Bu sayfa burada değil.</h1>
          <p>
            Bağlantı değişmiş olabilir. Devrem’in güncel içeriklerine aşağıdaki
            yollardan ulaşabilirsin.
          </p>
          <nav aria-label="404 yönlendirmeleri">
            {links.map(({ href, label, icon: Icon }) => (
              <Link href={href} key={href}>
                <Icon className="size-4" aria-hidden="true" /> {label}
              </Link>
            ))}
          </nav>
        </section>
      </Container>
    </main>
  );
}
