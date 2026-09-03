'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { communityRequest } from '@/lib/community/client-session';
import {
  communityReportReasons,
  type CommunityReportReason,
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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

export function CommunityReportButton({
  targetType,
  targetId,
  topicId,
}: {
  targetType: 'topic' | 'reply';
  targetId: string;
  topicId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<CommunityReportReason>('Spam');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            className="h-8 gap-1 px-2 text-xs text-muted-foreground"
          />
        }
      >
        <Flag className="size-3.5" aria-hidden="true" />
        Bildir
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>İçeriği bildir</DialogTitle>
          <DialogDescription>
            Şikayetler inceleme kuyruğuna düşer. Kötüye kullanım için kullanma.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <p className="text-sm text-primary-ink">Bildirimin alındı.</p>
        ) : (
          <label className="grid gap-2 text-sm font-medium">
            Neden
            <NativeSelect
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as CommunityReportReason)
              }
            >
              {communityReportReasons.map((item) => (
                <NativeSelectOption key={item} value={item}>
                  {item}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
        )}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          {done ? (
            <Button type="button" onClick={() => setOpen(false)}>
              Kapat
            </Button>
          ) : (
            <Button
              type="button"
              disabled={pending}
              onClick={async () => {
                setError('');
                setPending(true);
                try {
                  await communityRequest('/api/community/reports', {
                    targetType,
                    targetId,
                    topicId,
                    reason,
                  });
                  setDone(true);
                } catch (reportError) {
                  setError(
                    reportError instanceof Error
                      ? reportError.message
                      : 'Bildirim gönderilemedi.',
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              {pending ? 'Gönderiliyor…' : 'Bildirimi gönder'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
