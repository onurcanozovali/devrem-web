'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ShieldCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toast';
import type { MilitaryUnitInput } from '@/lib/admin/operations';

const emptyUnit: MilitaryUnitInput = {
  name: '',
  city: '',
  district: '',
  force: '',
  verificationStatus: 'unverified',
  publicationStatus: 'draft',
  latitude: null,
  longitude: null,
  mapStatus: 'query-only',
  about: '',
  transport: '',
  facilities: '',
  notes: '',
};

export function MilitaryUnitEditor({
  unitId,
  initial,
  isNew,
}: {
  unitId: string;
  initial?: Partial<MilitaryUnitInput>;
  isNew: boolean;
}) {
  const router = useRouter();
  const [unit, setUnit] = useState<MilitaryUnitInput>({ ...emptyUnit, ...initial });
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function field<K extends keyof MilitaryUnitInput>(key: K, value: MilitaryUnitInput[K]) {
    setUnit((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/mobile/military-units/${encodeURIComponent(unitId)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ unit, reason }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Birlik kaydedilemedi.');
      setOpen(false);
      toast.add({ title: isNew ? 'Birlik taslağı oluşturuldu.' : 'Birlik güncellendi.', type: 'success' });
      router.push(`/admin/mobile/military-units/${encodeURIComponent(unitId)}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Birlik kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="admin-unit-editor">
        <section className="admin-editor-section"><div className="admin-section-heading"><div><p className="admin-kicker">Kimlik</p><h2>Birlik bilgileri</h2></div></div><div className="admin-form-grid"><label><span>Birlik adı</span><input onChange={(event) => field('name', event.target.value)} value={unit.name} /></label><label><span>Kuvvet</span><input onChange={(event) => field('force', event.target.value)} value={unit.force} /></label><label><span>Şehir</span><input onChange={(event) => field('city', event.target.value)} value={unit.city} /></label><label><span>İlçe</span><input onChange={(event) => field('district', event.target.value)} value={unit.district} /></label></div></section>
        <section className="admin-editor-section"><div className="admin-section-heading"><div><p className="admin-kicker">Konum</p><h2>Harita ve doğrulama</h2></div></div><div className="admin-form-grid"><label><span>Doğrulama</span><select onChange={(event) => field('verificationStatus', event.target.value as MilitaryUnitInput['verificationStatus'])} value={unit.verificationStatus}><option value="unverified">Doğrulanmadı</option><option value="reviewing">İnceleniyor</option><option value="verified">Doğrulandı</option></select></label><label><span>Yayın akışı</span><select onChange={(event) => field('publicationStatus', event.target.value as MilitaryUnitInput['publicationStatus'])} value={unit.publicationStatus}><option value="draft">Taslak</option><option value="reviewed">İncelendi</option><option value="published">Yayınlandı (CMS)</option></select></label><label><span>Harita durumu</span><select onChange={(event) => field('mapStatus', event.target.value as MilitaryUnitInput['mapStatus'])} value={unit.mapStatus}><option value="query-only">Yalnızca sorgu</option><option value="candidate">Doğrulanmamış aday</option><option value="verified">Doğrulanmış koordinat</option></select></label><label><span>Enlem</span><input inputMode="decimal" onChange={(event) => field('latitude', event.target.value ? Number(event.target.value) : null)} value={unit.latitude ?? ''} /></label><label><span>Boylam</span><input inputMode="decimal" onChange={(event) => field('longitude', event.target.value ? Number(event.target.value) : null)} value={unit.longitude ?? ''} /></label></div><p className="admin-field-note">Koordinat yalnızca kaynak doğrulandıktan sonra “Doğrulanmış” işaretlenebilir.</p></section>
        <section className="admin-editor-section"><div className="admin-section-heading"><div><p className="admin-kicker">İçerik</p><h2>Operasyon notları</h2></div></div><div className="admin-form-grid"><label className="admin-field-full"><span>Hakkında</span><textarea onChange={(event) => field('about', event.target.value)} rows={4} value={unit.about} /></label><label className="admin-field-full"><span>Ulaşım</span><textarea onChange={(event) => field('transport', event.target.value)} rows={4} value={unit.transport} /></label><label className="admin-field-full"><span>Olanaklar</span><textarea onChange={(event) => field('facilities', event.target.value)} rows={4} value={unit.facilities} /></label><label className="admin-field-full"><span>Hedef kitle / notlar</span><textarea onChange={(event) => field('notes', event.target.value)} rows={4} value={unit.notes} /></label></div></section>
      </div>
      <button className="admin-primary-action" onClick={() => setOpen(true)} type="button"><Save className="size-4" aria-hidden="true" /> {isNew ? 'Taslak oluştur' : 'Değişiklikleri kaydet'}</button>
      <AlertDialog open={open} onOpenChange={setOpen}><AlertDialogContent className="admin-confirm-dialog"><AlertDialogHeader><AlertDialogMedia><ShieldCheck aria-hidden="true" /></AlertDialogMedia><AlertDialogTitle>{isNew ? 'Birlik taslağı oluşturulsun mu?' : 'Birlik kaydı güncellensin mi?'}</AlertDialogTitle><AlertDialogDescription>Değişiklik CMS hazırlık alanına yazılır ve audit kaydı oluşturulur. Mobil uygulamanın paketli kataloğu değişmez.</AlertDialogDescription></AlertDialogHeader><label><span>İşlem gerekçesi</span><textarea maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Kaynak veya değişiklik nedeni (en az 8 karakter)" rows={4} value={reason} /></label>{error ? <p className="admin-form-error">{error}</p> : null}<AlertDialogFooter><AlertDialogCancel disabled={busy}>Vazgeç</AlertDialogCancel><button className="admin-confirm-submit" disabled={busy || reason.trim().length < 8} onClick={save} type="button">{busy ? 'Kaydediliyor…' : 'Onayla ve kaydet'}</button></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  );
}
