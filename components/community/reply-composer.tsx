'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COMMUNITY_REPLY_EVENT } from '@/components/community/community-message-actions';
import { communityRequest } from '@/lib/community/client-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ReplyComposer({
  topicId,
  locked,
}: {
  topicId: string;
  locked: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    authorDisplayName: string;
    preview: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleReply(event: Event) {
      const detail = (event as CustomEvent<typeof replyTo>).detail;
      if (!detail) return;
      setReplyTo(detail);
      window.setTimeout(() => textareaRef.current?.focus(), 350);
    }
    window.addEventListener(COMMUNITY_REPLY_EVENT, handleReply);
    return () => window.removeEventListener(COMMUNITY_REPLY_EVENT, handleReply);
  }, []);

  if (locked) {
    return (
      <p className="rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-secondary-foreground">
        Bu konu yanıtlara kapatıldı.
      </p>
    );
  }

  return (
    <form
      id="yanit-yaz"
      className="scroll-mt-24 border-t border-border bg-surface p-4 sm:p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setError('');
        setPending(true);
        try {
          await communityRequest(`/api/community/topics/${topicId}/replies`, {
            body,
            nickname,
            replyToId: replyTo?.id ?? null,
          });
          setBody('');
          setReplyTo(null);
          router.refresh();
        } catch (submitError) {
          setError(
            submitError instanceof Error
              ? submitError.message
              : 'Yanıt gönderilemedi.',
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <h2 className="text-base font-bold tracking-[-0.03em]">Yanıt yaz</h2>
      <p className="mt-1 text-sm text-secondary-foreground">
        Hesap oluşturmana gerek yok. İlk gönderinde görünmez bir oturum açılır.
      </p>
      {replyTo ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-primary-subtle px-3 py-2.5 text-xs">
          <div className="min-w-0 flex-1">
            <strong className="text-primary-ink">
              {replyTo.authorDisplayName} adlı devreye yanıt
            </strong>
            <p className="mt-0.5 truncate text-secondary-foreground">
              {replyTo.preview}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-muted-foreground transition hover:bg-white hover:text-foreground"
            onClick={() => setReplyTo(null)}
            aria-label="Yanıt hedefini kaldır"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <Label className="sr-only" htmlFor="community-reply">
        Yanıt
      </Label>
      <Textarea
        ref={textareaRef}
        id="community-reply"
        className="mt-4 min-h-28"
        required
        minLength={4}
        maxLength={3000}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Deneyimini veya kısa cevabını yaz"
      />
      <div className="mt-3 grid gap-2">
        <Label htmlFor="community-reply-nickname" className="text-xs">
          Takma ad (isteğe bağlı)
        </Label>
        <Input
          id="community-reply-nickname"
          maxLength={32}
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Boş bırakırsan DevreXXXX atanır"
        />
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-4 flex justify-end">
        <Button
          type="submit"
          disabled={pending}
          className="h-10 min-w-24 rounded-full px-5"
        >
          {pending ? 'Yayınlanıyor…' : 'Yanıtı yayınla'}
        </Button>
      </div>
    </form>
  );
}
