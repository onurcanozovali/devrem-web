import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CommunityCategoryNavigation,
  CommunitySortNavigation,
} from '@/components/community/community-filters';
import { CreateTopicDialog } from '@/components/community/create-topic-dialog';
import { CommunitySearch } from '@/components/community/community-search';
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
import {
  breadcrumbSchema,
  graphSchema,
  organizationSchema,
  webPageSchema,
} from '@/lib/seo/structured-data';
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
  let loadFailed = false;
  try {
    const result = await listPublishedCommunityTopics({
      category,
      sort,
      cursor,
    });
    topics = result.topics;
    nextCursor = result.nextCursor;
  } catch {
    loadFailed = true;
  }

  const moreParams = new URLSearchParams();
  if (category !== 'all') moreParams.set('kategori', category);
  if (sort !== 'aktif') moreParams.set('sira', sort);
  if (nextCursor) moreParams.set('sonra', nextCursor);

  return (
    <main
      className="overflow-x-clip pb-16 pt-8 sm:pb-20 sm:pt-10"
      id="ana-icerik"
    >
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
      <Container className="max-w-[1320px]">
        <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
              Devrem
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
              Devrem Topluluğu
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-secondary-foreground sm:text-base sm:leading-7">
              Askere gitmeden önce merak ettiklerini sor, deneyimlerini paylaş
              ve aynı süreci yaşayan devrelerinden cevap al.
            </p>
          </div>
          <CreateTopicDialog triggerLabel="+ Konu Aç" />
        </header>

        <div className="mt-5 grid min-w-0 gap-5 lg:mt-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-7 xl:gap-9">
          <CommunityCategoryNavigation category={category} sort={sort} />
          <section
            className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_14px_40px_rgba(24,33,30,0.04)]"
            aria-label="Topluluk konuları"
          >
            <CommunitySearch
              toolbar={
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <h2 className="px-1 text-sm font-bold tracking-[-0.02em] text-foreground">
                    Konular
                  </h2>
                  <CommunitySortNavigation category={category} sort={sort} />
                </div>
              }
            >
              {loadFailed ? (
                <div className="px-4 py-12 text-center">
                  <p className="font-semibold">
                    Topluluk konuları şu anda yüklenemiyor.
                  </p>
                  <p className="mt-1 text-sm text-secondary-foreground">
                    Lütfen kısa süre sonra tekrar dene.
                  </p>
                </div>
              ) : topics.length ? (
                <div>
                  {topics.map((topic) => (
                    <TopicListItem key={topic.id} topic={topic} />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-12 text-center">
                  <p className="font-semibold">Henüz burada bir konu yok.</p>
                  <p className="mt-1 text-sm text-secondary-foreground">
                    İlk soruyu sen sor.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <CreateTopicDialog />
                  </div>
                </div>
              )}

              {nextCursor ? (
                <div className="border-t border-border px-4 py-4 text-center">
                  <Link
                    className="text-sm font-bold text-primary-ink hover:underline"
                    href={`/topluluk?${moreParams.toString()}`}
                  >
                    Daha fazla konu
                  </Link>
                </div>
              ) : null}
            </CommunitySearch>
          </section>
        </div>
      </Container>
    </main>
  );
}
