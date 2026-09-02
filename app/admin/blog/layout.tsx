import { requireAdminPage } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export default async function AdminBlogLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminPage('blog.read');
  return <div className="admin-app">{children}</div>;
}
