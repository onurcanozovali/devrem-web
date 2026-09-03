'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { communityRequest } from '@/lib/community/client-session';
import {
  communityCategories,
  type CommunityCategoryId,
} from '@/lib/community/constants';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

export function CreateTopicDialog({
  triggerClassName,
  triggerLabel = 'Konu Aç',
}: {
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<CommunityCategoryId>('genel');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError('');
      }}
    >
      <DialogTrigger
        render={
          <Button className={triggerClassName ?? 'h-10 rounded-full px-5'} />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni konu</DialogTitle>
          <DialogDescription>
            Sorunu veya deneyimini düz metin olarak paylaş. Hesap oluşturmana
            gerek yok.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            setPending(true);
            try {
              const result = await communityRequest<{
                topic: { slug: string };
              }>('/api/community/topics', {
                category,
                title,
                body,
                nickname,
              });
              setOpen(false);
              setTitle('');
              setBody('');
              setNickname('');
              router.push(`/topluluk/${result.topic.slug}`);
              router.refresh();
            } catch (submitError) {
              setError(
                submitError instanceof Error
                  ? submitError.message
                  : 'Konu açılamadı.',
              );
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="community-category">Kategori</Label>
            <NativeSelect
              id="community-category"
              required
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as CommunityCategoryId)
              }
            >
              {communityCategories.map((item) => (
                <NativeSelectOption key={item.id} value={item.id}>
                  {item.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="community-title">Başlık</Label>
            <Input
              id="community-title"
              required
              minLength={10}
              maxLength={140}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Örn. Sevk belgesini ne zaman almalıyım?"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="community-body">İçerik</Label>
            <Textarea
              id="community-body"
              required
              minLength={20}
              maxLength={5000}
              rows={7}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Durumunu kısaca anlat. Resmî bilgi yerine kendi deneyimini ve sorununu yaz."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="community-nickname">Takma ad (isteğe bağlı)</Label>
            <Input
              id="community-nickname"
              maxLength={32}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="Boş bırakırsan Anonim Devre görünür"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter className="px-0">
            <Button type="submit" disabled={pending} className="h-10 px-4">
              {pending ? 'Gönderiliyor…' : 'Konuyu yayınla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
