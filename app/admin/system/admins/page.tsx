import { ReasonAction } from '@/components/admin/reason-action';
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge, NotConnected } from '@/components/admin/admin-ui';
import { listFirebaseAdminUsers } from '@/lib/firebase/auth-admin';
import { requireAdminPage } from '@/lib/admin/session';
import { adminRoleLabels, adminRoles } from '@/src/admin/access';
import { formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

export default async function AdminUsersSystemPage() {
  const identity = await requireAdminPage('admins.read');
  let admins: Awaited<ReturnType<typeof listFirebaseAdminUsers>> = [];
  let error = '';
  try {
    admins = await listFirebaseAdminUsers();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Admin kullanıcıları alınamadı.';
  }
  return <main className="admin-main" id="ana-icerik"><AdminPageHeader eyebrow="Sistem" title="Admin Kullanıcıları" description="Firebase Authentication custom claims ile yetkilendirilmiş admin hesapları." />{identity.provider === 'legacy' ? <NotConnected title="Geçici bootstrap oturumu aktif">Bu oturum sunucu tarafı legacy yönetici kimliği kullanıyor. Kalıcı yönetim için Firebase Authentication hesabına adminRole claim atanmalı ve FIREBASE_WEB_API_KEY yapılandırılmalı.</NotConnected> : null}{error ? <NotConnected title="Firebase Auth yönetimi bağlı değil">{error} Bu IAM yetkisi verilene kadar admin listesi ve rol değişiklikleri güvenli biçimde kapalıdır.</NotConnected> : <div className="admin-table-wrap"><table className="admin-post-table admin-ops-table"><thead><tr><th>Admin</th><th>Rol</th><th>Oluşturma</th><th>Son giriş</th><th>Rol işlemleri</th></tr></thead><tbody>{admins.map((admin) => <tr key={admin.uid}><td><strong>{admin.displayName}</strong><small>{admin.email} · {admin.uid}</small></td><td><AdminStatusBadge tone={admin.role === 'super_admin' ? 'info' : 'neutral'}>{adminRoleLabels[admin.role]}</AdminStatusBadge></td><td>{formatAdminDate(admin.createdAt)}</td><td>{formatAdminDate(admin.lastLoginAt)}</td><td><div className="admin-role-actions">{adminRoles.filter((role) => role !== admin.role).map((role) => <ReasonAction key={role} label={adminRoleLabels[role]} title={`Rol ${adminRoleLabels[role]} olarak değişsin mi?`} description="Yeni yetkiler bir sonraki oturum doğrulamasından itibaren geçerli olur ve audit kaydı oluşturulur." endpoint={`/api/admin/system/admins/${encodeURIComponent(admin.uid)}/role`} payload={{ role }} tone={role === 'super_admin' ? 'neutral' : 'danger'} successMessage="Admin rolü güncellendi." />)}<ReasonAction label="Erişimi kaldır" title="Admin erişimi kaldırılsın mı?" description="Kullanıcının Firebase hesabı silinmez; yalnızca admin claim’leri kaldırılır. Son süper admin korunur." endpoint={`/api/admin/system/admins/${encodeURIComponent(admin.uid)}/role`} payload={{ role: null }} tone="danger" successMessage="Admin erişimi kaldırıldı." /></div></td></tr>)}</tbody></table>{!admins.length ? <AdminEmptyState title="Firebase admin hesabı bulunamadı" description="Custom claim taşıyan hesaplar burada görünür." /> : null}</div>}<p className="admin-field-note">Kimlik sorgusu performans ve gizlilik için en fazla 200 Firebase Auth hesabıyla sınırlandırılır; e-posta ve telefon varsayılan mobil kullanıcı listesine taşınmaz.</p></main>;
}
