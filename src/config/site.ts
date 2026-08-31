export const siteConfig = {
  name: 'Devrem',
  url: 'https://devrem.co',
  description:
    'Aynı celp döneminde aynı birliğe gidecek devrelerinle tanış; Bedelli verilerini karşılaştır ve sade askerlik rehberlerine ulaş.',
  contactEmail: 'iletisim@devrem.co',
  operatorName: 'Onurcan Özovalı ve Muhammet Şen',
  dataControllerName: 'Onurcan Özovalı ve Muhammet Şen',
  address: 'İstiklal Mah. Cumhuriyet Cad. No: 290, 19 Mayıs/Samsun',
  legalVersion: '2026-08-20-v1',
  release: {
    status: 'preparing' as const,
    appStoreUrl: null,
    googlePlayUrl: null,
  },
  socialLinks: [] as { label: string; href: string }[],
};

export const mainNavigation = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/bedelli', label: 'Bedelli' },
  { href: '/blog', label: 'Blog' },
  { href: '/#uygulama', label: 'Devrem Uygulaması' },
] as const;
