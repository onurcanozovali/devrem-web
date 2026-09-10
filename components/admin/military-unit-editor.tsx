'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';
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
import type {
  MilitaryUnitFacility,
  MilitaryUnitInput,
  MilitaryUnitSource,
} from '@/lib/admin/operations';

const forces = [
  'Kara Kuvvetleri',
  'Deniz Kuvvetleri',
  'Hava Kuvvetleri',
  'Jandarma Genel Komutanlığı',
  'Sahil Güvenlik Komutanlığı',
  'Millî Savunma Bakanlığı',
];
const cities = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];
const audiences = ['Er / Erbaş', 'Bedelli', 'Yedek subay', 'Yedek astsubay'];
const unitTypes = ['Eğitim birliği', 'Tugay komutanlığı', 'Alay komutanlığı', 'Tabur komutanlığı', 'Kışla', 'Diğer'];
const facilityLabels: Array<[keyof MilitaryUnitInput['facilities'], string]> = [
  ['canteen', 'Kantin'],
  ['infirmary', 'Revir'],
  ['atm', 'ATM'],
  ['barber', 'Berber'],
  ['diningHall', 'Yemekhane'],
  ['communication', 'Telefon / iletişim'],
];

const emptyFacility = (): MilitaryUnitFacility => ({ status: 'unknown', note: '' });
const emptySource = (): MilitaryUnitSource => ({ title: '', url: '', note: '' });

const emptyUnit: MilitaryUnitInput = {
  name: '',
  shortName: '',
  aliases: [],
  city: '',
  district: '',
  force: '',
  unitType: '',
  audiences: [],
  verificationStatus: 'unverified',
  publicationStatus: 'draft',
  latitude: null,
  longitude: null,
  mapStatus: 'query-only',
  coordinateVerificationStatus: 'unverified',
  mapSourceUrl: '',
  address: '',
  transportation: { busStation: '', airport: '', trainStation: '', cityCenter: '', general: '' },
  introduction: '',
  verifiedFacts: [],
  joiningNotes: '',
  preparationNotes: '',
  facilities: {
    canteen: emptyFacility(), infirmary: emptyFacility(), atm: emptyFacility(),
    barber: emptyFacility(), diningHall: emptyFacility(), communication: emptyFacility(),
  },
  otherFacilities: [],
  sources: [emptySource()],
  verifiedAt: '',
  sourceNote: '',
  internalAdminNote: '',
  slug: '',
  seoTitle: '',
  metaDescription: '',
  indexable: false,
};

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/İ/g, 'i').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function initialUnit(initial?: Partial<MilitaryUnitInput>): MilitaryUnitInput {
  const legacy = (initial ?? {}) as Record<string, unknown>;
  const legacyText = (key: string) => typeof legacy[key] === 'string' ? legacy[key] as string : '';
  return {
    ...emptyUnit,
    ...initial,
    aliases: initial?.aliases ?? [],
    audiences: initial?.audiences ?? [],
    transportation: {
      ...emptyUnit.transportation,
      ...(initial?.transportation && typeof initial.transportation === 'object' ? initial.transportation : {}),
      general: initial?.transportation?.general || legacyText('transport'),
    },
    introduction: initial?.introduction || legacyText('about'),
    facilities: Object.fromEntries(
      facilityLabels.map(([key]) => [key, { ...emptyFacility(), ...initial?.facilities?.[key] }]),
    ) as MilitaryUnitInput['facilities'],
    otherFacilities: initial?.otherFacilities ?? [],
    sources: initial?.sources?.length ? initial.sources : [emptySource()],
    internalAdminNote: initial?.internalAdminNote || legacyText('notes') || (typeof legacy.facilities === 'string' ? legacy.facilities : ''),
    publicationStatus: initial?.publicationStatus === 'published' ? 'published' : 'draft',
  };
}

function Section({ title, eyebrow, open, children }: { title: string; eyebrow: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="admin-editor-section" open={open}>
      <summary className="admin-section-heading cursor-pointer select-none">
        <div><p className="admin-kicker">{eyebrow}</p><h2>{title}</h2></div>
        <span className="text-sm font-bold text-primary">Aç / kapat</span>
      </summary>
      <div className="mt-6">{children}</div>
    </details>
  );
}

export function MilitaryUnitEditor({ unitId, initial, isNew }: { unitId: string; initial?: Partial<MilitaryUnitInput>; isNew: boolean }) {
  const router = useRouter();
  const [unit, setUnit] = useState<MilitaryUnitInput>(() => initialUnit(initial));
  const [reason, setReason] = useState('');
  const [pendingStatus, setPendingStatus] = useState<MilitaryUnitInput['publicationStatus']>('draft');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function field<K extends keyof MilitaryUnitInput>(key: K, value: MilitaryUnitInput[K]) {
    setUnit((current) => ({ ...current, [key]: value }));
  }

  function updateName(name: string) {
    setUnit((current) => {
      const updateSlug = !current.slug || current.slug === slugify(current.name);
      return { ...current, name, slug: updateSlug ? slugify(name) : current.slug };
    });
  }

  function transport(key: keyof MilitaryUnitInput['transportation'], value: string) {
    setUnit((current) => ({ ...current, transportation: { ...current.transportation, [key]: value } }));
  }

  function facility(key: keyof MilitaryUnitInput['facilities'], value: Partial<MilitaryUnitFacility>) {
    setUnit((current) => ({
      ...current,
      facilities: { ...current.facilities, [key]: { ...current.facilities[key], ...value } },
    }));
  }

  function requestSave(status: MilitaryUnitInput['publicationStatus']) {
    if (!unit.name.trim() || !unit.city || !unit.force) {
      setError('Birlik adı, kuvvet ve şehir zorunludur.');
      return;
    }
    setPendingStatus(status);
    setError('');
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/mobile/military-units/${encodeURIComponent(unitId)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ unit: { ...unit, publicationStatus: pendingStatus }, reason }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Birlik kaydedilemedi.');
      setOpen(false);
      toast.add({ title: pendingStatus === 'published' ? 'Birlik yayın ayarları kaydedildi.' : 'Birlik taslağı kaydedildi.', type: 'success' });
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
        <Section eyebrow="1. Kimlik" open title="Birlik kimliği">
          <div className="admin-form-grid">
            <label className="admin-field-full"><span>Birlik adı *</span><input required onChange={(event) => updateName(event.target.value)} value={unit.name} /><small>Resmî veya kaynakta doğrulanmış tam ad.</small></label>
            <label><span>Kısa ad</span><input onChange={(event) => field('shortName', event.target.value)} value={unit.shortName} /></label>
            <label><span>Alias / diğer adlar</span><textarea onChange={(event) => field('aliases', event.target.value.split(/\n|,/).map((item) => item.trim()).filter(Boolean))} placeholder="Her satıra bir ad" rows={3} value={unit.aliases.join('\n')} /></label>
            <label><span>Kuvvet *</span><select required onChange={(event) => field('force', event.target.value)} value={unit.force}><option value="">Seçin</option>{forces.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Şehir *</span><select required onChange={(event) => field('city', event.target.value)} value={unit.city}><option value="">Seçin</option>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>İlçe</span><input onChange={(event) => field('district', event.target.value)} value={unit.district} /></label>
            <label><span>Birlik türü</span><select onChange={(event) => field('unitType', event.target.value)} value={unit.unitType}><option value="">Seçin</option>{unitTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <fieldset className="admin-field-full"><legend>Hedef askerlik / statü grupları</legend><div className="mt-3 flex flex-wrap gap-4">{audiences.map((item) => <label className="flex items-center gap-2" key={item}><input checked={unit.audiences.includes(item)} onChange={(event) => field('audiences', event.target.checked ? [...unit.audiences, item] : unit.audiences.filter((value) => value !== item))} type="checkbox" /> <span>{item}</span></label>)}</div></fieldset>
          </div>
        </Section>

        <Section eyebrow="2. Konum" title="Adres ve harita">
          <div className="admin-form-grid">
            <label className="admin-field-full"><span>Açık adres</span><textarea onChange={(event) => field('address', event.target.value)} rows={3} value={unit.address} /></label>
            <label><span>Enlem</span><input inputMode="decimal" onChange={(event) => field('latitude', event.target.value ? Number(event.target.value) : null)} value={unit.latitude ?? ''} /></label>
            <label><span>Boylam</span><input inputMode="decimal" onChange={(event) => field('longitude', event.target.value ? Number(event.target.value) : null)} value={unit.longitude ?? ''} /></label>
            <label><span>Harita durumu</span><select onChange={(event) => field('mapStatus', event.target.value as MilitaryUnitInput['mapStatus'])} value={unit.mapStatus}><option value="query-only">Yalnızca sorgu</option><option value="candidate">Harita adayı</option><option value="verified">Doğrulanmış harita</option></select></label>
            <label><span>Koordinat doğrulaması</span><select onChange={(event) => field('coordinateVerificationStatus', event.target.value as MilitaryUnitInput['coordinateVerificationStatus'])} value={unit.coordinateVerificationStatus}><option value="unverified">Doğrulanmadı</option><option value="reviewing">İnceleniyor</option><option value="verified">Doğrulandı</option></select></label>
            <label className="admin-field-full"><span>Google Maps / harita kaynak URL</span><input inputMode="url" onChange={(event) => field('mapSourceUrl', event.target.value)} placeholder="https://" type="url" value={unit.mapSourceUrl} /><small>Koordinat kaynağını doğrulamak için kullanılır.</small></label>
          </div>
        </Section>

        <Section eyebrow="3. Ulaşım" title="Ulaşım yöntemleri">
          <div className="admin-form-grid">
            {([['busStation', 'Otogardan ulaşım'], ['airport', 'Havalimanından ulaşım'], ['trainStation', 'Tren garından ulaşım'], ['cityCenter', 'Şehir merkezinden ulaşım'], ['general', 'Genel ulaşım notu']] as const).map(([key, label]) => <label className="admin-field-full" key={key}><span>{label}</span><textarea onChange={(event) => transport(key, event.target.value)} rows={3} value={unit.transportation[key]} /><small>Boş bırakılan yöntem public sayfada gösterilmez.</small></label>)}
          </div>
        </Section>

        <Section eyebrow="4. Birlik hakkında" title="Doğrulanmış içerik">
          <div className="admin-form-grid">
            <label className="admin-field-full"><span>Kısa tanıtım</span><textarea onChange={(event) => field('introduction', event.target.value)} rows={4} value={unit.introduction} /></label>
            <label className="admin-field-full"><span>Bilinmesi gerekenler</span><textarea onChange={(event) => field('verifiedFacts', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} placeholder="Her satıra bir doğrulanmış bilgi" rows={5} value={unit.verifiedFacts.join('\n')} /></label>
            <label className="admin-field-full"><span>Teslim / katılış notları</span><textarea onChange={(event) => field('joiningNotes', event.target.value)} rows={4} value={unit.joiningNotes} /></label>
            <label className="admin-field-full"><span>Hazırlık notları</span><textarea onChange={(event) => field('preparationNotes', event.target.value)} rows={4} value={unit.preparationNotes} /></label>
          </div>
        </Section>

        <Section eyebrow="5. Olanaklar" title="Duruma göre olanaklar">
          <div className="space-y-4">
            {facilityLabels.map(([key, label]) => <div className="admin-form-grid rounded-2xl border border-border p-4" key={key}><label><span>{label} durumu</span><select onChange={(event) => facility(key, { status: event.target.value as MilitaryUnitFacility['status'] })} value={unit.facilities[key].status}><option value="unknown">Bilinmiyor</option><option value="reported">Bildirildi</option><option value="verified">Doğrulandı</option></select></label><label><span>Not</span><input onChange={(event) => facility(key, { note: event.target.value })} value={unit.facilities[key].note} /></label></div>)}
            {unit.otherFacilities.map((item, index) => <div className="admin-form-grid rounded-2xl border border-border p-4" key={index}><label><span>Diğer olanak durumu</span><select onChange={(event) => field('otherFacilities', unit.otherFacilities.map((current, itemIndex) => itemIndex === index ? { ...current, status: event.target.value as MilitaryUnitFacility['status'] } : current))} value={item.status}><option value="unknown">Bilinmiyor</option><option value="reported">Bildirildi</option><option value="verified">Doğrulandı</option></select></label><label><span>Olanak ve not</span><span className="flex gap-2"><input className="flex-1" onChange={(event) => field('otherFacilities', unit.otherFacilities.map((current, itemIndex) => itemIndex === index ? { ...current, note: event.target.value } : current))} value={item.note} /><button aria-label="Olanak satırını sil" className="admin-icon-button" onClick={() => field('otherFacilities', unit.otherFacilities.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 className="size-4" /></button></span></label></div>)}
            <button className="admin-secondary-action" onClick={() => field('otherFacilities', [...unit.otherFacilities, emptyFacility()])} type="button"><Plus className="size-4" /> Diğer olanak ekle</button>
          </div>
        </Section>

        <Section eyebrow="6. Doğrulama" title="Kaynaklar ve editör notları">
          <div className="admin-form-grid">
            <label><span>Verification status</span><select onChange={(event) => field('verificationStatus', event.target.value as MilitaryUnitInput['verificationStatus'])} value={unit.verificationStatus}><option value="unverified">Doğrulanmadı</option><option value="reviewing">İnceleniyor</option><option value="verified">Doğrulandı</option></select></label>
            <label><span>Doğrulama tarihi</span><input onChange={(event) => field('verifiedAt', event.target.value)} type="date" value={unit.verifiedAt ? unit.verifiedAt.slice(0, 10) : ''} /></label>
          </div>
          <div className="mt-5 space-y-4">{unit.sources.map((source, index) => <div className="admin-form-grid rounded-2xl border border-border p-4" key={index}><label><span>Kaynak başlığı</span><input onChange={(event) => field('sources', unit.sources.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} value={source.title} /></label><label><span>Kaynak URL</span><input onChange={(event) => field('sources', unit.sources.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} placeholder="https://" type="url" value={source.url} /></label><label className="admin-field-full"><span>Kaynak notu</span><span className="flex gap-2"><input className="flex-1" onChange={(event) => field('sources', unit.sources.map((item, itemIndex) => itemIndex === index ? { ...item, note: event.target.value } : item))} value={source.note} /><button aria-label="Kaynağı sil" className="admin-icon-button" disabled={unit.sources.length === 1} onClick={() => field('sources', unit.sources.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 className="size-4" /></button></span></label></div>)}</div>
          <button className="admin-secondary-action mt-4" onClick={() => field('sources', [...unit.sources, emptySource()])} type="button"><Plus className="size-4" /> Kaynak ekle</button>
          <div className="admin-form-grid mt-6"><label className="admin-field-full"><span>Genel kaynak notu</span><textarea onChange={(event) => field('sourceNote', event.target.value)} rows={3} value={unit.sourceNote} /></label><label className="admin-field-full"><span>İç admin notu</span><textarea onChange={(event) => field('internalAdminNote', event.target.value)} rows={3} value={unit.internalAdminNote} /><small>Public sayfada hiçbir zaman gösterilmez.</small></label></div>
        </Section>

        <Section eyebrow="7. SEO" title="Public sayfa ve arama görünümü">
          <div className="admin-form-grid">
            <label className="admin-field-full"><span>Public slug *</span><input onChange={(event) => field('slug', slugify(event.target.value))} value={unit.slug} /><small>Şehir ve birlik slug’ı canonical URL’de kullanılır.</small></label>
            <label className="admin-field-full"><span>SEO title</span><input onChange={(event) => field('seoTitle', event.target.value)} value={unit.seoTitle} /><small>{unit.seoTitle.length}/120</small></label>
            <label className="admin-field-full"><span>Meta description</span><textarea onChange={(event) => field('metaDescription', event.target.value)} rows={3} value={unit.metaDescription} /><small>{unit.metaDescription.length}/200</small></label>
            <label className="admin-field-full flex items-center gap-3"><input checked={unit.indexable} onChange={(event) => field('indexable', event.target.checked)} type="checkbox" /><span>Arama motorlarında indexlenebilir</span></label>
            <button className="admin-secondary-action" onClick={() => setUnit((current) => ({ ...current, slug: slugify(current.name), seoTitle: `${current.shortName || current.name}: Konum, Ulaşım ve Birlik Bilgileri | Devrem`, metaDescription: `${current.name} için ${current.city ? `${current.city} ` : ''}konumu, kuvvet, doğrulanmış birlik bilgileri ve ulaşım rehberi.` }))} type="button">Bilgilerden varsayılanları oluştur</button>
          </div>
        </Section>

        <Section eyebrow="8. Yayın" title="Yayın ve doğrulama durumu">
          <div className="admin-form-grid"><label><span>Yayın durumu</span><select onChange={(event) => field('publicationStatus', event.target.value as MilitaryUnitInput['publicationStatus'])} value={unit.publicationStatus}><option value="draft">Taslak</option><option value="published">Yayında</option></select></label><label><span>Doğrulama durumu</span><select onChange={(event) => field('verificationStatus', event.target.value as MilitaryUnitInput['verificationStatus'])} value={unit.verificationStatus}><option value="unverified">Doğrulanmadı</option><option value="reviewing">İnceleniyor</option><option value="verified">Doğrulandı</option></select></label></div>
          <p className="admin-field-note">Yayın, doğrulama ve indexlenebilirlik ayrı kontrollerdir. Public sitemap için üçünün de uygun olması gerekir.</p>
        </Section>
      </div>

      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="admin-secondary-action" onClick={() => requestSave('draft')} type="button"><Save className="size-4" /> Taslak kaydet</button>
        <button className="admin-primary-action" onClick={() => requestSave('published')} type="button"><ShieldCheck className="size-4" /> Yayın ayarlarıyla kaydet</button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}><AlertDialogContent className="admin-confirm-dialog"><AlertDialogHeader><AlertDialogMedia><ShieldCheck aria-hidden="true" /></AlertDialogMedia><AlertDialogTitle>{pendingStatus === 'published' ? 'Birlik yayın ayarları kaydedilsin mi?' : 'Birlik taslağı kaydedilsin mi?'}</AlertDialogTitle><AlertDialogDescription>Değişiklik web CMS kaydına yazılır ve audit kaydı oluşturulur. Mobil uygulamanın paketli kataloğu değişmez.</AlertDialogDescription></AlertDialogHeader><label><span>İşlem gerekçesi</span><textarea maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Kaynak veya değişiklik nedeni (en az 8 karakter)" rows={4} value={reason} /></label>{error ? <p className="admin-form-error">{error}</p> : null}<AlertDialogFooter><AlertDialogCancel disabled={busy}>Vazgeç</AlertDialogCancel><button className="admin-confirm-submit" disabled={busy || reason.trim().length < 8} onClick={save} type="button">{busy ? 'Kaydediliyor…' : 'Onayla ve kaydet'}</button></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  );
}
