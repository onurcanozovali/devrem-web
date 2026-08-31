export type MilitaryUnitFixture = {
  id: string;
  name: string;
  city: string;
  force: string;
  href: string | null;
  isMock: true;
};

export type ToolFixture = {
  title: string;
  description: string;
  href: string;
  icon: 'countdown' | 'calculator' | 'checklist' | 'unit';
  accent: 'mint' | 'amber' | 'sage' | 'slate';
};

export type EditorialFixture = {
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
  href: string | null;
  tone: 'mint' | 'sage' | 'amber' | 'charcoal' | 'sand' | 'rose';
  isFeatured?: boolean;
};

export const currentMilitaryInfo = [
  { label: 'Bedelli askerlik', value: '472.653,60 TL', meta: 'Temmuz–Aralık 2026 · MSB' },
  { label: 'Yaklaşan celp dönemi', value: 'Demo dönem bilgisi', meta: 'Takvim verisi henüz canlı değil' },
  { label: 'Son sevk duyurusu', value: 'Demo duyuru başlığı', meta: 'Resmî kaynak bağlantısı eklenecek' },
] as const;

export const popularMilitaryUnits: MilitaryUnitFixture[] = [
  { id: 'kutahya-hava-er-egitim', name: 'Kütahya Hava Er Eğitim Tugayı', city: 'Kütahya', force: 'Hava Kuvvetleri', href: null, isMock: true },
  { id: 'amasya-15-piyade-egitim', name: 'Amasya 15. Piyade Eğitim Tugayı', city: 'Amasya', force: 'Kara Kuvvetleri', href: null, isMock: true },
  { id: 'manisa-1-piyade-egitim', name: 'Manisa 1. Piyade Eğitim Tugayı', city: 'Manisa', force: 'Kara Kuvvetleri', href: null, isMock: true },
  { id: 'izmir-jandarma-egitim', name: 'İzmir Jandarma Eğitim Birliği', city: 'İzmir', force: 'Jandarma', href: null, isMock: true },
];

export const conscriptionCommunity = {
  period: 'Ağustos 2026',
  memberCount: 12483,
  isMock: true,
  forces: ['Kara Kuvvetleri', 'Hava Kuvvetleri', 'Deniz Kuvvetleri', 'Jandarma'],
  logos: [
    '/public/kuvvetler/kara.png',
    '/public/kuvvetler/hava.png',
    '/public/kuvvetler/deniz.png',
    '/public/kuvvetler/jandarma.png',
  ],
} as const;

export const tools: ToolFixture[] = [
  { title: 'Askerlik Geri Sayacı', description: 'Teslim tarihine kaç gün kaldığını hesapla.', href: '#uygulama', icon: 'countdown', accent: 'mint' },
  { title: 'Bedelli Hesaplama', description: 'Güncel ve geçmiş bedelli ücretlerini karşılaştır.', href: '/bedelli', icon: 'calculator', accent: 'amber' },
  { title: 'Hazırlık Listesi', description: 'Askere gitmeden önce gerekenleri tamamla.', href: '#uygulama', icon: 'checklist', accent: 'sage' },
  { title: 'Birlik Bul', description: 'Birliğini bul ve hakkında bilgi edin.', href: '#birlikler', icon: 'unit', accent: 'slate' },
];

export const guides: EditorialFixture[] = [
  { category: 'Hazırlık', title: 'Askere giderken ne alınır?', excerpt: 'Çantanı gereksiz yere büyütmeden temel hazırlığını planla.', readingTime: '6 dk', href: null, tone: 'mint', isFeatured: true },
  { category: 'Acemi birliği', title: 'Acemi birliğinde ilk gün nasıl geçer?', excerpt: 'Teslimden ilk düzene kadar genel süreci tanı.', readingTime: '7 dk', href: null, tone: 'charcoal' },
  { category: 'Belgeler', title: 'Sevk belgesi nedir?', excerpt: 'Belgedeki temel alanları ve ne zaman kontrol edeceğini öğren.', readingTime: '4 dk', href: null, tone: 'sage' },
  { category: 'Günlük yaşam', title: 'Askerde telefon kullanımı nasıl?', excerpt: 'Kuralların birliğe göre değişebileceğini unutmadan hazırlan.', readingTime: '5 dk', href: null, tone: 'sand' },
  { category: 'Süreç', title: 'Usta birliği ne zaman belli olur?', excerpt: 'Resmî açıklamaları izlerken kavramları doğru ayır.', readingTime: '5 dk', href: null, tone: 'amber' },
  { category: 'Yolculuk', title: 'Yol parası nasıl alınır?', excerpt: 'Kişisel durumun için resmî kanalları nasıl kontrol edeceğini gör.', readingTime: '4 dk', href: null, tone: 'rose' },
];

export const militaryUpdates = [
  { category: 'MSB duyuruları', title: 'Demo resmî duyuru başlığı', date: 'Demo tarih · 18.08.2026', isMock: true },
  { category: 'Bedelli', title: 'Demo bedelli güncelleme başlığı', date: 'Demo tarih · 12.08.2026', isMock: true },
  { category: 'Celp dönemi', title: 'Demo sınıflandırma takvimi başlığı', date: 'Demo tarih · 05.08.2026', isMock: true },
  { category: 'Sevk bilgisi', title: 'Demo sevk süreci bilgilendirmesi', date: 'Demo tarih · 29.07.2026', isMock: true },
] as const;

export const appSteps = [
  { step: '01', title: 'Celp dönemini ve birliğini seç.', description: 'Resmî kaydındaki bilgilerle Devrem yolculuğunu başlat.' },
  { step: '02', title: 'Aynı yere giden devrelerini bul.', description: 'Aynı dönem, birlik ve askerlik türündeki kişileri gör.' },
  { step: '03', title: 'Sohbet et ve birlikte hazırlan.', description: 'Gitmeden önce tanış, hazırlığını tek yerde takip et.' },
] as const;

export const sponsoredPlacement = {
  eyebrow: 'Demo sponsor yerleşimi',
  title: 'Celp dönemi ulaşım partneri',
  description: 'Birliğine ulaşım seçeneklerini karşılaştır.',
  partnerName: 'Demo partner',
  isActive: false,
} as const;
