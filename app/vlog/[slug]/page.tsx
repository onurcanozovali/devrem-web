import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock3, Play, Video } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/site/container';
import { getVlogPost, vlogPosts } from '@/src/fixtures/content';

type VlogDetailProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return vlogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: VlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getVlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/vlog/${post.slug}` },
    openGraph: {
      title: `${post.title} | Devrem Vlog`,
      description: post.excerpt,
      images: [],
    },
    twitter: {
      card: 'summary',
      title: `${post.title} | Devrem Vlog`,
      description: post.excerpt,
      images: [],
    },
  };
}

export default async function VlogDetailPage({ params }: VlogDetailProps) {
  const { slug } = await params;
  const post = getVlogPost(slug);
  if (!post) notFound();

  return (
    <main className="vlog-page" id="ana-icerik">
      <Container>
        <header className="vlog-hero">
          <Link
            className="inline-flex items-center gap-2 text-xs font-bold text-secondary-foreground transition hover:text-primary-ink"
            href="/blog"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Bloga dön
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-semibold text-secondary-foreground">
            <span className="rounded-full bg-primary-subtle px-3 py-1.5 font-bold text-primary-ink">
              Devrem Vlog
            </span>
            <span>{post.publishedAt}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" aria-hidden="true" /> {post.duration}
            </span>
          </div>
          <h1 className="mt-6 max-w-5xl text-balance text-[clamp(2.8rem,7vw,6rem)] font-extrabold leading-[0.94] tracking-[-0.075em]">
            {post.title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-secondary-foreground">
            {post.excerpt}
          </p>
        </header>

        <section className="vlog-player" aria-label="Vlog oynatıcı">
          {post.videoUrl && post.captionsUrl ? (
            <video className="h-full w-full" controls preload="metadata">
              <source src={post.videoUrl} />
              <track
                default
                kind="captions"
                label="Türkçe"
                src={post.captionsUrl}
                srcLang="tr"
              />
            </video>
          ) : (
            <>
              <Image
                alt="Devrem mobil uygulamasından ekran görünümü"
                className="vlog-player-poster"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 1100px"
                src="/ss1.png"
              />
              <div className="vlog-player-overlay">
                <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Play
                    className="ml-1 size-7"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                </span>
                <strong>Pilot bölüm hazırlanıyor</strong>
                <p>
                  Video ve Türkçe altyazı dosyaları yayınlandığında oynatıcı
                  burada etkinleşecek.
                </p>
              </div>
            </>
          )}
        </section>

        <div className="vlog-layout">
          <section aria-labelledby="chapters-title">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-ink">
              Bölüm akışı
            </p>
            <h2
              className="mt-3 text-3xl font-bold tracking-[-0.05em]"
              id="chapters-title"
            >
              Bu bölümde
            </h2>
            <div className="mt-7 overflow-hidden rounded-3xl border border-border bg-surface">
              {post.chapters.map((chapter) => (
                <div
                  className="flex items-center gap-5 border-b border-border px-5 py-4 last:border-0"
                  key={chapter.time}
                >
                  <span className="rounded-full bg-primary-subtle px-3 py-1.5 text-xs font-bold text-primary-ink">
                    {chapter.time}
                  </span>
                  <strong className="text-sm">{chapter.title}</strong>
                </div>
              ))}
            </div>
          </section>
          <aside className="rounded-3xl border border-border bg-surface-elevated p-6">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Video className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold">Bölüm notları</h2>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-secondary-foreground">
              {post.notes.map((note) => (
                <li className="border-l-2 border-primary/40 pl-4" key={note}>
                  {note}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </main>
  );
}
