'use client';

/* oxlint-disable jsx-a11y/label-has-associated-control -- VerificationSelect renders a native select inside its wrapping label. */

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Eye, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toast';
import type {
  MilitaryUnitContentField,
  MilitaryUnitFacility,
  MilitaryUnitFaq,
  MilitaryUnitFieldVerification,
  MilitaryUnitInput,
  MilitaryUnitSource,
} from '@/lib/admin/operations';

const forces = ['Kara Kuvvetleri', 'Deniz Kuvvetleri', 'Hava Kuvvetleri', 'Jandarma Genel Komutanlığı', 'Sahil Güvenlik Komutanlığı', 'Millî Savunma Bakanlığı'];
const cities = ['Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'];
const audiences = ['Er / Erbaş', 'Bedelli', 'Yedek subay', 'Yedek astsubay'];
const unitTypes = ['Eğitim birliği', 'Tugay komutanlığı', 'Alay komutanlığı', 'Tabur komutanlığı', 'Kışla', 'Diğer'];
const facilityLabels: Array<[keyof MilitaryUnitInput['facilities'], string]> = [
  ['canteen', 'Kantin'], ['infirmary', 'Revir'], ['atm', 'ATM'], ['barber', 'Berber'],
  ['diningHall', 'Yemekhane'], ['communication', 'Telefon / iletişim'],
  ['visitorArea', 'Ziyaretçi alanı'], ['parking', 'Otopark'],
];
const navigation = [
  ['unit-basic', 'Temel Bilgiler'], ['unit-location', 'Konum'], ['unit-transport', 'Ulaşım'],
  ['unit-about', 'Birlik Hakkında'], ['unit-arrival', 'Teslim'], ['unit-facilities', 'Olanaklar'],
  ['unit-contact', 'İletişim'], ['unit-faq', 'FAQ'], ['unit-sources', 'Kaynaklar'], ['unit-seo', 'SEO & Yayın'],
];

const emptyContent = (): MilitaryUnitContentField => ({ text: '', verificationStatus: 'unknown', sourceUrl: '' });
const emptyFacility = (name = ''): MilitaryUnitFacility => ({ name, status: 'unknown', verificationStatus: 'unknown', note: '' });
const emptySource = (): MilitaryUnitSource => ({ title: '', url: '', type: 'official', accessedAt: '', note: '' });
const emptyFaq = (): MilitaryUnitFaq => ({ id: crypto.randomUUID(), question: '', answer: '', verificationStatus: 'unknown', sourceUrl: '' });

const emptyUnit: MilitaryUnitInput = {
  name: '', shortName: '', aliases: [], city: '', district: '', force: '', unitType: '', audiences: [],
  verificationStatus: 'unverified', publicationStatus: 'draft', latitude: null, longitude: null,
  mapStatus: 'query-only', coordinateVerificationStatus: 'unknown', mapSourceUrl: '', address: '',
  locationDescription: '', locationVerificationStatus: 'unknown',
  transportation: { busStation: emptyContent(), airport: emptyContent(), trainStation: emptyContent(), cityCenter: emptyContent(), privateVehicle: emptyContent(), general: emptyContent() },
  standfirst: '', introduction: '', highlights: [], verifiedFacts: [],
  joining: { general: emptyContent(), gate: emptyContent(), dispatchReminder: emptyContent(), documentReminder: emptyContent(), importantNote: emptyContent() },
  preparation: { notes: emptyContent(), importantFacts: [] },
  facilities: Object.fromEntries(facilityLabels.map(([key, label]) => [key, emptyFacility(label)])) as MilitaryUnitInput['facilities'],
  otherFacilities: [], contact: { officialPhone: '', officialWebsite: '', note: '' }, faqs: [], sources: [emptySource()],
  verifiedAt: '', sourceNote: '', internalAdminNote: '', slug: '', seoTitle: '', metaDescription: '', ogImage: '', indexable: false,
};

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/İ/g, 'i').toLocaleLowerCase('tr-TR').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function mergeContent(value: unknown, legacy = ''): MilitaryUnitContentField {
  if (typeof value === 'string') return { ...emptyContent(), text: value };
  return { ...emptyContent(), ...(value && typeof value === 'object' ? value as Partial<MilitaryUnitContentField> : {}), text: (value && typeof value === 'object' ? (value as Partial<MilitaryUnitContentField>).text : '') || legacy };
}

function mergeFacility(value: unknown, label: string): MilitaryUnitFacility {
  if (!value || typeof value !== 'object') return emptyFacility(label);
  const current = value as Partial<MilitaryUnitFacility>;
  const legacyStatus = current.status as unknown as string;
  return {
    ...emptyFacility(label),
    ...current,
    name: current.name || label,
    status: legacyStatus === 'verified' || legacyStatus === 'reported' ? 'available' : current.status ?? 'unknown',
    verificationStatus: legacyStatus === 'verified' || legacyStatus === 'reported'
      ? legacyStatus
      : current.verificationStatus ?? 'unknown',
  };
}

function initialUnit(initial?: Partial<MilitaryUnitInput>): MilitaryUnitInput {
  const legacy = (initial ?? {}) as Record<string, unknown>;
  const legacyText = (key: string) => typeof legacy[key] === 'string' ? legacy[key] as string : '';
  const transportation = initial?.transportation && typeof initial.transportation === 'object'
    ? initial.transportation
    : {} as Partial<MilitaryUnitInput['transportation']>;
  const joining = initial?.joining && typeof initial.joining === 'object'
    ? initial.joining
    : {} as Partial<MilitaryUnitInput['joining']>;
  const preparation = initial?.preparation && typeof initial.preparation === 'object'
    ? initial.preparation
    : {} as Partial<MilitaryUnitInput['preparation']>;
  const legacyFacilities = initial?.facilities && typeof initial.facilities === 'object'
    ? initial.facilities
    : {} as Partial<MilitaryUnitInput['facilities']>;
  return {
    ...emptyUnit, ...initial,
    aliases: initial?.aliases ?? [], audiences: initial?.audiences ?? [], highlights: initial?.highlights ?? [], verifiedFacts: initial?.verifiedFacts ?? [],
    transportation: {
      busStation: mergeContent(transportation.busStation), airport: mergeContent(transportation.airport), trainStation: mergeContent(transportation.trainStation),
      cityCenter: mergeContent(transportation.cityCenter), privateVehicle: mergeContent(transportation.privateVehicle), general: mergeContent(transportation.general, legacyText('transport')),
    },
    joining: {
      general: mergeContent(joining.general, legacyText('joiningNotes')), gate: mergeContent(joining.gate), dispatchReminder: mergeContent(joining.dispatchReminder),
      documentReminder: mergeContent(joining.documentReminder), importantNote: mergeContent(joining.importantNote),
    },
    preparation: { notes: mergeContent(preparation.notes, legacyText('preparationNotes')), importantFacts: preparation.importantFacts ?? [] },
    facilities: Object.fromEntries(facilityLabels.map(([key, label]) => [key, mergeFacility(legacyFacilities[key], label)])) as MilitaryUnitInput['facilities'],
    otherFacilities: initial?.otherFacilities ?? [], contact: { ...emptyUnit.contact, ...initial?.contact }, faqs: initial?.faqs ?? [],
    sources: initial?.sources?.length ? initial.sources : [emptySource()], introduction: initial?.introduction || legacyText('about'),
    internalAdminNote: initial?.internalAdminNote || legacyText('notes') || (typeof legacy.facilities === 'string' ? legacy.facilities : ''),
    publicationStatus: initial?.publicationStatus === 'published' ? 'published' : 'draft',
  };
}

function Section({ id, eyebrow, title, description, children }: { id: string; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <section className="admin-editor-section scroll-mt-32" id={id}><div className="admin-section-heading"><div><p className="admin-kicker">{eyebrow}</p><h2>{title}</h2><p className="admin-field-note mt-2">{description}</p></div></div><div className="mt-6">{children}</div></section>;
}

function VerificationSelect({ value, onChange }: { value: MilitaryUnitFieldVerification; onChange: (value: MilitaryUnitFieldVerification) => void }) {
  return <select onChange={(event) => onChange(event.target.value as MilitaryUnitFieldVerification)} value={value}><option value="unknown">Bilinmiyor</option><option value="reported">Bildirildi</option><option value="verified">Doğrulandı</option></select>;
}

function VerifiedTextarea({ label, value, onChange, helper }: { label: string; value: MilitaryUnitContentField; onChange: (value: MilitaryUnitContentField) => void; helper?: string }) {
  return <div className="admin-field-full rounded-2xl border border-border p-4"><label><span>{label}</span><textarea onChange={(event) => onChange({ ...value, text: event.target.value })} rows={3} value={value.text} />{helper ? <small>{helper}</small> : null}</label><div className="admin-form-grid mt-3"><div><span>Doğrulama</span><VerificationSelect onChange={(verificationStatus) => onChange({ ...value, verificationStatus })} value={value.verificationStatus} /></div><label><span>Alan kaynağı</span><input onChange={(event) => onChange({ ...value, sourceUrl: event.target.value })} placeholder="https://" type="url" value={value.sourceUrl} /></label></div></div>;
}

export function MilitaryUnitEditor({ unitId, initial, isNew, createdAt, updatedAt }: { unitId: string; initial?: Partial<MilitaryUnitInput>; isNew: boolean; createdAt?: string | null; updatedAt?: string | null }) {
  const router = useRouter();
  const [unit, setUnit] = useState<MilitaryUnitInput>(() => initialUnit(initial));
  const [reason, setReason] = useState('');
  const [pendingStatus, setPendingStatus] = useState<MilitaryUnitInput['publicationStatus']>('draft');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function field<K extends keyof MilitaryUnitInput>(key: K, value: MilitaryUnitInput[K]) { setUnit((current) => ({ ...current, [key]: value })); }
  function updateName(name: string) { setUnit((current) => ({ ...current, name, slug: !current.slug || current.slug === slugify(current.name) ? slugify(name) : current.slug })); }
  function transport(key: keyof MilitaryUnitInput['transportation'], value: MilitaryUnitContentField) { setUnit((current) => ({ ...current, transportation: { ...current.transportation, [key]: value } })); }
  function joining(key: keyof MilitaryUnitInput['joining'], value: MilitaryUnitContentField) { setUnit((current) => ({ ...current, joining: { ...current.joining, [key]: value } })); }
  function facility(key: keyof MilitaryUnitInput['facilities'], value: Partial<MilitaryUnitFacility>) { setUnit((current) => ({ ...current, facilities: { ...current.facilities, [key]: { ...current.facilities[key], ...value } } })); }
  function requestSave(status: MilitaryUnitInput['publicationStatus']) { if (!unit.name.trim() || !unit.city || !unit.force || !unit.slug) { setError('Birlik adı, kuvvet, şehir ve public slug zorunludur.'); return; } setPendingStatus(status); setError(''); setOpen(true); }

  async function save() {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/mobile/military-units/${encodeURIComponent(unitId)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ unit: { ...unit, publicationStatus: pendingStatus }, reason }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Birlik kaydedilemedi.');
      setOpen(false); toast.add({ title: pendingStatus === 'published' ? 'Birlik yayınlandı.' : 'Birlik taslağı kaydedildi.', type: 'success' });
      router.push(`/admin/mobile/military-units/${encodeURIComponent(unitId)}`); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Birlik kaydedilemedi.'); } finally { setBusy(false); }
  }

  function moveFaq(index: number, direction: -1 | 1) {
    const target = index + direction; if (target < 0 || target >= unit.faqs.length) return;
    const faqs = [...unit.faqs]; [faqs[index], faqs[target]] = [faqs[target], faqs[index]]; field('faqs', faqs);
  }

  const dateLabel = (value?: string | null) => value ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Henüz yok';

  return <>
    <div className="mb-5 grid gap-3 sm:grid-cols-4">
      {[['Stable unit ID', unitId], ['Durum', unit.publicationStatus === 'published' ? 'Yayında' : 'Taslak'], ['Oluşturma', dateLabel(createdAt)], ['Son güncelleme', dateLabel(updatedAt)]].map(([label, value]) => <div className="rounded-2xl border border-border bg-surface p-4" key={label}><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 break-all text-sm font-bold">{value}</p></div>)}
    </div>
    <nav aria-label="Birlik formu bölümleri" className="sticky top-20 z-20 mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-background/95 p-2 shadow-sm backdrop-blur">
      {navigation.map(([href, label]) => <a className="shrink-0 rounded-xl px-3 py-2 text-sm font-bold text-secondary-foreground hover:bg-primary/10 hover:text-primary" href={`#${href}`} key={href}>{label}</a>)}
    </nav>

    <div className="admin-unit-editor">
      <Section description="Canonical kimlik alanları ve public URL bilgileri." eyebrow="A" id="unit-basic" title="Temel bilgiler">
        <div className="admin-form-grid"><label className="admin-field-full"><span>Birlik adı *</span><input required onChange={(event) => updateName(event.target.value)} value={unit.name} /></label><label><span>Kısa ad</span><input onChange={(event) => field('shortName', event.target.value)} value={unit.shortName} /></label><label><span>Diğer bilinen adlar</span><textarea onChange={(event) => field('aliases', event.target.value.split(/\n|,/).map((item) => item.trim()).filter(Boolean))} placeholder="Her satıra bir alias" rows={3} value={unit.aliases.join('\n')} /></label><label><span>Kuvvet *</span><select required onChange={(event) => field('force', event.target.value)} value={unit.force}><option value="">Seçin</option>{forces.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Şehir *</span><select required onChange={(event) => field('city', event.target.value)} value={unit.city}><option value="">Seçin</option>{cities.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>İlçe</span><input onChange={(event) => field('district', event.target.value)} value={unit.district} /></label><label><span>Birlik türü</span><select onChange={(event) => field('unitType', event.target.value)} value={unit.unitType}><option value="">Seçin</option>{unitTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Public slug *</span><input required onChange={(event) => field('slug', slugify(event.target.value))} value={unit.slug} /><small>İsimden otomatik oluşur; gerektiğinde düzenlenebilir.</small></label><fieldset className="admin-field-full"><legend>Eğitim / hedef askerlik statüleri</legend><div className="mt-3 flex flex-wrap gap-4">{audiences.map((item) => <label className="flex items-center gap-2" key={item}><input checked={unit.audiences.includes(item)} onChange={(event) => field('audiences', event.target.checked ? [...unit.audiences, item] : unit.audiences.filter((value) => value !== item))} type="checkbox" /><span>{item}</span></label>)}</div></fieldset></div>
      </Section>

      <Section description="Koordinat yoksa public sayfada harita üretilmez." eyebrow="B" id="unit-location" title="Konum">
        <div className="admin-form-grid"><label className="admin-field-full"><span>Açık adres</span><textarea onChange={(event) => field('address', event.target.value)} rows={3} value={unit.address} /></label><label><span>Enlem</span><input inputMode="decimal" onChange={(event) => field('latitude', event.target.value ? Number(event.target.value) : null)} value={unit.latitude ?? ''} /></label><label><span>Boylam</span><input inputMode="decimal" onChange={(event) => field('longitude', event.target.value ? Number(event.target.value) : null)} value={unit.longitude ?? ''} /></label><label><span>Harita durumu</span><select onChange={(event) => field('mapStatus', event.target.value as MilitaryUnitInput['mapStatus'])} value={unit.mapStatus}><option value="query-only">Yalnızca sorgu</option><option value="candidate">Harita adayı</option><option value="verified">Doğrulanmış harita</option></select></label><div><span>Konum doğrulaması</span><VerificationSelect onChange={(value) => { field('locationVerificationStatus', value); field('coordinateVerificationStatus', value); }} value={unit.locationVerificationStatus} /></div><label className="admin-field-full"><span>Google Maps / harita URL</span><input onChange={(event) => field('mapSourceUrl', event.target.value)} placeholder="https://" type="url" value={unit.mapSourceUrl} /></label><label className="admin-field-full"><span>Konum açıklaması</span><textarea onChange={(event) => field('locationDescription', event.target.value)} rows={3} value={unit.locationDescription} /></label></div>
      </Section>

      <Section description="Yalnızca doldurulan yöntemler public sayfada görünür." eyebrow="C" id="unit-transport" title="Ulaşım">
        <div className="space-y-4">{([['cityCenter', 'Şehir merkezinden ulaşım'], ['busStation', 'Otogardan ulaşım'], ['airport', 'Havalimanından ulaşım'], ['trainStation', 'Tren garından ulaşım'], ['privateVehicle', 'Özel araçla ulaşım'], ['general', 'Genel ulaşım notları']] as const).map(([key, label]) => <VerifiedTextarea helper="Birlik özelinde doğrulanmamış detayları kesin bilgi gibi yazmayın." key={key} label={label} onChange={(value) => transport(key, value)} value={unit.transportation[key]} />)}</div>
      </Section>

      <Section description="Hero özeti ve doğrulanmış editoryal içerik." eyebrow="D" id="unit-about" title="Public sayfa özeti ve birlik hakkında">
        <div className="admin-form-grid"><label className="admin-field-full"><span>Kısa açıklama / standfirst</span><textarea maxLength={700} onChange={(event) => field('standfirst', event.target.value)} rows={3} value={unit.standfirst} /><small>{unit.standfirst.length}/700 · Hero altında 1–3 cümle.</small></label><label className="admin-field-full"><span>Birlik hakkında</span><textarea onChange={(event) => field('introduction', event.target.value)} rows={5} value={unit.introduction} /></label><label className="admin-field-full"><span>Öne çıkan kısa bilgiler</span><textarea onChange={(event) => field('highlights', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} placeholder="Her satıra bir kısa bilgi" rows={4} value={unit.highlights.join('\n')} /></label><label className="admin-field-full"><span>Bilinmesi gerekenler</span><textarea onChange={(event) => field('verifiedFacts', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} placeholder="Her satıra bir doğrulanmış bilgi" rows={5} value={unit.verifiedFacts.join('\n')} /></label></div>
      </Section>

      <Section description="Teslim saati veya prosedür gibi kesin olmayan bilgileri doğrulanmış göstermeyin." eyebrow="E" id="unit-arrival" title="Teslim / katılış">
        <div className="space-y-4">{([['general', 'Katılış için genel not'], ['gate', 'Nizamiye / teslim noktası'], ['dispatchReminder', 'Sevk belgesi hatırlatması'], ['documentReminder', 'Kimlik / belge hatırlatması'], ['importantNote', 'Teslim konusunda önemli not']] as const).map(([key, label]) => <VerifiedTextarea key={key} label={label} onChange={(value) => joining(key, value)} value={unit.joining[key]} />)}<VerifiedTextarea label="Birlik özel hazırlık notları" onChange={(notes) => field('preparation', { ...unit.preparation, notes })} value={unit.preparation.notes} /><label className="block"><span>Özellikle bilinmesi gereken hazırlık maddeleri</span><textarea onChange={(event) => field('preparation', { ...unit.preparation, importantFacts: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} rows={4} value={unit.preparation.importantFacts.join('\n')} /></label></div>
      </Section>

      <Section description="Mevcudiyet ile bilgi doğrulaması ayrı tutulur." eyebrow="F" id="unit-facilities" title="Olanaklar">
        <div className="space-y-4">{facilityLabels.map(([key, label]) => <div className="admin-form-grid rounded-2xl border border-border p-4" key={key}><label><span>{label}</span><select onChange={(event) => facility(key, { status: event.target.value as MilitaryUnitFacility['status'] })} value={unit.facilities[key].status}><option value="unknown">Bilinmiyor</option><option value="available">Var</option><option value="unavailable">Yok</option></select></label><label><span>Doğrulama</span><VerificationSelect onChange={(verificationStatus) => facility(key, { verificationStatus })} value={unit.facilities[key].verificationStatus} /></label><label className="admin-field-full"><span>Kısa not</span><input onChange={(event) => facility(key, { note: event.target.value })} value={unit.facilities[key].note} /></label></div>)}{unit.otherFacilities.map((item, index) => <div className="admin-form-grid rounded-2xl border border-border p-4" key={index}><label><span>Özel olanak adı</span><input onChange={(event) => field('otherFacilities', unit.otherFacilities.map((current, itemIndex) => itemIndex === index ? { ...current, name: event.target.value } : current))} value={item.name} /></label><label><span>Durum</span><select onChange={(event) => field('otherFacilities', unit.otherFacilities.map((current, itemIndex) => itemIndex === index ? { ...current, status: event.target.value as MilitaryUnitFacility['status'] } : current))} value={item.status}><option value="unknown">Bilinmiyor</option><option value="available">Var</option><option value="unavailable">Yok</option></select></label><label><span>Doğrulama</span><VerificationSelect onChange={(verificationStatus) => field('otherFacilities', unit.otherFacilities.map((current, itemIndex) => itemIndex === index ? { ...current, verificationStatus } : current))} value={item.verificationStatus} /></label><label><span>Not</span><span className="flex gap-2"><input className="flex-1" onChange={(event) => field('otherFacilities', unit.otherFacilities.map((current, itemIndex) => itemIndex === index ? { ...current, note: event.target.value } : current))} value={item.note} /><button aria-label="Olanak satırını sil" className="admin-icon-button" onClick={() => field('otherFacilities', unit.otherFacilities.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 className="size-4" /></button></span></label></div>)}<button className="admin-secondary-action" onClick={() => field('otherFacilities', [...unit.otherFacilities, emptyFacility()])} type="button"><Plus className="size-4" /> Özel olanak ekle</button></div>
      </Section>

      <Section description="Birlik iletişim bilgisi; telefon kullanım kuralları değildir." eyebrow="G" id="unit-contact" title="Telefon / iletişim">
        <div className="admin-form-grid"><label><span>Resmî telefon</span><input inputMode="tel" onChange={(event) => field('contact', { ...unit.contact, officialPhone: event.target.value })} value={unit.contact.officialPhone} /></label><label><span>Resmî web sayfası</span><input onChange={(event) => field('contact', { ...unit.contact, officialWebsite: event.target.value })} placeholder="https://" type="url" value={unit.contact.officialWebsite} /></label><label className="admin-field-full"><span>İletişim notu</span><textarea onChange={(event) => field('contact', { ...unit.contact, note: event.target.value })} rows={3} value={unit.contact.note} /></label></div>
      </Section>

      <Section description="Boş veya eksik soru public sayfada gösterilmez." eyebrow="H" id="unit-faq" title="Sık sorulan sorular">
        <div className="space-y-4">{unit.faqs.map((item, index) => <div className="rounded-2xl border border-border p-4" key={item.id}><div className="mb-3 flex justify-end gap-2"><button aria-label="Soruyu yukarı taşı" className="admin-icon-button" disabled={index === 0} onClick={() => moveFaq(index, -1)} type="button"><ArrowUp className="size-4" /></button><button aria-label="Soruyu aşağı taşı" className="admin-icon-button" disabled={index === unit.faqs.length - 1} onClick={() => moveFaq(index, 1)} type="button"><ArrowDown className="size-4" /></button><button aria-label="Soruyu sil" className="admin-icon-button" onClick={() => field('faqs', unit.faqs.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 className="size-4" /></button></div><div className="admin-form-grid"><label className="admin-field-full"><span>Soru</span><input onChange={(event) => field('faqs', unit.faqs.map((faq, itemIndex) => itemIndex === index ? { ...faq, question: event.target.value } : faq))} value={item.question} /></label><label className="admin-field-full"><span>Cevap</span><textarea onChange={(event) => field('faqs', unit.faqs.map((faq, itemIndex) => itemIndex === index ? { ...faq, answer: event.target.value } : faq))} rows={4} value={item.answer} /></label><label><span>Doğrulama</span><VerificationSelect onChange={(verificationStatus) => field('faqs', unit.faqs.map((faq, itemIndex) => itemIndex === index ? { ...faq, verificationStatus } : faq))} value={item.verificationStatus} /></label><label><span>Kaynak URL</span><input onChange={(event) => field('faqs', unit.faqs.map((faq, itemIndex) => itemIndex === index ? { ...faq, sourceUrl: event.target.value } : faq))} placeholder="https://" type="url" value={item.sourceUrl} /></label></div></div>)}<button className="admin-secondary-action" onClick={() => field('faqs', [...unit.faqs, emptyFaq()])} type="button"><Plus className="size-4" /> Soru ekle</button></div>
      </Section>

      <Section description="Doğrulama ve yayın birbirinden bağımsızdır." eyebrow="I" id="unit-sources" title="Kaynaklar / doğrulama">
        <div className="admin-form-grid"><label><span>Genel doğrulama</span><select onChange={(event) => field('verificationStatus', event.target.value as MilitaryUnitInput['verificationStatus'])} value={unit.verificationStatus}><option value="unverified">Doğrulanmadı</option><option value="reviewing">İnceleniyor</option><option value="partially_verified">Kısmen doğrulandı</option><option value="verified">Doğrulandı</option></select></label><label><span>Doğrulama tarihi</span><input onChange={(event) => field('verifiedAt', event.target.value)} type="date" value={unit.verifiedAt ? unit.verifiedAt.slice(0, 10) : ''} /></label></div>
        <div className="mt-5 space-y-4">{unit.sources.map((source, index) => <div className="admin-form-grid rounded-2xl border border-border p-4" key={index}><label><span>Kaynak başlığı</span><input onChange={(event) => field('sources', unit.sources.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} value={source.title} /></label><label><span>URL</span><input onChange={(event) => field('sources', unit.sources.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} placeholder="https://" type="url" value={source.url} /></label><label><span>Kaynak türü</span><select onChange={(event) => field('sources', unit.sources.map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as MilitaryUnitSource['type'] } : item))} value={source.type}><option value="official">Resmî</option><option value="map">Harita</option><option value="institutional">Kurumsal</option><option value="community">Topluluk / kullanıcı bildirimi</option><option value="other">Diğer</option></select></label><label><span>Erişim / doğrulama tarihi</span><input onChange={(event) => field('sources', unit.sources.map((item, itemIndex) => itemIndex === index ? { ...item, accessedAt: event.target.value } : item))} type="date" value={source.accessedAt ? source.accessedAt.slice(0, 10) : ''} /></label><label className="admin-field-full"><span>Kısa not</span><span className="flex gap-2"><input className="flex-1" onChange={(event) => field('sources', unit.sources.map((item, itemIndex) => itemIndex === index ? { ...item, note: event.target.value } : item))} value={source.note} /><button aria-label="Kaynağı sil" className="admin-icon-button" disabled={unit.sources.length === 1} onClick={() => field('sources', unit.sources.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 className="size-4" /></button></span></label></div>)}</div><button className="admin-secondary-action mt-4" onClick={() => field('sources', [...unit.sources, emptySource()])} type="button"><Plus className="size-4" /> Kaynak ekle</button><div className="admin-form-grid mt-6"><label className="admin-field-full"><span>Genel kaynak notu</span><textarea onChange={(event) => field('sourceNote', event.target.value)} rows={3} value={unit.sourceNote} /></label><label className="admin-field-full"><span>İç admin notu</span><textarea onChange={(event) => field('internalAdminNote', event.target.value)} rows={3} value={unit.internalAdminNote} /><small>Public sayfada hiçbir zaman gösterilmez.</small></label></div>
      </Section>

      <Section description="Canonical metadata ve ayrı yayın kontrolleri." eyebrow="J" id="unit-seo" title="SEO & yayın">
        <div className="admin-form-grid"><label className="admin-field-full"><span>SEO title</span><input onChange={(event) => field('seoTitle', event.target.value)} value={unit.seoTitle} /><small>{unit.seoTitle.length}/120</small></label><label className="admin-field-full"><span>Meta description</span><textarea onChange={(event) => field('metaDescription', event.target.value)} rows={3} value={unit.metaDescription} /><small>{unit.metaDescription.length}/200</small></label><label className="admin-field-full"><span>OG image URL</span><input onChange={(event) => field('ogImage', event.target.value)} placeholder="https://" type="url" value={unit.ogImage} /></label><label className="admin-field-full flex items-center gap-3"><input checked={unit.indexable} onChange={(event) => field('indexable', event.target.checked)} type="checkbox" /><span>Arama motorlarında indexlenebilir</span></label><label><span>Yayın durumu</span><select onChange={(event) => field('publicationStatus', event.target.value as MilitaryUnitInput['publicationStatus'])} value={unit.publicationStatus}><option value="draft">Taslak</option><option value="published">Yayında</option></select></label><button className="admin-secondary-action" onClick={() => setUnit((current) => ({ ...current, slug: slugify(current.name), seoTitle: `${current.shortName || current.name}: Konum, Ulaşım ve Birlik Bilgileri | Devrem`, metaDescription: `${current.name} için ${current.city ? `${current.city} ` : ''}konumu, kuvvet, birlik bilgileri ve ulaşım rehberi.` }))} type="button">SEO varsayılanlarını oluştur</button></div>
      </Section>
    </div>

    {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
    <div className="sticky bottom-4 z-20 mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
      <button className="admin-secondary-action" onClick={() => requestSave('draft')} type="button"><Save className="size-4" /> Taslak kaydet</button>
      <Link aria-disabled={isNew} className={`admin-secondary-action ${isNew ? 'pointer-events-none opacity-50' : ''}`} href={`/admin/mobile/military-units/${encodeURIComponent(unitId)}/preview`} target="_blank"><Eye className="size-4" /> Önizle</Link>
      <button className="admin-primary-action" onClick={() => requestSave('published')} type="button"><ShieldCheck className="size-4" /> {isNew || unit.publicationStatus === 'draft' ? 'Yayınla' : 'Güncelle'}</button>
      {isNew ? <span className="text-xs text-muted-foreground">Önizleme için önce taslağı kaydet.</span> : null}
    </div>

    <AlertDialog open={open} onOpenChange={setOpen}><AlertDialogContent className="admin-confirm-dialog"><AlertDialogHeader><AlertDialogMedia><ShieldCheck aria-hidden="true" /></AlertDialogMedia><AlertDialogTitle>{pendingStatus === 'published' ? 'Birlik yayınlansın mı?' : 'Birlik taslağı kaydedilsin mi?'}</AlertDialogTitle><AlertDialogDescription>Web CMS kaydı güncellenir ve audit kaydı oluşturulur. Mobil uygulamanın paketli kataloğu değişmez.</AlertDialogDescription></AlertDialogHeader><label><span>İşlem gerekçesi</span><textarea maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Kaynak veya değişiklik nedeni (en az 8 karakter)" rows={4} value={reason} /></label>{error ? <p className="admin-form-error">{error}</p> : null}<AlertDialogFooter><AlertDialogCancel disabled={busy}>Vazgeç</AlertDialogCancel><button className="admin-confirm-submit" disabled={busy || reason.trim().length < 8} onClick={save} type="button">{busy ? 'Kaydediliyor…' : 'Onayla ve kaydet'}</button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}
