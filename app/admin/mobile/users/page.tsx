import Link from 'next/link';
import { Search, ShieldAlert } from 'lucide-react';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPagination,
  AdminStatusBadge,
} from '@/components/admin/admin-ui';
import { listAdminUsers } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { accountStatusLabels, isAccountStatus } from '@/src/admin/domain';
import { formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage('users.read');
  const raw = await searchParams;
  const statusValue = first(raw.status);
  const filters = {
    q: first(raw.q),
    searchField: first(raw.searchField) as 'name' | 'surname' | 'uid' | undefined,
    status: isAccountStatus(statusValue) ? statusValue : undefined,
    period: first(raw.period),
    city: first(raw.city),
    unit: first(raw.unit),
    militaryType: first(raw.militaryType),
    registeredFrom: first(raw.registeredFrom),
    registeredTo: first(raw.registeredTo),
    cursor: first(raw.cursor),
  };
  const { users, nextCursor } = await listAdminUsers(filters);
  const nextQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key !== 'cursor' && value) nextQuery.set(key, value);
  }
  const nextHref = `/admin/mobile/users${nextQuery.size ? `?${nextQuery}` : ''}`;

  return (
    <main className="admin-main" id="ana-icerik">
      <AdminPageHeader
        eyebrow="Mobil uygulama"
        title="Kullanıcılar"
        description="Operasyon için gerekli profilleri güvenli, sınırlı ve sayfalı olarak incele."
      />
      <form className="admin-filter-panel">
        <label className="admin-filter-search">
          <span>Güvenli arama</span>
          <div><Search className="size-4" aria-hidden="true" /><input defaultValue={filters.q} name="q" placeholder="Tam ad, soyad veya UID" /></div>
        </label>
        <label><span>Alan</span><select defaultValue={filters.searchField ?? 'name'} name="searchField"><option value="name">Ad</option><option value="surname">Soyad</option><option value="uid">UID</option></select></label>
        <label><span>Hesap durumu</span><select defaultValue={filters.status ?? ''} name="status"><option value="">Tümü</option><option value="active">Aktif</option><option value="suspended">Askıya alınmış</option><option value="banned">Yasaklı</option></select></label>
        <label><span>Hizmet dönemi</span><input defaultValue={filters.period} name="period" type="month" /></label>
        <label><span>Askerî şehir kodu</span><input defaultValue={filters.city} max="81" min="1" name="city" type="number" /></label>
        <label><span>Birlik kimliği</span><input defaultValue={filters.unit} name="unit" /></label>
        <label><span>Askerlik türü</span><input defaultValue={filters.militaryType} name="militaryType" /></label>
        <label><span>Kayıt başlangıcı</span><input defaultValue={filters.registeredFrom} name="registeredFrom" type="date" /></label>
        <label><span>Kayıt bitişi</span><input defaultValue={filters.registeredTo} name="registeredTo" type="date" /></label>
        <div className="admin-filter-actions"><button type="submit">Filtrele</button><Link href="/admin/mobile/users">Temizle</Link></div>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-post-table admin-ops-table">
          <thead><tr><th>Kullanıcı</th><th>Durum</th><th>Kayıt</th><th>Dönem</th><th>Şehir / Birlik</th><th>Tür</th><th>Devre</th><th><span className="sr-only">İşlem</span></th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid}>
                <td><span className="admin-user-cell"><span className="admin-avatar-placeholder">{user.firstName.slice(0, 1)}{user.lastName.slice(0, 1)}</span><span><strong>{user.firstName} {user.lastName}</strong><small>{user.uid}</small></span>{user.hasReports ? <ShieldAlert className="size-4 text-amber-700" aria-label="Rapor geçmişi var" /> : null}</span></td>
                <td><AdminStatusBadge tone={user.status === 'active' ? 'success' : user.status === 'banned' ? 'danger' : 'warning'}>{accountStatusLabels[user.status]}</AdminStatusBadge></td>
                <td>{formatAdminDate(user.createdAt, false)}</td>
                <td>{user.militaryPeriod}</td>
                <td><strong>{user.militaryCity ?? '—'}</strong><small>{user.militaryUnit}</small></td>
                <td>{user.militaryType}</td>
                <td>{user.groupId ?? '—'}</td>
                <td><Link className="admin-table-link" href={`/admin/mobile/users/${encodeURIComponent(user.uid)}`}>İncele →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length ? <AdminEmptyState title="Kullanıcı bulunamadı" description="Filtreleri değiştirerek tekrar deneyin." /> : null}
      </div>
      <AdminPagination nextCursor={nextCursor} nextHref={nextHref} />
    </main>
  );
}
