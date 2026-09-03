import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { categoryLabel } from '@/lib/community/constants';
import {
  formatRelativeCommunityDate,
  previewText,
} from '@/lib/community/text';
import type { CommunityTopic } from '@/lib/community/types';

export function TopicListItem({ topic }: { topic: CommunityTopic }) {
  const avatarLabel =
    topic.authorDisplayName
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toLocaleUpperCase('tr-TR') || 'D';

  return (
    <article className="border-b border-border/80 last:border-b-0">
      <Link
        className="grid grid-cols-[36px_minmax(0,1fr)_auto] gap-3 px-3 py-3.5 outline-none transition-colors hover:bg-muted/45 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30 sm:grid-cols-[40px_minmax(0,1fr)_76px] sm:gap-4 sm:px-4"
        href={`/topluluk/${topic.slug}`}
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-primary-subtle text-xs font-bold text-primary-ink sm:size-10">
          {avatarLabel}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-bold tracking-[-0.025em] text-foreground sm:text-base">
            {topic.title}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-secondary-foreground sm:line-clamp-1 sm:text-[13px]">
            {previewText(topic.body, 190)}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
            <span className="font-semibold text-primary-ink">
              {categoryLabel(topic.category)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{topic.authorDisplayName}</span>
            <span aria-hidden="true">·</span>
            <span>{formatRelativeCommunityDate(topic.createdAt)}</span>
            {topic.lastActivityAt !== topic.createdAt ? (
              <>
                <span className="hidden sm:inline" aria-hidden="true">
                  ·
                </span>
                <span className="hidden sm:inline">
                  son hareket {formatRelativeCommunityDate(topic.lastActivityAt)}
                </span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex min-w-11 items-center justify-end gap-1.5 self-center text-xs font-semibold text-muted-foreground sm:justify-center">
          <MessageCircle className="size-4" aria-hidden="true" />
          <span>{topic.replyCount}</span>
          <span className="sr-only">yanıt</span>
        </div>
      </Link>
    </article>
  );
}
