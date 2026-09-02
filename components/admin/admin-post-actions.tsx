'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, Pencil, Send, Undo2 } from 'lucide-react';
import type { BlogStatus } from '@/src/blog/types';

export function AdminPostActions({
  id,
  status,
}: {
  id: string;
  status: BlogStatus;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="admin-row-actions">
      <Link href={`/admin/blog/${id}`}>
        <Pencil className="size-3.5" aria-hidden="true" /> Düzenle
      </Link>
      <Link href={`/admin/blog/${id}?preview=1`}>
        <Eye className="size-3.5" aria-hidden="true" /> Önizle
      </Link>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const response = await fetch(`/api/admin/blog/${id}/status`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              status: status === 'published' ? 'draft' : 'published',
            }),
          });
          setBusy(false);
          if (response.ok) window.location.reload();
        }}
        type="button"
      >
        {status === 'published' ? (
          <Undo2 className="size-3.5" aria-hidden="true" />
        ) : (
          <Send className="size-3.5" aria-hidden="true" />
        )}
        {status === 'published' ? 'Yayından kaldır' : 'Yayınla'}
      </button>
    </div>
  );
}
