'use client';

import { useState } from 'react';
import { Heart, Reply, Share2 } from 'lucide-react';
import { CommunityReportButton } from '@/components/community/report-button';
import { Button } from '@/components/ui/button';
import { communityRequest } from '@/lib/community/client-session';
import type { CommunityMessageTarget } from '@/lib/community/types';

export const COMMUNITY_REPLY_EVENT = 'devrem:community-reply';

type ReplyEventDetail = {
  id: string;
  authorDisplayName: string;
  preview: string;
};

export function CommunityMessageActions({
  topicId,
  topicSlug,
  messageId,
  messageType,
  authorDisplayName,
  body,
  initialLikeCount,
}: {
  topicId: string;
  topicSlug: string;
  messageId: string;
  messageType: CommunityMessageTarget;
  authorDisplayName: string;
  body: string;
  initialLikeCount: number;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState('');

  function selectReplyTarget() {
    const detail: ReplyEventDetail = {
      id: messageId,
      authorDisplayName,
      preview: body.replace(/\s+/g, ' ').trim().slice(0, 110),
    };
    window.dispatchEvent(
      new CustomEvent<ReplyEventDetail>(COMMUNITY_REPLY_EVENT, { detail }),
    );
    document
      .getElementById('yanit-yaz')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function shareMessage() {
    const url = `${window.location.origin}/topluluk/${topicSlug}#mesaj-${messageId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Devrem Topluluğu · ${authorDisplayName}`,
          url,
        });
        setFeedback('Mesaj paylaşıldı.');
      } else {
        await navigator.clipboard.writeText(url);
        setFeedback('Bağlantı kopyalandı.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setFeedback('Bağlantı kopyalanamadı.');
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-1 text-muted-foreground">
      <Button
        type="button"
        variant="ghost"
        className="h-8 gap-1.5 rounded-full px-2.5 text-xs"
        onClick={selectReplyTarget}
      >
        <Reply className="size-3.5" aria-hidden="true" />
        Yanıtla
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={`h-8 gap-1.5 rounded-full px-2.5 text-xs ${liked ? 'text-primary-ink' : ''}`}
        aria-pressed={liked}
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setFeedback('');
          try {
            const result = await communityRequest<{
              liked: boolean;
              likeCount: number;
            }>(
              `/api/community/topics/${topicId}/messages/${messageId}/like`,
              { messageType },
              { cooldown: false },
            );
            setLiked(result.liked);
            setLikeCount(result.likeCount);
          } catch (error) {
            setFeedback(
              error instanceof Error ? error.message : 'Beğeni güncellenemedi.',
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <Heart
          className={`size-3.5 ${liked ? 'fill-current' : ''}`}
          aria-hidden="true"
        />
        {likeCount > 0 ? likeCount : 'Beğen'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-8 gap-1.5 rounded-full px-2.5 text-xs"
        onClick={shareMessage}
      >
        <Share2 className="size-3.5" aria-hidden="true" />
        Paylaş
      </Button>
      <CommunityReportButton
        targetType={messageType}
        targetId={messageId}
        topicId={topicId}
      />
      <span className="ml-auto text-xs" aria-live="polite">
        {feedback}
      </span>
    </div>
  );
}
