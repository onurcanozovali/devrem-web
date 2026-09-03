'use client';

import { useState } from 'react';
import { CommunityThreadMessage } from '@/components/community/community-thread-message';
import type { CommunityReply } from '@/lib/community/types';
import { Button } from '@/components/ui/button';

export function MoreReplies({
  topicId,
  topicSlug,
  cursor,
  startPostNumber,
}: {
  topicId: string;
  topicSlug: string;
  cursor: string;
  startPostNumber: number;
}) {
  const [items, setItems] = useState<CommunityReply[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(cursor);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (!nextCursor && items.length === 0) return null;

  return (
    <div>
      {items.map((reply, index) => (
        <CommunityThreadMessage
          key={reply.id}
          topicId={topicId}
          topicSlug={topicSlug}
          message={reply}
          messageType="reply"
          postNumber={startPostNumber + index}
        />
      ))}
      {error ? (
        <p className="px-5 py-3 text-sm text-destructive">{error}</p>
      ) : null}
      {nextCursor ? (
        <div className="border-t border-border p-4 text-center">
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
