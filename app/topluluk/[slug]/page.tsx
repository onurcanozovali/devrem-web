import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommunityReportButton } from '@/components/community/report-button';
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
import { formatCommunityDate, seoDescriptionFromBody } from '@/lib/community/text';
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
      <Container className="max-w-3xl">
        <nav className="text-sm text-secondary-foreground">
          <Link className="font-medium text-primary-ink" href="/topluluk">
            ← Topluluk
          </Link>
        </nav>
        <header className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-ink">
            {categoryLabel(topic.category)}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-[2.1rem]">
            {topic.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {topic.authorDisplayName}
            {' · '}
            {formatCommunityDate(topic.createdAt)}
            {' · '}
            {topic.replyCount} yanıt
          </p>
        </header>

        <article className="mt-6 rounded-3xl border border-border bg-surface px-5 py-6 sm:px-6">
          <p className="whitespace-pre-wrap text-base leading-7 text-foreground">
            {topic.body}
          </p>
          <div className="mt-4 flex justify-end">
            <CommunityReportButton
              targetType="topic"
              targetId={topic.id}
              topicId={topic.id}
            />
          </div>
        </article>

        <section className="mt-8" aria-labelledby="replies-title">
          <h2 id="replies-title" className="text-lg font-bold tracking-[-0.03em]">
            Yanıtlar
          </h2>
          {replies.length ? (
            <ol className="mt-4 space-y-3">
              {replies.map((reply) => (
                <li
                  className="rounded-2xl border border-border bg-surface px-4 py-4"
                  key={reply.id}
                >
                  <p className="text-xs text-muted-foreground">
                    {reply.authorDisplayName}
                    {' · '}
                    {formatCommunityDate(reply.createdAt)}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {reply.body}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <CommunityReportButton
                      targetType="reply"
                      targetId={reply.id}
                      topicId={topic.id}
                    />
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-secondary-foreground">
              Henüz yanıt yok. İlk cevabı sen yaz.
            </p>
          )}
          {nextCursor ? (
            <MoreReplies topicId={topic.id} cursor={nextCursor} />
          ) : null}
        </section>

        <div className="mt-8">
          <ReplyComposer topicId={topic.id} locked={topic.isLocked} />
        </div>
      </Container>
    </main>
  );
}
