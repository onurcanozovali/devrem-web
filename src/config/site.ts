export const siteConfig = {
  name: 'Devrem',
  url: 'https://devrem.co',
  description:
    'Aynı celp döneminde aynı birliğe gidecek devrelerinle tanış; Bedelli verilerini karşılaştır ve sade askerlik rehberlerine ulaş.',
  contactEmail: 'iletisim@devrem.co',
  operatorName: 'Onurcan Özovalı, Muhammet Şen ve Mertcan Uğurluel',
  dataControllerName: 'Onurcan Özovalı, Muhammet Şen ve Mertcan Uğurluel',
  address:
    'Teknopark Samsun 19 Mayıs Yerleşkesi, İstiklal Mah. Cumhuriyet Cad. No: 290, 19 Mayıs / Samsun',
  addressLines: [
    'Teknopark Samsun 19 Mayıs Yerleşkesi',
    'İstiklal Mah. Cumhuriyet Cad. No: 290',
    '19 Mayıs / Samsun',
  ],
  legalVersion: '2026-09-01-v1',
  release: {
    status: 'preparing' as const,
    appStoreUrl: null,
    googlePlayUrl: null,
  },
  socialLinks: [] as { label: string; href: string }[],
};

export const mainNavigation = [
  {
    href: '/',
    label: 'Ana Sayfa',
    description: "Devrem'i ve öne çıkan içerikleri keşfet",
  },
  {
    href: '/bedelli',
    label: 'Bedelli',
    description: 'Ücreti beş yıllık verilerle karşılaştır',
  },
  {
    href: '/blog',
    label: 'Blog',
    description: 'Güncel rehber ve analizleri oku',
  },
  {
    href: '/topluluk',
    label: 'Topluluk',
    description: 'Sorularını sor, deneyimini paylaş',
  },
  {
    href: '/#uygulama',
    label: 'Devrem Uygulaması',
    description: 'Aynı dönem ve birlikteki devrelerini bul',
  },
] as const;
