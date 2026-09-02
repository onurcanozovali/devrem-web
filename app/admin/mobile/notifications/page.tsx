import { AdminPageHeader, NotConnected } from '@/components/admin/admin-ui';
import { NotificationConsole } from '@/components/admin/notification-console';
import { requireAdminPage } from '@/lib/admin/session';

export default async function NotificationsPage() {
  await requireAdminPage('notifications.read');
  return <main className="admin-main" id="ana-icerik"><AdminPageHeader eyebrow="Mobil uygulama" title="Bildirimler" description="Push içeriğini ve güvenli hedeflemeyi gönderim öncesinde hazırla." /><NotConnected title="FCM toplu gönderim işi bağlı değil">Mevcut bildirim altyapısı işlemsel bildirimlerle sınırlı. Tarayıcı isteğinden toplu FCM gönderilmez; hedef sayımı, test gönderimi ve kuyruklu Function doğrulanana kadar düğmeler kapalıdır.</NotConnected><NotificationConsole /></main>;
}
