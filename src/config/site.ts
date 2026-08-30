export const siteConfig = {
  name: 'Devrem',
  url: 'https://devrem.co',
  description:
    'Askere gitmeden önce devrelerini bul, birliğin hakkında bilgi edin, hazırlığını tamamla ve güncel askerlik rehberlerine ulaş.',
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
  { href: '/#birlikler', label: 'Birlikler' },
  { href: '/#rehberler', label: 'Askerlik Rehberi' },
  { href: '/#bedelli', label: 'Bedelli' },
  { href: '/#araclar', label: 'Araçlar' },
  { href: '/#gundem', label: 'Haberler' },
] as const;
