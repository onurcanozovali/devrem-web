export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullet-list'; items: string[] }
  | { type: 'numbered-list'; items: string[] }
  | {
      type: 'table';
      caption?: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: 'callout';
      tone: 'info' | 'warning' | 'note';
      title: string;
      body: string;
    };

export type ArticleSubsection = {
  heading: string;
  blocks: ArticleBlock[];
};

export type ArticleSection = {
  heading: string;
  /** Legacy fields remain supported so existing article fixtures keep rendering. */
  paragraphs?: string[];
  bullets?: string[];
  blocks?: ArticleBlock[];
  subsections?: ArticleSubsection[];
};

export type EditorialSource = {
  label: string;
  href: string;
};

export type BlogPost = {
  slug: string;
  category: 'Rehber' | 'Bedelli' | 'Deneyim';
  title: string;
  seoTitle?: string;
  excerpt: string;
  standfirst?: [string, string];
  quickSummary?: string[];
  publishedAt: string;
  publishedIso: string;
  updatedAt?: string;
  updatedIso?: string;
  readingTime: string;
  author: string;
  tone: 'mint' | 'amber' | 'slate' | 'sand';
  featured?: boolean;
  coverImage?: { src: string; alt: string; caption?: string };
  sections: ArticleSection[];
  sources?: EditorialSource[];
  faqs?: { question: string; answer: string }[];
  contextualLinks?: {
    title: string;
    description: string;
    href?: string;
    status: string;
  }[];
  relatedSlugs?: string[];
  endCta?: {
    title: string;
    description: string;
    label: string;
    href: string;
  };
};

export const blogPosts: BlogPost[] = [
  {
    slug: '2026-askerlik-celp-sevk-tarihleri',
    category: 'Rehber',
    title: '2026 Askerlik Celp ve Sevk Tarihleri: Güncel Askerlik Takvimi',
    seoTitle: '2026 Askerlik Celp ve Sevk Tarihleri: Güncel Takvim',
    excerpt:
      '2026 askerlik celp ve sevk tarihlerini öğrenin. Şubat, Mayıs, Ağustos ve Kasım sınıflandırma dönemleri, sonuç ve sevk tarihleri tek tabloda.',
    standfirst: [
      '2026 askerlik takvimi Şubat, Mayıs, Ağustos ve Kasım olmak üzere dört ana sınıflandırma döneminden oluşuyor.',
      'Sonuç açıklama günleri ile yedek subay, yedek astsubay ve er sevk tarihlerini tek yerde karşılaştır.',
    ],
    quickSummary: [
      '2026’da dört ana sınıflandırma dönemi var: Şubat, Mayıs, Ağustos ve Kasım.',
      'Sınıflandırma dönemi ile fiilî sevk tarihi her zaman aynı değildir.',
      'Erler 1, 2 veya 3’üncü grup olarak farklı tarihlerde sevk edilebilir.',
      'Kasım 2026 sınıflandırma sonuçları 27 Ekim 2026’da açıklanacak.',
    ],
    publishedAt: '31 Ağustos 2026',
    publishedIso: '2026-08-31',
    readingTime: '6 dk',
    author: 'Devrem Editör',
    tone: 'mint',
    featured: true,
    sections: [
      {
        heading: '2026 Askerlik Celp ve Sevk Takvimi',
        blocks: [
          {
            type: 'paragraph',
            text: 'Sınıflandırma dönemi, askerlik yerinin ve statünün belirlendiği takvim dönemidir. Sevk tarihi ise birliğe katılış sürecinin başladığı fiilî tarihtir; bu nedenle aynı dönemde sınıflandırılan herkes aynı gün sevk edilmeyebilir.',
          },
          {
            type: 'table',
            caption: '2026 sınıflandırma sonuçları ve sevk tarihleri',
            headers: [
              'Sınıflandırma dönemi',
              'Sonuç açıklama',
              'Yedek subay / astsubay',
              'Er 1. grup',
              'Er 2. grup',
              'Er 3. grup',
            ],
            rows: [
              [
                'Şubat 2026',
                '29 Ocak 2026',
                '5 Şubat 2026',
                '5 Şubat 2026',
                '5 Mart 2026',
                '2 Nisan 2026',
              ],
              [
                'Mayıs 2026',
                '17 Nisan 2026',
                '22 Nisan 2026',
                '22 Nisan 2026',
                '4 Haziran 2026',
                '2 Temmuz 2026',
              ],
              [
                'Ağustos 2026',
                '30 Temmuz 2026',
                '6 Ağustos 2026',
                '6 Ağustos 2026',
                '3 Eylül 2026',
                '1 Ekim 2026',
              ],
              [
                'Kasım 2026',
                '27 Ekim 2026',
                '5 Kasım 2026',
                '5 Kasım 2026',
                '3 Aralık 2026',
                '7 Ocak 2027',
              ],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            title: 'Güncel kaydı kontrol et',
            body: 'MSB, gelişen şartlar ile Türk Silahlı Kuvvetlerinin ihtiyaç ve önceliklerine göre açıklama veya sevk tarihlerinde değişiklik yapabilir. Kendi e-Devlet kaydını ve güncel MSB duyurusunu esas al.',
          },
        ],
      },
      {
        heading: 'Celp Dönemi Nedir?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Celp ya da sınıflandırma dönemi, yükümlünün statü, sınıf, birlik ve sevk grubunun belirlendiği ana takvim dilimidir. 2026 yılı için dört ana sınıflandırma dönemi bulunur:',
          },
          {
            type: 'bullet-list',
            items: [
              'Şubat 2026 sınıflandırma dönemi',
              'Mayıs 2026 sınıflandırma dönemi',
              'Ağustos 2026 sınıflandırma dönemi',
              'Kasım 2026 sınıflandırma dönemi',
            ],
          },
          {
            type: 'paragraph',
            text: 'Yaptığın celp ve sevk dönemi tercihleri değerlendirmeye alınabilir; ancak sınıflandırmada Türk Silahlı Kuvvetlerinin ihtiyaç ve öncelikleri de belirleyicidir.',
          },
        ],
      },
      {
        heading: 'Sevk Tarihi Nedir?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Sevk tarihi, sınıflandırma sonucu belli olduktan sonra askerlik hizmetine katılış sürecinin başladığı tarihtir. Aynı sınıflandırma dönemindeki yedek subay ve yedek astsubay adayları ile er grupları farklı tarihlerde sevk edilebilir.',
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Kasım 2026 örneği',
            body: 'Kasım dönemi sonuçları 27 Ekim 2026’da açıklanır. Er 2’nci grupta sınıflandırılan bir yükümlünün sevk tarihi ise 3 Aralık 2026’dır.',
          },
        ],
      },
      {
        heading: '2026 Askerlik Yerleri Ne Zaman Açıklanacak?',
        blocks: [
          {
            type: 'paragraph',
            text: 'MSB’nin 2026 sınıflandırma takvimine göre askerlik yerlerinin ve sınıflandırma sonuçlarının açıklanacağı tarihler şunlardır:',
          },
          {
            type: 'table',
            caption: '2026 sınıflandırma sonucu açıklama tarihleri',
            headers: ['Dönem', 'Sonuç tarihi'],
            rows: [
              ['Şubat 2026', '29 Ocak 2026'],
              ['Mayıs 2026', '17 Nisan 2026'],
              ['Ağustos 2026', '30 Temmuz 2026'],
              ['Kasım 2026', '27 Ekim 2026'],
            ],
          },
        ],
      },
      {
        heading: 'Kasım 2026 Askerlik Yerleri Ne Zaman Açıklanacak?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Kasım 2026 sınıflandırma sonuçları 27 Ekim 2026 tarihinde e-Devlet üzerinden duyurulacak. Statü ve gruba göre sevk tarihleri şöyledir:',
          },
          {
            type: 'table',
            caption: 'Kasım 2026 sevk tarihleri',
            headers: ['Statü / grup', 'Sevk tarihi'],
            rows: [
              ['Yedek subay / yedek astsubay adayları', '5 Kasım 2026'],
              ['Er 1’inci grup', '5 Kasım 2026'],
              ['Er 2’nci grup', '3 Aralık 2026'],
              ['Er 3’üncü grup', '7 Ocak 2027'],
            ],
          },
          {
            type: 'callout',
            tone: 'note',
            title: 'Kasım dönemi işlem son tarihi',
            body: 'Kasım 2026 sınıflandırmasında yer almak isteyen yükümlüler için yoklama, askerlik hizmet tercihi ve celp tercihi işlemlerini tamamlama son tarihi 31 Ağustos 2026’ydı.',
          },
        ],
      },
    ],
    sources: [
      {
        label:
          'MSB — 2026 Yılı Yedek Subay, Yedek Astsubay ve Er Celp-Sevk Takvimi',
        href: 'https://www.msb.gov.tr/Content/Upload/Docs/asal/2026_Y%C4%B1l%C4%B1_S%C4%B1n%C4%B1fland%C4%B1rma_Faaliyet_Takvimi_02012026.pdf',
      },
      {
        label: 'MSB — Kasım 2026 Sınıflandırma Dönemi Duyurusu',
        href: 'https://www.msb.gov.tr/Askeralma/Duyuru/a090cba01d3949ca8948978b87ee5f54',
      },
    ],
    faqs: [
      {
        question: '2026 askerlik celp dönemleri hangi aylar?',
        answer:
          'Şubat, Mayıs, Ağustos ve Kasım ana sınıflandırma dönemleridir.',
      },
      {
        question: '2026 askerlik yerleri hangi tarihlerde açıklanacak?',
        answer:
          'Sınıflandırma sonuçları Şubat dönemi için 29 Ocak, Mayıs dönemi için 17 Nisan, Ağustos dönemi için 30 Temmuz ve Kasım dönemi için 27 Ekim 2026’da açıklanacak.',
      },
      {
        question: 'Kasım 2026 askerlik yerleri ne zaman belli olacak?',
        answer:
          'Kasım 2026 sınıflandırma sonuçları 27 Ekim 2026’da açıklanacak.',
      },
      {
        question: 'Kasım 2026’da askere gidecekler ne zaman sevk edilecek?',
        answer:
          'Statü ve sevk grubuna göre 5 Kasım 2026, 3 Aralık 2026 veya 7 Ocak 2027 tarihinde sevk edilecekler.',
      },
      {
        question: 'Sevk tarihi ile celp dönemi aynı mı?',
        answer:
          'Hayır. Sınıflandırma dönemi ile fiilî sevk tarihi farklı olabilir.',
      },
    ],
    contextualLinks: [
      {
        title: 'Askerlik yeri nasıl sorgulanır?',
        description:
          'Sınıflandırma sonucunu ve birlik bilgilerini nereden kontrol edeceğini öğren.',
        status: 'Yakında',
      },
      {
        title: 'Sevk belgesi nedir, nasıl alınır?',
        description:
          'Belgenin ne zaman açıldığını ve hangi bilgileri içerdiğini ayrı rehberde incele.',
        href: '/blog/sevk-belgesi-nedir-nasil-alinir',
        status: 'Rehberi oku',
      },
      {
        title: 'Askerlik yol parası rehberi',
        description:
          'Yol ve iaşe bedelinin nasıl hesaplandığını ayrı rehberde incele.',
        status: 'Yakında',
      },
      {
        title: '2026 bedelli askerlik rehberi',
        description:
          'Bedelli sevk bilgilerini ve beş yıllık ücret karşılaştırmasını incele.',
        href: '/bedelli',
        status: 'Bedelli sayfası',
      },
    ],
    relatedSlugs: [
      'sevk-belgesi-nedir-nasil-alinir',
      'acemi-birliginde-ilk-gun',
    ],
    endCta: {
      title: 'Aynı dönemdeki devrelerinle yola çıkmadan tanış',
      description:
        'Devrem’de aynı celp dönemindeki, aynı askerlik şehrine veya birliğe gidecek kişileri bul ve teslim öncesi iletişim kur.',
      label: 'Devrem uygulamasını keşfet',
      href: '/#uygulama',
    },
  },
  {
    slug: 'sevk-belgesi-nedir-nasil-alinir',
    category: 'Rehber',
    title: 'Sevk belgesi nedir, nasıl alınır?',
    excerpt:
      'Belgede hangi bilgiler yer alır, ne zaman alınır ve teslim gününde neden önemlidir? Resmî kaynaklarla kısa ve net bir rehber.',
    standfirst: [
      'Sevk belgesi, birliğe teslim sürecindeki temel tarih ve yer bilgilerini tek belgede toplar.',
      'Belgeyi nereden alacağını ve teslimden önce hangi alanları kontrol etmen gerektiğini adım adım öğren.',
    ],
    quickSummary: [
      'Belge e-Devlet üzerinden veya askerlik şubesinden alınabilir.',
      'Sevk tarihi ile birliğe son katılış tarihi aynı şey değildir.',
      'Barkodlu PDF’yi indir; mümkünse basılı bir kopyasını da yanında tut.',
      'Birlik, tarih ve yol süresi bilgilerini yola çıkmadan önce yeniden doğrula.',
    ],
    publishedAt: '31 Ağustos 2026',
    publishedIso: '2026-08-31',
    readingTime: '6 dk',
    author: 'Devrem Editör',
    tone: 'mint',
    sections: [
      {
        heading: 'Sevk belgesi ne işe yarar?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Sevk belgesi; kimlik, askerlik statüsü, sınıflandırma sonucu, eğitim birliği, sevk tarihi, katılış tarihi ile yol ve iaşe bilgilerini bir araya getiren resmî belgedir.',
          },
          {
            type: 'paragraph',
            text: 'Birliğe teslim olmadan önce belgedeki tarihleri ve birlik bilgisini dikkatle kontrol etmek gerekir. Ekran görüntüsü yerine barkodlu belgenin kendisini indirmek ve güvenli bir kopyasını saklamak en sağlıklı yaklaşımdır.',
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Kısa cevap',
            body: 'Sevk belgesi, nereye ve hangi tarihler arasında teslim olacağını gösteren barkodlu resmî belgedir.',
          },
        ],
      },
      {
        heading: 'Nereden alınır?',
        blocks: [
          {
            type: 'paragraph',
            text: 'MSB’nin Askerliğim hizmetindeki “Celp ve Sevk Dönemi” alanından sevk başvurusu başlatılabilir. Belge e-Devlet üzerinden alınabildiği gibi T.C. kimlik kartıyla askerlik şubesinden de temin edilebilir.',
          },
          {
            type: 'numbered-list',
            items: [
              'e-Devlet’te MSB hizmetleri içinden Askerliğim ekranını aç.',
              'Celp ve sevk dönemi alanındaki sevk başvurusunu tamamla.',
              'Barkodlu belgeyi PDF olarak indir ve bilgileri kontrol et.',
            ],
          },
        ],
        subsections: [
          {
            heading: 'Belgeyi aldıktan sonra',
            blocks: [
              {
                type: 'bullet-list',
                items: [
                  'Belgedeki sevk ve katılış tarihlerini ayrı ayrı kontrol et.',
                  'Yol süresi ile birliğe son katılış tarihini karıştırma.',
                  'PDF’yi telefonuna indir; mümkünse basılı kopyasını da yanında bulundur.',
                ],
              },
            ],
          },
        ],
      },
      {
        heading: 'Belgedeki temel alanlar',
        blocks: [
          {
            type: 'paragraph',
            text: 'Eğitim merkezi, kuvvet, sınıf, hizmet şekli ve hizmet süresi senin askerlik planının ana çerçevesini oluşturur. Yol ve iaşe bedelleri de aynı belgede görülebilir.',
          },
          {
            type: 'table',
            caption: 'Sevk belgesinde sık karıştırılan alanlar',
            headers: ['Alan', 'Ne anlatır?', 'Kontrol'],
            rows: [
              [
                'Sevk tarihi',
                'Yola çıkış sürecinin başlangıcını',
                'Yol süresiyle birlikte oku',
              ],
              [
                'Katılış tarihi',
                'Birliğe son teslim gününü',
                'Ulaşım planına esas al',
              ],
              [
                'Eğitim birliği',
                'Teslim olacağın birliği',
                'Adres ve şehir bilgisini doğrula',
              ],
            ],
          },
        ],
      },
      {
        heading: 'Son kontrol',
        blocks: [
          {
            type: 'paragraph',
            text: 'Teslim yolculuğunu planlamadan önce belgedeki birlik adresini, katılış tarihini ve yol süresini resmî ekrandan yeniden doğrula. Devrem rehberleri süreci anlamanı kolaylaştırır; resmî işlemlerde her zaman MSB ve e-Devlet bilgileri esas alınır.',
          },
          {
            type: 'callout',
            tone: 'warning',
            title: 'Resmî bilgiyi esas al',
            body: 'Tarih veya birlik bilgisiyle ilgili bir çelişki görürsen blog içerikleri yerine e-Devlet kaydını ve askerlik şubesinin yönlendirmesini takip et.',
          },
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
    faqs: [
      {
        question: 'Sevk belgesi telefondan gösterilebilir mi?',
        answer:
          'Barkodlu PDF’yi telefonuna indirmek faydalıdır; ancak teslim sürecinde bağlantı veya pil sorunu yaşamamak için basılı bir kopya taşımak da güvenli bir önlemdir.',
      },
      {
        question: 'Sevk tarihi ile katılış tarihi aynı mı?',
        answer:
          'Hayır. Sevk tarihi yolculuk sürecinin başlangıcını, katılış tarihi ise birliğe teslim için belirtilen son günü ifade eder. Kendi belgendeki tarihleri birlikte kontrol et.',
      },
      {
        question: 'Belgedeki birlik bilgisi değişebilir mi?',
        answer:
          'Resmî kayıtlarda değişiklik olabileceği için yola çıkmadan önce güncel e-Devlet ekranını yeniden kontrol etmek en doğru yaklaşımdır.',
      },
    ],
    relatedSlugs: [
      'acemi-birliginde-ilk-gun',
      'askere-giderken-canta-nasil-sadelesir',
    ],
    endCta: {
      title: 'Hazırlık sürecini sadeleştir',
      description:
        'Devrem’de rehberleri oku, güncel verileri takip et ve uygulama yayınlandığında aynı dönemdeki devrelerinle tanış.',
      label: 'Devrem uygulamasını keşfet',
      href: '/#uygulama',
    },
  },
  {
    slug: 'bedelli-ucretinin-bes-yillik-alim-gucu',
    category: 'Bedelli',
    title: 'Bedelli ücretinin beş yıllık alım gücü',
    excerpt:
      'Sadece TL artışına bakmak yerine bedelin dolar, euro ve gram altın karşılığını aynı aylar üzerinden karşılaştırdık.',
    standfirst: [
      'Bedelli ücretinin TL tutarı tek başına yıllar arasındaki ekonomik farkı anlatmaz.',
      'Aynı bedelin dolar, euro ve altın karşılığını birlikte okuyarak alım gücündeki değişimi daha net görebilirsin.',
    ],
    quickSummary: [
      'Karşılaştırma 2022–2026 arasındaki ikinci yarı bedellerini kapsar.',
      'Döviz ve altın verileri aynı dönemlere hizalanır.',
      'EVDS verileri tek günlük önbellekle günde bir kez yenilenir.',
      'Çeyrek altın sonucu kuyumcu satış fiyatı değil, yaklaşık saf altın karşılığıdır.',
    ],
    publishedAt: '31 Ağustos 2026',
    publishedIso: '2026-08-31',
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
    standfirst: [
      'İlk günün akışı birliğe ve teslim yoğunluğuna göre değişebilir.',
      'Yine de belge düzeni, ulaşım planı ve gerçekçi beklentiler süreci belirgin biçimde kolaylaştırır.',
    ],
    quickSummary: [
      'Kimlik ve sevk belgesini kolay erişilen bir yerde taşı.',
      'Ulaşım planına gecikmelere karşı zaman payı ekle.',
      'İlk saatlerde kayıt ve yerleşim işlemlerinin uzayabileceğini hesaba kat.',
      'Birlik içindeki resmî yönlendirmeleri esas al.',
    ],
    publishedAt: '29 Ağustos 2026',
    publishedIso: '2026-08-29',
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
    standfirst: [
      'İyi hazırlanmış bir asker çantası, mümkün olan en fazla eşyayı değil doğru eşyayı taşır.',
      'Basit bir gruplama yöntemiyle ilk gün ihtiyaçlarını ayırabilir ve gereksiz yükü azaltabilirsin.',
    ],
    quickSummary: [
      'Belge ve değerli eşyaları ayrı, kolay erişilen bir bölümde tut.',
      'İlk gün kullanacaklarını küçük ve kompakt ürünlerden seç.',
      'Sonradan temin edilebilecek ürünleri çantaya doldurma.',
      'Birliğe göre değişebilen kuralları resmî bilgilendirmeden doğrula.',
    ],
    publishedAt: '27 Ağustos 2026',
    publishedIso: '2026-08-27',
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
