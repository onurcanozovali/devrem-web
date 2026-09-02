import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { requireAdminPage } from '@/lib/admin/session';

export default async function AdminForbiddenPage() {
  await requireAdminPage();
  return (
    <main className="admin-main" id="ana-icerik">
      <div className="admin-forbidden-card">
        <ShieldAlert className="size-7" aria-hidden="true" />
        <h1>Bu alan için yetkiniz yok</h1>
        <p>Rolünüz bu işlemi veya modülü görüntüleme izni vermiyor.</p>
        <Link href="/admin/dashboard">Dashboard’a dön</Link>
      </div>
    </main>
  );
}
