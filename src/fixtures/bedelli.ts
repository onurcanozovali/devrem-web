export const bedelliPeriods = [
  {
    year: 2022,
    label: '01 Temmuz – 31 Aralık 2022',
    amount: 80_064.72,
    sourceLabel: '2022 HMB genelgesi',
    sourceUrl: 'https://www.hmb.gov.tr/duyuru/2022-yili-temmuz-ayina-ait-mali-ve-sosyal-haklara-iliskin-genelge',
  },
  {
    year: 2023,
    label: '01 Temmuz – 31 Aralık 2023',
    amount: 122_351.04,
    sourceLabel: '2023 MSB kaynağı',
    sourceUrl: 'https://www.msb.gov.tr/SlaytHaber/f61761ce6f2b4cec9d3b25091417670c',
  },
  {
    year: 2024,
    label: '01 Temmuz – 31 Aralık 2024',
    amount: 217_871.04,
    sourceLabel: '2024 MSB kaynağı',
    sourceUrl: 'https://www.msb.gov.tr/SlaytHaber/9c4c08fc21214b108d64c5f3eccd8f13',
  },
  {
    year: 2025,
    label: '01 Temmuz – 31 Aralık 2025',
    amount: 280_850.64,
    sourceLabel: '2025 MSB kaynağı',
    sourceUrl: 'https://www.msb.gov.tr/SlaytHaber/8fbc334792824c75bb6efef14fd5c62b',
  },
  {
    year: 2026,
    label: '01 Temmuz – 31 Aralık 2026',
    amount: 472_653.6,
    sourceLabel: '2026 MSB kaynağı',
    sourceUrl: 'https://www.msb.gov.tr/Askeralma/Duyuru/67032f65cc024348b8cf3fea86c95128',
  },
] as const;

export const firstBedelliPeriod = bedelliPeriods[0];
export const currentBedelliPeriod = bedelliPeriods[bedelliPeriods.length - 1];
export const quarterGoldPureGrams = 1.6065;
