import type { Metadata } from 'next';
import Link from 'next/link';
import { CommunityFilters } from '@/components/community/community-filters';
import { CreateTopicDialog } from '@/components/community/create-topic-dialog';
import { TopicListItem } from '@/components/community/topic-list-item';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/site/container';
import {
  isCommunityCategoryId,
  isCommunitySortId,
  type CommunityCategoryId,
  type CommunitySortId,
} from '@/lib/community/constants';
import { listPublishedCommunityTopics } from '@/lib/community/repository';
import type { CommunityTopic } from '@/lib/community/types';
import { breadcrumbSchema, graphSchema, organizationSchema, webPageSchema } from '@/lib/seo/structured-data';
import { createPageMetadata } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

const pageTitle = 'Devrem Topluluğu | Askerlik Soruları ve Deneyimleri';
const pageDescription =
  'Askere gideceklerin sorularını sorduğu, askerlik deneyimlerinin paylaşıldığı Devrem topluluğuna katıl.';

const baseMetadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/topluluk',
});

export const metadata: Metadata = {
  ...baseMetadata,
  title: { absolute: pageTitle },
};

type PageProps = {
  searchParams: Promise<{ kategori?: string; sira?: string; sonra?: string }>;
};

export default async function CommunityPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category: CommunityCategoryId | 'all' =
    params.kategori && isCommunityCategoryId(params.kategori)
      ? params.kategori
      : 'all';
  const sort: CommunitySortId =
    params.sira && isCommunitySortId(params.sira) ? params.sira : 'aktif';
  const cursor = params.sonra?.trim() || null;

  let topics: CommunityTopic[] = [];
  let nextCursor: string | null = null;
  try {
    const result = await listPublishedCommunityTopics({
      category,
      sort,
      cursor,
    });
    topics = result.topics;
    nextCursor = result.nextCursor;
  } catch {
    topics = [];
  }

  const moreParams = new URLSearchParams();
  if (category !== 'all') moreParams.set('kategori', category);
  if (sort !== 'aktif') moreParams.set('sira', sort);
  if (nextCursor) moreParams.set('sonra', nextCursor);

  return (
    <main className="pb-16 pt-10 sm:pb-20 sm:pt-12" id="ana-icerik">
      <JsonLd
        data={graphSchema(
          organizationSchema(),
          webPageSchema({
            path: '/topluluk',
            name: 'Devrem Topluluğu',
            description: pageDescription,
          }),
          breadcrumbSchema([
            { name: 'Ana Sayfa', path: '/' },
            { name: 'Topluluk', path: '/topluluk' },
          ]),
        )}
      />
      <Container className="max-w-3xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
              Devrem Topluluğu
            </h1>
            <p className="mt-3 text-sm leading-7 text-secondary-foreground sm:text-base">
              Askere gitmeden önce merak ettiklerini sor, deneyimlerini paylaş
              ve aynı süreci yaşayan devrelerinden cevap al.
            </p>
          </div>
          <CreateTopicDialog />
        </header>

        <CommunityFilters category={category} sort={sort} />

        {topics.length ? (
          <div className="mt-8 rounded-3xl border border-border bg-surface px-5 py-5 sm:px-6">
            {topics.map((topic) => (
              <TopicListItem key={topic.id} topic={topic} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <p className="text-base font-medium">
              Henüz burada bir konu yok. İlk soruyu sen sor.
            </p>
            <div className="mt-5 flex justify-center">
              <CreateTopicDialog />
            </div>
          </div>
        )}

        {nextCursor ? (
          <div className="mt-6 text-center">
            <Link
              className="text-sm font-bold text-primary-ink"
              href={`/topluluk?${moreParams.toString()}`}
            >
              Daha fazla konu
            </Link>
          </div>
        ) : null}
      </Container>
    </main>
  );
}
