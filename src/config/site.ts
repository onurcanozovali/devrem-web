export const siteConfig = {
  name: 'Devrem',
  url: 'https://devrem.co',
  description:
    'Birlik bilgileri, celp ve sevk tarihleri, bedelli askerlik, hazırlık rehberleri ve askerlik araçları Devrem’de.',
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
    href: '/birlikler',
    label: 'Birlikler',
    description: 'Askerî birlik bilgilerini keşfet',
  },
  {
    href: '/blog/2026-askerlik-celp-sevk-tarihleri',
    label: 'Celp & Sevk',
    description: 'Güncel takvimi incele',
  },
  {
    href: '/bedelli',
    label: 'Bedelli',
    description: 'Ücreti beş yıllık verilerle karşılaştır',
  },
  {
    href: '/blog',
    label: 'Askerlik Rehberi',
    description: 'Hazırlık rehberlerini oku',
  },
  {
    href: '/#araclar',
    label: 'Araçlar',
    description: 'Askerlik araçlarına ulaş',
  },
  {
    href: '/#haberler',
    label: 'Haberler',
    description: 'Askerlik gündemini takip et',
  },
] as const;
