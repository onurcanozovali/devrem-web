export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type EditorialSource = {
  label: string;
  href: string;
};

export type BlogPost = {
  slug: string;
  category: 'Rehber' | 'Bedelli' | 'Deneyim';
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;
  author: string;
  tone: 'mint' | 'amber' | 'slate' | 'sand';
  featured?: boolean;
  sections: ArticleSection[];
  sources?: EditorialSource[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'sevk-belgesi-nedir-nasil-alinir',
    category: 'Rehber',
    title: 'Sevk belgesi nedir, nasıl alınır?',
    excerpt:
      'Belgede hangi bilgiler yer alır, ne zaman alınır ve teslim gününde neden önemlidir? Resmî kaynaklarla kısa ve net bir rehber.',
    publishedAt: '31 Ağustos 2026',
    readingTime: '6 dk',
    author: 'Devrem Editör',
    tone: 'mint',
    featured: true,
    sections: [
      {
        heading: 'Sevk belgesi ne işe yarar?',
        paragraphs: [
          'Sevk belgesi; kimlik, askerlik statüsü, sınıflandırma sonucu, eğitim birliği, sevk tarihi, katılış tarihi ile yol ve iaşe bilgilerini bir araya getiren resmî belgedir.',
          'Birliğe teslim olmadan önce belgedeki tarihleri ve birlik bilgisini dikkatle kontrol etmek gerekir. Ekran görüntüsü yerine barkodlu belgenin kendisini indirmek ve güvenli bir kopyasını saklamak en sağlıklı yaklaşımdır.',
        ],
      },
      {
        heading: 'Nereden alınır?',
        paragraphs: [
          'MSB’nin Askerliğim hizmetindeki “Celp ve Sevk Dönemi” alanından sevk başvurusu başlatılabilir. Belge e-Devlet üzerinden alınabildiği gibi T.C. kimlik kartıyla askerlik şubesinden de temin edilebilir.',
        ],
        bullets: [
          'Belgedeki sevk ve katılış tarihlerini ayrı ayrı kontrol et.',
          'Yol süresi ile birliğe son katılış tarihini karıştırma.',
          'Barkodlu PDF’yi telefonuna indir; mümkünse basılı kopyasını da yanında bulundur.',
        ],
      },
      {
        heading: 'Belgedeki temel alanlar',
        paragraphs: [
          'Eğitim merkezi, kuvvet, sınıf, hizmet şekli ve hizmet süresi senin askerlik planının ana çerçevesini oluşturur. Yol ve iaşe bedelleri de aynı belgede görülebilir.',
        ],
      },
      {
        heading: 'Son kontrol',
        paragraphs: [
          'Teslim yolculuğunu planlamadan önce belgedeki birlik adresini, katılış tarihini ve yol süresini resmî ekrandan yeniden doğrula. Devrem rehberleri süreci anlamanı kolaylaştırır; resmî işlemlerde her zaman MSB ve e-Devlet bilgileri esas alınır.',
        ],
      },
    ],
    sources: [
      {
        label: 'MSB — Sevk Belgesi Nasıl Alınır?',
        href: 'https://www.msb.gov.tr/Askeralma/icerik/sevk-belgesi-nasil-alinir',
      },
      {
        label: 'e-Devlet — Millî Savunma Bakanlığı hizmetleri',
        href: 'https://www.turkiye.gov.tr/milli-savunma-bakanligi',
      },
    ],
  },
  {
    slug: 'bedelli-ucretinin-bes-yillik-alim-gucu',
    category: 'Bedelli',
    title: 'Bedelli ücretinin beş yıllık alım gücü',
    excerpt:
      'Sadece TL artışına bakmak yerine bedelin dolar, euro ve gram altın karşılığını aynı aylar üzerinden karşılaştırdık.',
    publishedAt: '31 Ağustos 2026',
    readingTime: '5 dk',
    author: 'Devrem Veri',
    tone: 'amber',
    sections: [
      {
        heading: 'Neden yalnızca TL tutarı yeterli değil?',
        paragraphs: [
          'Nominal tutar ücretin kasadan çıkan kısmını gösterir; alım gücü ise aynı paranın farklı dönemlerde neye karşılık geldiğini anlatır. Bu nedenle yılları aynı ayın döviz ve altın değerleriyle yan yana okumak daha anlamlı bir perspektif sağlar.',
        ],
      },
      {
        heading: 'Devrem karşılaştırması nasıl çalışıyor?',
        paragraphs: [
          '2022–2026 arasındaki ikinci yarı bedelli tutarlarını, TCMB EVDS’nin aynı aya hizalanmış dolar alış, euro alış ve BİST altın kapanış verileriyle eşleştiriyoruz. Veriler günde bir kez yenileniyor ve beş yıllık seri tek istekte alınıyor.',
        ],
        bullets: [
          'Dolar ve euro için TCMB alış serileri kullanılır.',
          'Gram altın, BİST TL/kg kapanış değerinin 1.000’e bölünmesiyle hesaplanır.',
          'Çeyrek altın yalnızca yaklaşık saf altın karşılığıdır; işçilik ve kuyumcu makası içermez.',
        ],
      },
      {
        heading: 'Rakamları kendin incele',
        paragraphs: [
          'Bedelli sayfasındaki yıl seçiciyle 2022, 2023, 2024 veya 2025 dönemini 2026 ile doğrudan karşılaştırabilir; beş yıllık tabloyu ve piyasa grafiğini birlikte okuyabilirsin.',
        ],
      },
    ],
    sources: [
      {
        label: 'Devrem — Beş yıllık Bedelli karşılaştırması',
        href: '/bedelli',
      },
    ],
  },
  {
    slug: 'acemi-birliginde-ilk-gun',
    category: 'Deneyim',
    title: 'Acemi birliğinde ilk gün: belirsizliği azaltan notlar',
    excerpt:
      'Teslim kapısından ilk akşama kadar süreç nasıl ilerleyebilir? Kesin kurallar yerine işe yarayan bir hazırlık çerçevesi.',
    publishedAt: '29 Ağustos 2026',
    readingTime: '7 dk',
    author: 'Devrem Editör',
    tone: 'slate',
    sections: [
      {
        heading: 'Tek bir “ilk gün” yok',
        paragraphs: [
          'İşleyiş birliğe, yoğunluğa ve teslim saatine göre değişebilir. Bu nedenle internetteki tekil deneyimleri kesin prosedür gibi okumak yerine ortak noktaları anlamak daha faydalıdır.',
        ],
      },
      {
        heading: 'Süreci kolaylaştıran hazırlık',
        paragraphs: [
          'Kimlik ve sevk belgesini kolay erişilen, kuru bir dosyada tut. Telefon, cüzdan ve teslim edilecek eşyalar için küçük bir düzen kur. Aceleyle alınmış fazla eşya, ilk günün zaten yoğun olan akışını zorlaştırabilir.',
        ],
        bullets: [
          'Belge ve kimliğini çantanın dibine koyma.',
          'Birliğe ulaşım için yedekli zaman planla.',
          'Yakınlarına teslimden sonra iletişimin gecikebileceğini önceden söyle.',
          'Resmî görevlilerin yönlendirmesini esas al.',
        ],
      },
      {
        heading: 'İlk akşam için doğru beklenti',
        paragraphs: [
          'Kayıt, eşya teslimi, koğuş yerleşimi ve bilgilendirmeler zaman alabilir. İlk günün amacı her şeyi hemen çözmek değil, bulunduğun düzeni anlamak ve verilen yönlendirmeleri takip etmektir.',
        ],
      },
    ],
  },
  {
    slug: 'askere-giderken-canta-nasil-sadelesir',
    category: 'Rehber',
    title: 'Askere giderken çanta nasıl sadeleşir?',
    excerpt:
      '“Her ihtimale karşı” doldurulan bir çanta yerine, gerçekten işine yarayacak eşyaları seçmenin pratik yöntemi.',
    publishedAt: '27 Ağustos 2026',
    readingTime: '4 dk',
    author: 'Devrem Editör',
    tone: 'sand',
    sections: [
      {
        heading: 'Üç gruba ayır',
        paragraphs: [
          'Eşyalarını belge ve değerli eşyalar, ilk gün ihtiyaçları ve sonradan temin edilebilecekler olarak üçe ayır. Bu ayrım, hem çantayı hafifletir hem de teslim sırasında aradığını bulmayı kolaylaştırır.',
        ],
      },
      {
        heading: 'Az ama erişilebilir',
        paragraphs: [
          'İlk saatlerde ihtiyaç duyacağın şeyleri ayrı bir küçük bölmeye koy. Büyük paketler yerine kompakt ürünleri, kırılmayacak ambalajları ve kolay işaretlenebilen kişisel eşyaları tercih et.',
        ],
      },
      {
        heading: 'Birliğe göre değişebilenler',
        paragraphs: [
          'İzin verilen eşya ve kullanım koşulları birlik uygulamalarına göre değişebilir. Nihai karar için sevk evrakındaki yönlendirmeleri ve birliğin resmî bilgilendirmesini esas al.',
        ],
      },
    ],
  },
];

export type VlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  duration: string;
  videoUrl: string | null;
  captionsUrl: string | null;
  chapters: { time: string; title: string }[];
  notes: string[];
};

export const vlogPosts: VlogPost[] = [
  {
    slug: 'birlik-yolculugu-ilk-bolum',
    title: 'Birliğe yolculuk: teslimden önce son 24 saat',
    excerpt:
      'Hazırlık telaşından yol planına, vedadan teslim kapısına kadar son günün sakin ve gerçekçi bir anlatımı.',
    publishedAt: '31 Ağustos 2026',
    duration: '08:42',
    videoUrl: null,
    captionsUrl: null,
    chapters: [
      { time: '00:00', title: 'Son günün planı' },
      { time: '02:10', title: 'Belge ve çanta kontrolü' },
      { time: '04:35', title: 'Yolculuk için zaman payı' },
      { time: '06:20', title: 'Teslim kapısına yaklaşırken' },
    ],
    notes: [
      'Bu pilot içerikte video dosyası henüz yayınlanmadı; sayfa gerçek video URL’si eklendiğinde aynı yapı içinde oynatıcıya dönüşür.',
      'Birliğe göre değişebilen kurallarda resmî yönlendirmeleri esas al.',
      'Sevk belgesi, kimlik ve ulaşım planını çıkmadan önce son kez kontrol et.',
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getVlogPost(slug: string) {
  return vlogPosts.find((post) => post.slug === slug);
}
