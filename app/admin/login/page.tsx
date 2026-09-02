import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { getCurrentAdmin } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect('/admin/dashboard');
  return (
    <main className="admin-login-page" id="ana-icerik">
      <section className="admin-login-card">
        <div className="admin-login-mark">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
        <p className="admin-kicker">Devrem yayın paneli</p>
        <h1>Blog yönetimi</h1>
        <p>Yazıları oluşturmak, önizlemek ve yayınlamak için giriş yap.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
