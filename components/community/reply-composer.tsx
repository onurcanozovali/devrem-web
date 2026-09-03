'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  if (locked) {
    return (
      <p className="rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-secondary-foreground">
        Bu konu yanıtlara kapatıldı.
      </p>
    );
  }

  return (
    <form
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setError('');
        setPending(true);
        try {
          await communityRequest(`/api/community/topics/${topicId}/replies`, {
            body,
            nickname,
          });
          setBody('');
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
      <h2 className="text-base font-bold tracking-[-0.03em]">Yanıt Yaz</h2>
      <p className="mt-1 text-sm text-secondary-foreground">
        Hesap oluşturmana gerek yok. İlk gönderinde görünmez bir oturum açılır.
      </p>
      <Label className="sr-only" htmlFor="community-reply">
        Yanıt
      </Label>
      <Textarea
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
          placeholder="Boş bırakırsan Anonim Devre görünür"
        />
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={pending} className="h-10 min-w-24 rounded-full px-5">
          {pending ? 'Gönderiliyor…' : 'Gönder'}
        </Button>
      </div>
    </form>
  );
}
