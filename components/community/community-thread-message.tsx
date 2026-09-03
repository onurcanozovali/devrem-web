'use client';

import Link from 'next/link';
import { CommunityMessageActions } from '@/components/community/community-message-actions';
import { formatCommunityDate } from '@/lib/community/text';
import type { CommunityMessageTarget } from '@/lib/community/types';

export function CommunityThreadMessage({
  topicId,
  topicSlug,
  message,
  messageType,
  postNumber,
}: {
  topicId: string;
  topicSlug: string;
  message: {
    id: string;
    body: string;
    authorDisplayName: string;
    createdAt: string;
    likeCount: number;
    replyToId?: string | null;
    replyToAuthorDisplayName?: string | null;
  };
  messageType: CommunityMessageTarget;
  postNumber: number;
}) {
  return (
    <article
      id={`mesaj-${message.id}`}
      className="community-thread-message scroll-mt-24 border-b border-border px-4 py-5 last:border-b-0 sm:px-6 sm:py-6"
    >
      <div className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary-ink sm:size-11"
          aria-hidden="true"
        >
          {message.authorDisplayName.slice(0, 1).toLocaleUpperCase('tr-TR')}
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <strong className="truncate text-sm font-bold text-foreground">
              {message.authorDisplayName}
            </strong>
            <Link
              className="text-xs text-muted-foreground transition hover:text-primary-ink"
              href={`/topluluk/${topicSlug}#mesaj-${message.id}`}
              aria-label={`${postNumber}. mesajın kalıcı bağlantısı`}
            >
              {formatCommunityDate(message.createdAt)} · #{postNumber}
            </Link>
          </div>
          {message.replyToId && message.replyToAuthorDisplayName ? (
            <Link
              className="mt-3 block rounded-xl border-l-2 border-primary bg-primary-subtle px-3 py-2 text-xs font-medium text-secondary-foreground transition hover:text-primary-ink"
              href={`/topluluk/${topicSlug}#mesaj-${message.replyToId}`}
            >
              ↳ {message.replyToAuthorDisplayName} adlı devreye yanıt
            </Link>
          ) : null}
          <p className="mt-3 whitespace-pre-wrap break-words text-[0.95rem] leading-7 text-foreground sm:text-base">
            {message.body}
          </p>
          <CommunityMessageActions
            topicId={topicId}
            topicSlug={topicSlug}
            messageId={message.id}
            messageType={messageType}
            authorDisplayName={message.authorDisplayName}
            body={message.body}
            initialLikeCount={message.likeCount}
          />
        </div>
      </div>
    </article>
  );
}
