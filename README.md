# Devrem web platformu — Stage 1

Devrem'in ürün temeli, görsel sistemi, global yerleşimi ve ana sayfası. Bu aşama; bilgi mimarisini, tekrar kullanılabilir arayüz parçalarını ve sonraki ürün aşamalarına uygun tipli demo veri katmanını kurar.

## Kapsam

- Global header, mobil menü ve footer
- Hero ve mevcut askerlik bilgisi özeti
- Birlik keşfi ve istemci tarafında çalışan demo arama
- Celp dönemi topluluk özeti
- Bedelli askerlik bilgi alanı
- Araçlar, rehberler, askerlik gündemi ve uygulama tanıtımı
- Kontrollü sponsor yerleşimi ve final CTA
- SEO metadata, Open Graph görseli, favicon ve erişilebilirlik temeli

Stage 2'ye bırakılan özellikler: kullanıcı hesabı, mesajlaşma, gerçek birlik sayfaları, canlı döviz/altın verileri, CMS, veritabanı, ödeme veya aktif sponsor entegrasyonu.

## Teknoloji

- React 19 ve TypeScript
- Next.js App Router uyumlu Vinext proje yapısı
- Tailwind CSS 4
- shadcn/ui ve Lucide ikonları
- pnpm

## Yerel çalışma

```bash
pnpm install
pnpm dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde açılır.

## Kalite kontrolleri

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Proje yapısı

- `app/`: sayfa, metadata ve global stil katmanı
- `components/home/`: ana sayfa modülleri
- `components/site/`: global yerleşim ve ortak arayüz parçaları
- `components/ui/`: shadcn/ui parçaları
- `src/config/`: navigasyon ve site ayarları
- `src/fixtures/`: tipli Stage 1 demo verileri
- `public/`: favicon ve sosyal paylaşım görseli

## Veri notu

Dinamik görünen askerlik tarihi, celp sayıları, bedelli tutarı, döviz/altın karşılıkları ve gündem kayıtları Stage 1'de açıkça `Demo veri` veya `Örnek` olarak işaretlenir. Bunlar resmî ya da canlı kaynak değildir.
