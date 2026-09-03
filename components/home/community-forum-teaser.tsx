import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categoryLabel } from '@/lib/community/constants';
import { listHomeCommunityTopics } from '@/lib/community/repository';
import { Container } from '@/components/site/container';
import { CreateTopicDialog } from '@/components/community/create-topic-dialog';

export async function CommunityForumTeaser() {
  let topics: Awaited<ReturnType<typeof listHomeCommunityTopics>> = [];
  try {
    topics = await listHomeCommunityTopics();
  } catch {
    topics = [];
  }

  return (
    <section className="py-16 sm:py-20" aria-labelledby="community-teaser-title">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
              Topluluk
            </p>
            <h2
              className="section-title mt-3 text-balance"
              id="community-teaser-title"
            >
              Devrelerin ne konuşuyor?
            </h2>
            <p className="mt-4 text-sm leading-7 text-secondary-foreground sm:text-base">
              Askere hazırlananların sorularını ve gerçek deneyimlerini keşfet.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-ink"
            href="/topluluk"
          >
            Topluluğu keşfet
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {topics.length ? (
          <ul className="mt-8 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Link
                  className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-muted/60"
                  href={`/topluluk/${topic.slug}`}
                >
                  <span>
                    <span className="text-xs font-semibold text-primary-ink">
                      {categoryLabel(topic.category)}
                    </span>
                    <strong className="mt-1 block text-base font-bold tracking-[-0.03em]">
                      {topic.title}
                    </strong>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {topic.replyCount} yanıt
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface px-5 py-8 text-center">
            <p className="text-sm text-secondary-foreground">
              Henüz burada bir konu yok. İlk soruyu sen sor.
            </p>
            <div className="mt-4 flex justify-center">
              <CreateTopicDialog />
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
