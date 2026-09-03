export type BedelliSource = {
  id: string;
  organization: string;
  title: string;
  url: string;
  note: string;
  updatedAt: string;
};

export type BedelliComparisonId = 'gold' | 'eur' | 'minimumWage';

export type BedelliComparisonDefinition = {
  id: BedelliComparisonId;
  name: string;
  unit: string;
  category: 'precious-metal' | 'currency' | 'income';
  source: BedelliSource;
  notes: string;
  updatedAt: string;
  priceSeries:
    | { kind: 'evds'; metric: 'gold' | 'eur'; yearlyPrices?: never }
    | { kind: 'yearly'; yearlyPrices: Record<number, number> };
};

export const bedelliSources = {
  currentFee: {
    id: 'msb-current-fee',
    organization: 'T.C. Millî Savunma Bakanlığı',
    title: '01 Temmuz – 31 Aralık 2026 Bedelli Askerlik Müracaat Duyurusu',
    url: 'https://www.msb.gov.tr/Askeralma/Duyuru/67032f65cc024348b8cf3fea86c95128',
    note: 'Güncel bedel ve geçerlilik dönemi.',
    updatedAt: '2026-07-07',
  },
  market: {
    id: 'tcmb-evds-market',
    organization: 'Türkiye Cumhuriyet Merkez Bankası',
    title: 'Elektronik Veri Dağıtım Sistemi (EVDS)',
    url: 'https://evds2.tcmb.gov.tr/',
    note: 'Döviz alış ve BİST altın kapanış serilerinin aylık son değerleri.',
    updatedAt: '2026-09-02',
  },
  minimumWage: {
    id: 'csgb-minimum-wage',
    organization: 'T.C. Çalışma ve Sosyal Güvenlik Bakanlığı',
    title: 'Yıllar itibarıyla net ve brüt asgari ücret',
    url: 'https://www.csgb.gov.tr/tr/poco-pages/asgari-ucret/',
    note: 'Bedelli dönemleriyle eşleştirilen aylık net asgari ücret tutarları.',
    updatedAt: '2026-01-01',
  },
} satisfies Record<string, BedelliSource>;

export const bedelliComparisonDefinitions: BedelliComparisonDefinition[] = [
  {
    id: 'gold',
    name: 'Gram altın',
    unit: 'gram',
    category: 'precious-metal',
    source: bedelliSources.market,
    notes:
      'EVDS BİST altın kapanış kilogram fiyatı gram birimine çevrilerek hesaplanır.',
    updatedAt: '2026-09-02',
    priceSeries: { kind: 'evds', metric: 'gold' },
  },
  {
    id: 'eur',
    name: 'Euro',
    unit: 'EUR',
    category: 'currency',
    source: bedelliSources.market,
    notes: 'EVDS euro alış kurunun aynı aya hizalanmış son değeri kullanılır.',
    updatedAt: '2026-09-02',
    priceSeries: { kind: 'evds', metric: 'eur' },
  },
  {
    id: 'minimumWage',
    name: 'Net asgari ücret',
    unit: 'aylık maaş',
    category: 'income',
    source: bedelliSources.minimumWage,
    notes:
      '2022 ve 2023 için Temmuz–Aralık döneminde geçerli net asgari ücret kullanılır.',
    updatedAt: '2026-01-01',
    priceSeries: {
      kind: 'yearly',
      yearlyPrices: {
        2022: 5_500.35,
        2023: 11_402.32,
        2024: 17_002.12,
        2025: 22_104.67,
        2026: 28_075.5,
      },
    },
  },
];

export const bedelliPageCopy = {
  heroIntro:
    'Bugünkü tutarı geçmiş yıllarla, gram altınla ve net asgari ücretle karşılaştır.',
  purchasingIntro:
    'Bedelli askerlik ücretinin alım gücünün yıllar içinde nasıl değiştiğini gerçek verilerle keşfet.',
  goldDisclaimer:
    'Bu hesaplama yalnızca geçmiş dönem karşılaştırmasıdır, yatırım tavsiyesi değildir.',
} as const;

export const bedelliRelatedContent = [
  {
    title: '2026 askerlik celp ve sevk tarihleri',
    description: 'Sınıflandırma, sonuç ve sevk günlerini tek takvimde gör.',
    href: '/blog/2026-askerlik-celp-sevk-tarihleri',
  },
  {
    title: 'Sevk belgesi nedir, nasıl alınır?',
    description: 'Belgeni ne zaman ve nereden alacağını adım adım öğren.',
    href: '/blog/sevk-belgesi-nedir-nasil-alinir',
  },
  {
    title: 'Askere giderken çanta nasıl sadeleşir?',
    description: 'Yanına gerçekten gerekenleri pratik bir listeyle hazırla.',
    href: '/blog/askere-giderken-canta-nasil-sadelesir',
  },
  {
    title: 'Acemi birliğinde ilk gün',
    description: 'Teslimden koğuş düzenine ilk günün akışını önceden bil.',
    href: '/blog/acemi-birliginde-ilk-gun',
  },
] as const;

export const bedelliFaqs = [
  {
    question: '2026 bedelli askerlik ücreti ne kadar?',
    answer:
      '1 Temmuz–31 Aralık 2026 döneminde geçerli bedelli askerlik ücreti 472.653,60 TL’dir. Yoklama kaçağı veya bakaya durumunda ayrıca ek bedel uygulanabilir.',
  },
  {
    question: 'Bedelli askerlik ücreti nasıl belirleniyor?',
    answer:
      'Bedel, 7179 sayılı Askeralma Kanunu uyarınca belirlenen gösterge rakamının ödeme gününde geçerli memur aylık katsayısıyla çarpılmasıyla hesaplanır.',
  },
  {
    question: 'Bedelli askerlik ücreti ne zaman değişiyor?',
    answer:
      'Bedelli askerlik tutarı memur aylık katsayısına bağlı olarak her yıl ocak ve temmuz aylarında yeniden belirlenir.',
  },
  {
    question: 'Geçmiş yıllarda bedelli askerlik ne kadardı?',
    answer:
      'Bu sayfadaki yıllık karşılaştırma 2022–2026 dönemlerinin ikinci yarısında geçerli resmî tutarları gösterir. Kesin değerler ilgili MSB ve Hazine ve Maliye Bakanlığı duyurularına bağlanır.',
  },
  {
    question: 'Bedelli askerlik ücreti euro olarak ne kadar?',
    answer:
      'Euro karşılığı kura göre her gün değişir. Sayfadaki sonuç, günlük yenilenen TCMB EVDS euro alış kuru kullanılarak otomatik hesaplanır.',
  },
  {
    question: 'Bedelli askerlik ücreti kaç gram altın ediyor?',
    answer:
      'Gram altın karşılığı piyasa fiyatına göre değişir. Sayfadaki hesap, TCMB EVDS BİST altın kapanış verisini gram birimine çevirerek güncellenir.',
  },
] as const;
