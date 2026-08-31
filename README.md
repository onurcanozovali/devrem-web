# Devrem web platformu

Devrem'in ürün temeli, görsel sistemi, global yerleşimi ve ana sayfası. Bu aşama; bilgi mimarisini, tekrar kullanılabilir arayüz parçalarını ve sonraki ürün aşamalarına uygun tipli demo veri katmanını kurar.

## Kapsam

- Global header, mobil menü ve footer
- Hero ve mevcut askerlik bilgisi özeti
- Birlik keşfi ve istemci tarafında çalışan demo arama
- Celp dönemi topluluk özeti
- Ayrı `/bedelli` sayfasında resmî tutar, canlı çevirici ve 2022–2026 alım gücü karşılaştırması
- Araçlar, rehberler, askerlik gündemi ve uygulama tanıtımı
- Kontrollü sponsor yerleşimi ve final CTA
- SEO metadata, Open Graph görseli, favicon ve erişilebilirlik temeli

Sonraki aşamalara bırakılan özellikler: kullanıcı hesabı, mesajlaşma, gerçek birlik sayfaları, CMS, ödeme veya aktif sponsor entegrasyonu.

## Teknoloji

- React 19 ve TypeScript
- Next.js App Router uyumlu Vinext proje yapısı
- Tailwind CSS 4
- shadcn/ui ve Lucide ikonları
- Recharts veri görselleştirmeleri
- Cloudflare D1 günlük EVDS cache’i
- pnpm

## Marka ve tema

Ana site yüzeyi açık Devrem temasıdır: kırık beyaz arka plan, katmanlı açık yüzeyler ve kontrollü `#55C89D` mint vurgu. Açık zemin üzerindeki metin vurgularında erişilebilir `primary-ink` tonu kullanılır; CTA, ilerleme ve ürün aksiyonlarında marka minti korunur. Telefon maketleri gerçek ürün ailesini yansıtmak için koyu temadadır. Tüm arayüz Poppins kullanır. Gelecekteki uzun rehber ve makaleler için `editorial-*` yüksek okunabilirlik tokenları hazırdır; ana sayfada etkin değildir.

## Yerel çalışma

```bash
pnpm install
pnpm dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde açılır.

EVDS entegrasyonu için `.env.example` dosyasındaki alanı `.env.local` içinde tanımlayın:

```bash
EVDS_API_KEY=
```

Anahtar yalnızca sunucu tarafında kullanılır ve Git'e eklenmez. Üretim ortamında aynı değer çalışma zamanı secret'ı olarak tanımlanmalıdır.

## Kalite kontrolleri

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Proje yapısı

- `app/`: sayfa, metadata ve global stil katmanı
- `components/home/`: ana sayfa modülleri
- `components/bedelli/`: çevirici, beş yıllık karşılaştırma tablosu ve piyasa grafiği
- `components/site/`: global yerleşim ve ortak arayüz parçaları
- `components/ui/`: shadcn/ui parçaları
- `db/`: günlük EVDS cache şeması
- `lib/evds.ts`: güvenli EVDS isteği, günlük kilit ve veri normalizasyonu
- `src/config/`: navigasyon ve site ayarları
- `src/fixtures/`: tipli Stage 1 demo verileri
- `public/`: favicon ve sosyal paylaşım görseli

## Veri notu

Bedelli tutarları MSB duyurularından, 2022 dönemi ise Hazine ve Maliye Bakanlığı genelgesindeki katsayıdan alınır. Dolar ve euro TCMB alış kurları, gram altın ise BİST altın kapanış TL/kg serisinin 1.000'e bölünmüş değeridir. Beş yıllık seri EVDS'nin aylık bitiş dönüşümüyle tek istekte alınır ve gün başına bir kez D1'e yazılır. Çeyrek altın hesabı 1,6065 gram saf altın üzerinden yaklaşık metal değeridir; kuyumcu perakende fiyatı değildir. Celpler, birlikler ve gündem gibi diğer örnek kayıtlar arayüzde `Demo` veya `Örnek` olarak işaretlenmeye devam eder.
