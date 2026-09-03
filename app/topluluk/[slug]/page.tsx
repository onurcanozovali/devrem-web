import type { Metadata } from 'next';
import { Heart, MessageCircle, Pin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommunityThreadMessage } from '@/components/community/community-thread-message';
import { MoreReplies } from '@/components/community/more-replies';
import { ReplyComposer } from '@/components/community/reply-composer';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/site/container';
import { categoryLabel } from '@/lib/community/constants';
import {
  getPublishedCommunityTopicBySlug,
  listPublishedCommunityReplies,
} from '@/lib/community/repository';
import { discussionForumPostingSchema } from '@/lib/community/structured-data';
import {
  formatCommunityDate,
  seoDescriptionFromBody,
} from '@/lib/community/text';
import {
  breadcrumbSchema,
  graphSchema,
  organizationSchema,
  webPageSchema,
} from '@/lib/seo/structured-data';
import { createPageMetadata } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getPublishedCommunityTopicBySlug(slug);
  if (!topic) {
    return createPageMetadata({
      title: 'Konu bulunamadı',
      description: 'Bu topluluk konusu yayında değil.',
      path: `/topluluk/${slug}`,
      index: false,
    });
  }
  const title = `${topic.title} | Devrem Topluluğu`;
  const description = seoDescriptionFromBody(topic.body);
  return {
    ...createPageMetadata({
      title,
      description,
      path: `/topluluk/${topic.slug}`,
      index: true,
    }),
    title: { absolute: title },
  };
}

export default async function CommunityTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = await getPublishedCommunityTopicBySlug(slug);
  if (!topic) notFound();

  const { replies, nextCursor } = await listPublishedCommunityReplies(topic.id);

  const structuredData = graphSchema(
    organizationSchema(),
    webPageSchema({
      path: `/topluluk/${topic.slug}`,
      name: topic.title,
      description: seoDescriptionFromBody(topic.body),
      dateModified: topic.updatedAt || topic.lastActivityAt,
    }),
    discussionForumPostingSchema(
      topic,
      replies.map((reply) => ({
        id: reply.id,
        author: reply.authorDisplayName,
        body: reply.body,
        createdAt: reply.createdAt,
      })),
    ),
    breadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Topluluk', path: '/topluluk' },
      { name: topic.title, path: `/topluluk/${topic.slug}` },
    ]),
  );

  return (
    <main className="pb-16 pt-8 sm:pb-20 sm:pt-10" id="ana-icerik">
      <JsonLd data={structuredData} />
      <Container className="max-w-[1180px]">
        <nav className="text-sm text-secondary-foreground">
          <Link className="font-semibold text-primary-ink" href="/topluluk">
            ← Tüm konular
          </Link>
        </nav>

        <header className="mt-5 rounded-3xl border border-border bg-primary-subtle px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary-ink">
            <span className="rounded-full bg-white px-3 py-1">
              {categoryLabel(topic.category)}
            </span>
            {topic.isPinned ? (
              <span className="inline-flex items-center gap-1">
                <Pin className="size-3.5" aria-hidden="true" /> Sabit konu
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-4xl text-[2rem] font-bold leading-[1.1] tracking-[-0.05em] sm:text-[2.6rem]">
            {topic.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary-foreground">
            <span>{topic.authorDisplayName}</span>
            <span>{formatCommunityDate(topic.createdAt)}</span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-4" aria-hidden="true" />
              {topic.replyCount} yanıt
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="size-4" aria-hidden="true" />
              {topic.likeCount} beğeni
            </span>
          </div>
        </header>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
          <section
            className="min-w-0 overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_18px_45px_rgba(16,22,20,0.05)]"
            aria-label="Konu mesajları"
          >
            <CommunityThreadMessage
              topicId={topic.id}
              topicSlug={topic.slug}
              message={topic}
              messageType="topic"
              postNumber={1}
            />
            {replies.map((reply, index) => (
              <CommunityThreadMessage
                key={reply.id}
                topicId={topic.id}
                topicSlug={topic.slug}
                message={reply}
                messageType="reply"
                postNumber={index + 2}
              />
            ))}
            {!replies.length ? (
              <p className="border-b border-border px-6 py-5 text-sm text-secondary-foreground">
                Henüz yanıt yok. İlk cevabı sen yaz.
              </p>
            ) : null}
            {nextCursor ? (
              <MoreReplies
                topicId={topic.id}
                topicSlug={topic.slug}
                cursor={nextCursor}
                startPostNumber={replies.length + 2}
              />
            ) : null}
            <ReplyComposer topicId={topic.id} locked={topic.isLocked} />
          </section>

          <aside className="sticky top-24 hidden space-y-3 lg:block">
            <a
              className="flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-[#102018] transition hover:bg-primary-hover"
              href="#yanit-yaz"
            >
              Yanıt yaz
            </a>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-[0.11em] text-primary-ink">
                Konu akışı
              </p>
              <div className="mt-4 border-l-2 border-primary/35 pl-3">
                <a
                  className="block text-sm font-semibold text-foreground transition hover:text-primary-ink"
                  href={`#mesaj-${topic.id}`}
                >
                  İlk mesaj
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  1 / {topic.replyCount + 1}
                </p>
              </div>
              {replies.length ? (
                <div className="mt-4 border-l-2 border-primary pl-3">
                  <a
                    className="block text-sm font-semibold text-foreground transition hover:text-primary-ink"
                    href={`#mesaj-${replies.at(-1)?.id}`}
                  >
                    Son yanıt
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Math.min(replies.length + 1, topic.replyCount + 1)} /{' '}
                    {topic.replyCount + 1}
                  </p>
                </div>
              ) : null}
            </div>
            <p className="px-2 text-xs leading-5 text-muted-foreground">
              Mesaj numaraları kalıcı bağlantıdır. Mesajı paylaşınca doğrudan o
              yanıta gidilir.
            </p>
          </aside>
        </div>
      </Container>
    </main>
  );
}
