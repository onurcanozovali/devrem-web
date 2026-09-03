import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CommunityCategoryNavigation,
  CommunitySortNavigation,
} from '@/components/community/community-filters';
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
      <Container className="max-w-[1240px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
              Devrem Topluluğu
            </h1>
            <p className="mt-3 text-sm leading-7 text-secondary-foreground sm:text-base">
              Askere gitmeden önce merak ettiklerini sor, deneyimlerini paylaş
              ve aynı süreci yaşayan devrelerinden cevap al.
            </p>
          </div>
          <CreateTopicDialog triggerLabel="+ Konu Aç" />
        </header>

        <div className="mt-8">
          <div className="lg:hidden">
            <CommunityCategoryNavigation category={category} sort={sort} />
          </div>
          <div className="mt-4 flex items-start gap-8 lg:mt-0">
            <CommunityCategoryNavigation category={category} sort={sort} />
            <section className="min-w-0 flex-1" aria-label="Topluluk konuları">
              <CommunitySortNavigation category={category} sort={sort} />

              {loadFailed ? (
                <div className="px-4 py-10 text-center">
                  <p className="font-semibold">
                    Topluluk konuları şu anda yüklenemiyor.
                  </p>
                  <p className="mt-1 text-sm text-secondary-foreground">
                    Lütfen kısa süre sonra tekrar dene.
                  </p>
                </div>
              ) : topics.length ? (
                <div className="border-x border-b border-border bg-surface">
                  {topics.map((topic) => (
                    <TopicListItem key={topic.id} topic={topic} />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-10 text-center">
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
                <div className="mt-6 text-center">
                  <Link
                    className="text-sm font-bold text-primary-ink"
                    href={`/topluluk?${moreParams.toString()}`}
                  >
                    Daha fazla konu
                  </Link>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}
