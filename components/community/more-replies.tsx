'use client';

import { useState } from 'react';
import { CommunityReportButton } from '@/components/community/report-button';
import { formatCommunityDate } from '@/lib/community/text';
import type { CommunityReply } from '@/lib/community/types';
import { Button } from '@/components/ui/button';

export function MoreReplies({
  topicId,
  cursor,
}: {
  topicId: string;
  cursor: string;
}) {
  const [items, setItems] = useState<CommunityReply[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(cursor);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (!nextCursor && items.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      {items.map((reply) => (
        <article
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
              topicId={topicId}
            />
          </div>
        </article>
      ))}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {nextCursor ? (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full px-4"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setError('');
              try {
                const response = await fetch(
                  `/api/community/topics/${topicId}/replies?cursor=${encodeURIComponent(nextCursor)}`,
                );
                const payload = (await response.json()) as {
                  replies?: CommunityReply[];
                  nextCursor?: string | null;
                  error?: string;
                };
                if (!response.ok) {
                  throw new Error(payload.error || 'Yanıtlar yüklenemedi.');
                }
                setItems((current) => [...current, ...(payload.replies ?? [])]);
                setNextCursor(payload.nextCursor ?? null);
              } catch (loadError) {
                setError(
                  loadError instanceof Error
                    ? loadError.message
                    : 'Yanıtlar yüklenemedi.',
                );
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? 'Yükleniyor…' : 'Daha fazla yanıt'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
