'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toast';

export function ReasonAction({
  label,
  title,
  description,
  endpoint,
  payload,
  tone = 'neutral',
  successMessage = 'İşlem tamamlandı.',
}: {
  label: string;
  title: string;
  description: string;
  endpoint: string;
  payload: Record<string, unknown>;
  tone?: 'neutral' | 'danger';
  successMessage?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload, reason }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'İşlem tamamlanamadı.');
      setOpen(false);
      setReason('');
      toast.add({ title: successMessage, type: 'success' });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'İşlem tamamlanamadı.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={`admin-action-button${tone === 'danger' ? ' is-danger' : ''}`}
      >
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent className="admin-confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <ShieldAlert aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <label>
          <span>İşlem gerekçesi</span>
          <textarea
            maxLength={500}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Audit kaydında görünecek açıklama (en az 8 karakter)"
            rows={4}
            value={reason}
          />
        </label>
        {error ? <p className="admin-form-error">{error}</p> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Vazgeç</AlertDialogCancel>
          <button
            className={`admin-confirm-submit${tone === 'danger' ? ' is-danger' : ''}`}
            disabled={busy || reason.trim().length < 8}
            onClick={submit}
            type="button"
          >
            {busy ? 'İşleniyor…' : 'Onayla'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
