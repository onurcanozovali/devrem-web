'use client';

import { useMemo, useState } from 'react';
import { Bell, FlaskConical, Send } from 'lucide-react';

export function NotificationConsole() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [target, setTarget] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const preview = useMemo(() => ({
    title: title.trim() || 'Bildirim başlığı',
    body: body.trim() || 'Gönderim öncesi bildirim metni burada görünür.',
  }), [title, body]);
  return (
    <div className="admin-console-grid">
      <section className="admin-editor-section"><div className="admin-section-heading"><div><p className="admin-kicker">Hazırlık</p><h2>Bildirim içeriği</h2></div></div><div className="admin-form-grid"><label className="admin-field-full"><span>Başlık</span><input maxLength={80} onChange={(event) => setTitle(event.target.value)} value={title} /></label><label className="admin-field-full"><span>Mesaj</span><textarea maxLength={220} onChange={(event) => setBody(event.target.value)} rows={4} value={body} /></label><label><span>Hedef kitle</span><select onChange={(event) => setAudience(event.target.value)} value={audience}><option value="all">Tüm uygun kullanıcılar</option><option value="period">Hizmet dönemi</option><option value="city">Askerî şehir</option><option value="unit">Askerî birlik</option><option value="type">Askerlik türü</option><option value="group">Belirli Devre grubu</option></select></label><label><span>Hedef değer</span><input disabled={audience === 'all'} onChange={(event) => setTarget(event.target.value)} placeholder={audience === 'all' ? 'Tüm uygun kullanıcılar' : 'Kimlik veya değer'} value={target} /></label><label><span>Deep link</span><input onChange={(event) => setDeepLink(event.target.value)} placeholder="devrem://..." value={deepLink} /></label><label><span>Planlanan zaman</span><input onChange={(event) => setScheduledAt(event.target.value)} type="datetime-local" value={scheduledAt} /></label></div></section>
      <aside className="admin-notification-preview"><div className="admin-phone-notification"><span><Bell className="size-4" aria-hidden="true" /></span><div><small>DEVREM</small><strong>{preview.title}</strong><p>{preview.body}</p></div></div><dl><div><dt>Hedef</dt><dd>{audience === 'all' ? 'Tüm uygun kullanıcılar' : target || 'Değer girilmedi'}</dd></div><div><dt>Zaman</dt><dd>{scheduledAt || 'Hemen'}</dd></div><div><dt>Tahmini alıcı</dt><dd>—</dd></div></dl><p>Hedef sayımı ve FCM gönderim işi bağlı olmadığı için gönderim kontrolleri kapalıdır.</p><div className="admin-action-row"><button disabled type="button"><FlaskConical className="size-4" aria-hidden="true" /> Test gönder</button><button disabled type="button"><Send className="size-4" aria-hidden="true" /> Gönderimi onayla</button></div></aside>
    </div>
  );
}
