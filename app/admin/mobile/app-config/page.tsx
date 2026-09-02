import { AdminPageHeader, AdminStatusBadge, NotConnected } from '@/components/admin/admin-ui';
import { requireAdminPage } from '@/lib/admin/session';

const fields = [
  ['Bakım modu', 'maintenanceMode', 'boolean'],
  ['Minimum sürüm', 'minimumSupportedVersion', 'text'],
  ['Güncel sürüm', 'latestVersion', 'text'],
  ['Duyuru başlığı', 'announcement.title', 'text'],
  ['Duyuru mesajı', 'announcement.message', 'text'],
  ['Eşleşme', 'features.matchingEnabled', 'boolean'],
  ['Direkt mesaj', 'features.directMessagesEnabled', 'boolean'],
  ['Grup sohbeti', 'features.groupChatEnabled', 'boolean'],
  ['Android mağaza URL', 'store.androidUrl', 'url'],
  ['iOS mağaza URL', 'store.iosUrl', 'url'],
] as const;

export default async function AppConfigPage() {
  await requireAdminPage('appConfig.read');
  return <main className="admin-main" id="ana-icerik"><AdminPageHeader eyebrow="Mobil uygulama" title="Uygulama Ayarları" description="Uzak operasyon ayarlarının mobilde gerçekten tüketildiği durumu görün." /><NotConnected title="Remote config tüketimi bağlı değil">Mobil istemcinin bu şemayı güvenli biçimde okuduğu doğrulanmadı. Bu nedenle üretimde etkisiz veya tehlikeli kontroller kaydedilemez.</NotConnected><section className="admin-editor-section"><div className="admin-section-heading"><div><p className="admin-kicker">Gelecek / bağlı değil</p><h2>Önerilen yapılandırma</h2></div><AdminStatusBadge tone="warning">Salt okunur taslak</AdminStatusBadge></div><div className="admin-form-grid">{fields.map(([label, name, type]) => <label key={name}><span>{label}</span>{type === 'boolean' ? <select disabled name={name}><option>Devre dışı</option><option>Etkin</option></select> : <input disabled name={name} placeholder="Mobil bağlantı sonrası kullanılabilir" type={type} />}</label>)}</div></section></main>;
}
