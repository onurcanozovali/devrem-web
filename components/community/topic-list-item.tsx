import Link from 'next/link';
import { categoryLabel } from '@/lib/community/constants';
import { formatCommunityDate, previewText } from '@/lib/community/text';
import type { CommunityTopic } from '@/lib/community/types';

export function TopicListItem({ topic }: { topic: CommunityTopic }) {
  return (
    <article className="border-b border-border/80 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <Link
        className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        href={`/topluluk/${topic.slug}`}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-primary-ink">
          <span className="rounded-full bg-primary-subtle px-2.5 py-1">
            {categoryLabel(topic.category)}
          </span>
          <span className="text-muted-foreground">
            {topic.replyCount} yanıt
          </span>
          {topic.likeCount > 0 ? (
            <span className="text-muted-foreground">{topic.likeCount} beğeni</span>
          ) : null}
        </div>
        <h2 className="mt-2 text-lg font-bold tracking-[-0.04em] text-foreground">
          {topic.title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-secondary-foreground">
          {previewText(topic.body, 150)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {topic.authorDisplayName}
          {' · '}
          {formatCommunityDate(topic.createdAt)}
          {' · son aktivite '}
          {formatCommunityDate(topic.lastActivityAt)}
        </p>
      </Link>
    </article>
  );
}
