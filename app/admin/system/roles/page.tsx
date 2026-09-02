import { AdminPageHeader } from '@/components/admin/admin-ui';
import { requireAdminPage } from '@/lib/admin/session';
import { adminRoleLabels, adminRoles, permissions, permissionsForRole } from '@/src/admin/access';

const permissionLabels: Record<(typeof permissions)[number], string> = {
  'dashboard.read': 'Dashboard görüntüleme',
  'blog.read': 'Blog görüntüleme',
  'blog.write': 'Blog yayın yönetimi',
  'web.read': 'Web içerik alanları',
  'users.read': 'Kullanıcı arama/detay',
  'users.moderate': 'Kullanıcı moderasyonu',
  'reports.read': 'Rapor görüntüleme',
  'reports.moderate': 'Rapor işlemleri',
  'groups.read': 'Grup görüntüleme',
  'groups.manage': 'Grup durumu yönetimi',
  'units.read': 'Birlik içeriği görüntüleme',
  'units.write': 'Birlik içeriği düzenleme',
  'notifications.read': 'Bildirim hazırlığı',
  'notifications.test': 'Test bildirim',
  'notifications.broadcast': 'Toplu bildirim',
  'appConfig.read': 'Uygulama ayarı görüntüleme',
  'appConfig.write': 'Uygulama ayarı değiştirme',
  'analytics.read': 'İstatistikler',
  'admins.read': 'Admin kullanıcıları',
  'admins.write': 'Admin rol yönetimi',
  'audit.read': 'Audit log',
};

export default async function RolesPage() {
  await requireAdminPage('admins.read');
  return <main className="admin-main" id="ana-icerik"><AdminPageHeader eyebrow="Sistem" title="Roller & Yetkiler" description="Tüm sunucu route’larının kullandığı merkezi yetki matrisi. UI görünürlüğü tek başına yetkilendirme sayılmaz." /><div className="admin-table-wrap"><table className="admin-permission-table"><thead><tr><th>Yetki</th>{adminRoles.map((role) => <th key={role}>{adminRoleLabels[role]}</th>)}</tr></thead><tbody>{permissions.map((permission) => <tr key={permission}><td><strong>{permissionLabels[permission]}</strong><small>{permission}</small></td>{adminRoles.map((role) => <td key={role}>{permissionsForRole(role).includes(permission) ? <span aria-label="Yetkili" className="admin-permission-yes">✓</span> : <span aria-label="Yetkisiz" className="admin-permission-no">—</span>}</td>)}</tr>)}</tbody></table></div></main>;
}
