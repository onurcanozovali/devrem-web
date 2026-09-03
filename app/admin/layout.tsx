import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/admin-nav';
import { Toaster } from '@/components/ui/toast';
import { getCurrentAdmin } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Yönetim',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const identity = await getCurrentAdmin();
  return (
    <div className="admin-shell">
      {identity ? (
        <div className="admin-workspace">
          <AdminNav identity={identity} />
          <div className="admin-workspace-content">{children}</div>
          <Toaster />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
