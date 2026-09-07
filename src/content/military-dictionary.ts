export const dictionaryCategories = [
  'Tümü',
  'Sözlük',
  'Rütbeler',
  'Birlik Yapısı',
  'Askerlik Süreci',
  'Kışla Hayatı',
  'Belgeler',
  'Askerlik Türleri',
] as const;

export type DictionaryCategory = (typeof dictionaryCategories)[number];
export type ContentCategory = Exclude<DictionaryCategory, 'Tümü'>;

export type GlossaryTerm = {
  term: string;
  definition: string;
  category: ContentCategory;
  usage?: 'Gündelik kullanım';
};

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Acemi',
    definition:
      'Temel askerlik eğitimine yeni başlayan er veya erbaş için kullanılan ifadedir. Acemilik dönemi, birliğe ve statüye göre planlanan temel eğitim sürecini anlatır.',
    category: 'Sözlük',
  },
  {
    term: 'Devre',
    definition:
      'Yakın tarihlerde silahaltına alınan ya da aynı dönemde askerlik yapan kişiler birbirine devre diyebilir. Resmî bir statü veya rütbe değildir.',
    category: 'Sözlük',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Tertip',
    definition:
      'Askerler arasında aynı celp veya hizmet dönemini anlatmak için kullanılabilir. Resmî işlemlerde güncel celp, sevk ve sınıflandırma bilgileri esas alınır.',
    category: 'Sözlük',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Şafak',
    definition:
      'Terhise kalan gün sayısını anlatan yaygın kışla ifadesidir. Resmî bir süre veya belge adı değildir.',
    category: 'Sözlük',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'İçtima',
    definition:
      'Personelin sayım, bilgilendirme veya görev düzeni için belirlenen yerde toplanmasıdır. Zamanı ve uygulanışı birlik düzenine göre değişir.',
    category: 'Sözlük',
  },
  {
    term: 'Tekmil',
    definition:
      'Askerî usule uygun biçimde kimlik, görev veya mevcut durum hakkında kısa bilgi sunma şeklidir.',
    category: 'Sözlük',
  },
  {
    term: 'Mıntıka',
    definition:
      'Kışlada belirli bir alanı veya o alanın temizlik ve düzen sorumluluğunu anlatmak için kullanılır.',
    category: 'Sözlük',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Nöbet',
    definition:
      'Belirlenen yer, süre ve talimatlar çerçevesinde yürütülen koruma, gözetleme veya hizmet görevidir.',
    category: 'Sözlük',
  },
  {
    term: 'Koğuş',
    definition:
      'Kışlada personelin toplu olarak kaldığı yatakhane bölümüdür. Düzeni birlik içi talimatlarla belirlenir.',
    category: 'Sözlük',
  },
  {
    term: 'Revir',
    definition:
      'Birlik içindeki ilk sağlık değerlendirmesi ve temel sağlık hizmetlerinin verildiği bölümdür.',
    category: 'Sözlük',
  },
  {
    term: 'Kantin',
    definition:
      'Kışla içinde izin verilen temel ihtiyaçların satıldığı bölümdür. Ürün ve çalışma saatleri birliğe göre değişebilir.',
    category: 'Sözlük',
  },
  {
    term: 'Karavana',
    definition:
      'Askerler arasında yemek veya yemek dağıtımı için kullanılan geleneksel bir ifadedir.',
    category: 'Sözlük',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Rütbe',
    definition:
      'Askerî personelin hiyerarşideki konumunu gösteren unvandır. Yetki ve sorumluluk yalnız rütbeye değil, görevlendirme ve kadroya da bağlıdır.',
    category: 'Rütbeler',
  },
  {
    term: 'Subay',
    definition:
      'Asteğmenden başlayıp general veya amiral rütbelerine uzanan askerî personel grubudur.',
    category: 'Rütbeler',
  },
  {
    term: 'Astsubay',
    definition:
      'Astsubay astçavuştan astsubay kıdemli başçavuşa uzanan rütbe grubundaki profesyonel askerî personeldir.',
    category: 'Rütbeler',
  },
  {
    term: 'General',
    definition:
      'Kara ve Hava Kuvvetlerinde tuğgeneral ile orgeneral arasındaki üst komuta rütbeleri için kullanılan genel addır.',
    category: 'Rütbeler',
  },
  {
    term: 'Amiral',
    definition:
      'Deniz Kuvvetlerinde tuğamiral ile oramiral arasındaki üst komuta rütbeleri için kullanılan genel addır.',
    category: 'Rütbeler',
  },
  {
    term: 'Erbaş',
    definition:
      'Er ile astsubay arasındaki onbaşı ve çavuş gibi rütbeleri kapsayan personel grubudur.',
    category: 'Rütbeler',
  },
  {
    term: 'Er',
    definition:
      'İhtiyaçları devlet tarafından karşılanan, rütbesiz asker kişidir. Er için ayrı bir rütbe işareti bulunmaz.',
    category: 'Rütbeler',
  },
  {
    term: 'Uzman erbaş',
    definition:
      'İlgili mevzuat kapsamında uzman onbaşı veya uzman çavuş olarak istihdam edilen profesyonel askerî personeldir.',
    category: 'Rütbeler',
  },
  {
    term: 'Sözleşmeli er',
    definition:
      'Belirli süreli sözleşmeyle erbaş veya er kadrolarında görev yapan profesyonel personeldir; yükümlü er statüsüyle aynı değildir.',
    category: 'Rütbeler',
  },
  {
    term: 'Birlik',
    definition:
      'Belirli bir komuta ve teşkilat yapısı içinde görev yapan askerî organizasyonun genel adıdır.',
    category: 'Birlik Yapısı',
  },
  {
    term: 'Garnizon',
    definition:
      'Bir veya birden fazla askerî birlik ve kurumun bulunduğu yerleşim bölgesini anlatır.',
    category: 'Birlik Yapısı',
  },
  {
    term: 'Karargâh',
    definition:
      'Bir komutanlığın yönetim, planlama ve koordinasyon faaliyetlerinin yürütüldüğü teşkilat veya merkezdir.',
    category: 'Birlik Yapısı',
  },
  {
    term: 'Tabur',
    definition:
      'Genellikle birden fazla bölükten oluşan askerî birlik seviyesidir. Gerçek teşkilat sınıf ve göreve göre farklılaşabilir.',
    category: 'Birlik Yapısı',
  },
  {
    term: 'Bölük',
    definition:
      'Genellikle birden fazla takımdan oluşan birlik seviyesidir. Personel ve alt birlik sayısı görev yapısına göre değişebilir.',
    category: 'Birlik Yapısı',
  },
  {
    term: 'Takım',
    definition:
      'Genellikle birden fazla mangayı bir araya getiren alt birlik seviyesidir.',
    category: 'Birlik Yapısı',
  },
  {
    term: 'Manga',
    definition:
      'Birlik yapısındaki küçük temel ekiplerden biridir. Mevcudu ve kuruluşu göreve göre değişebilir.',
    category: 'Birlik Yapısı',
  },
  {
    term: 'Sınıf',
    definition:
      'Piyade, muhabere veya ikmal gibi hizmet ve uzmanlık alanlarını ifade eder. Sınıflandırma sonucunda yükümlünün sınıfı belirlenebilir.',
    category: 'Birlik Yapısı',
  },
  {
    term: 'Branş',
    definition:
      'Bir sınıf veya görev alanı içindeki daha özel uzmanlık ya da görev ayrımını anlatır.',
    category: 'Birlik Yapısı',
  },
  {
    term: 'Dağıtım',
    definition:
      'Temel eğitimden sonra personelin görev yapacağı birlik veya yere ayrılmasını anlatan yaygın ifadedir.',
    category: 'Birlik Yapısı',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Askerlik çağı',
    definition:
      '7179 sayılı Askeralma Kanunu kapsamında askerlik yükümlülüğünün yaş bakımından değerlendirildiği dönemdir. Kişisel durum için resmî kayıt esas alınır.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Yoklama',
    definition:
      'Yükümlünün kimlik, öğrenim, meslek ve sağlık bilgilerinin değerlendirilerek askerliğe elverişlilik işlemlerinin yürütüldüğü aşamadır.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Sağlık muayenesi',
    definition:
      'Yoklama sürecinde askerliğe elverişlilik yönünden yapılan resmî sağlık değerlendirmesidir. Sonuç yetkili sağlık süreçlerine göre belirlenir.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Hizmet tercihi',
    definition:
      'Yoklama sonrasında e-Devlet Askerliğim hizmetinden veya askerlik şubesinden yapılabilen askerlik hizmet türü tercihidir. Nihai sınıflandırma TSK ihtiyacı gözetilerek yapılır.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Celp',
    definition:
      'Yükümlülerin belirli dönemlerde silahaltına alınmak üzere çağrılmasını ve ilgili dönemi ifade eder.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Sınıflandırma',
    definition:
      'Yükümlünün statü, sınıf, branş ve birlik bilgilerinin mevzuat ve Türk Silahlı Kuvvetlerinin ihtiyacı doğrultusunda belirlenmesi işlemidir.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Sevk',
    definition:
      'Sınıflandırılan yükümlünün belirlenen tarihte eğitim merkezi veya birliğine gönderilmesine ilişkin resmî süreçtir.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Katılış tarihi',
    definition:
      'Yükümlünün sevk edildiği birliğe teslim olması gereken tarihtir. Sevk tarihi ve yol süresiyle birlikte resmî belgeden kontrol edilmelidir.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Erteleme (tecil)',
    definition:
      'Kanunda belirtilen şartların bulunması hâlinde askerlik hizmetinin ileri bir tarihe bırakılmasıdır. Tecil sözcüğü gündelik kullanımda erteleme anlamında kullanılır.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Yoklama kaçağı',
    definition:
      'Yasal süresi içinde yoklamasını yaptırmayan yükümlünün resmî durumunu ifade eder.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Bakaya',
    definition:
      'Sevke tabi olduğu hâlde mazereti olmaksızın sevk işlemini yaptırmayan veya birliğine süresinde katılmayan yükümlünün durumudur.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Terhis',
    definition:
      'Askerlik hizmetinin mevzuata uygun biçimde tamamlanarak asker kişinin birlikle ilişiğinin kesilmesidir.',
    category: 'Askerlik Süreci',
  },
  {
    term: 'Acemi birliği',
    definition:
      'Temel askerlik eğitiminin yürütüldüğü birlik için kullanılan yaygın addır.',
    category: 'Kışla Hayatı',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Usta birliği',
    definition:
      'Temel eğitimden sonra asıl görevin sürdürüldüğü hizmet birliği için kullanılan yaygın addır.',
    category: 'Kışla Hayatı',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Eğitim birliği',
    definition:
      'Personelin temel veya sınıfa özgü eğitim aldığı birlik ya da kurumdur.',
    category: 'Kışla Hayatı',
  },
  {
    term: 'Hizmet birliği',
    definition:
      'Eğitim sonrasında görev ve askerlik hizmetinin sürdürüldüğü birliktir.',
    category: 'Kışla Hayatı',
  },
  {
    term: 'Çarşı izni',
    definition:
      'Birlik komutanlığınca uygun görülen zaman ve şartlarda kışla dışına çıkmaya imkân veren izindir. Her birlik ve dönem için aynı şekilde uygulanmayabilir.',
    category: 'Kışla Hayatı',
  },
  {
    term: 'Yat içtiması',
    definition:
      'Gece istirahati öncesinde personel mevcudu ve düzeni için yapılan toplanmadır.',
    category: 'Kışla Hayatı',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Sabah içtiması',
    definition:
      'Günün başlangıcında sayım, görev dağılımı veya bilgilendirme amacıyla yapılan toplanmadır.',
    category: 'Kışla Hayatı',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Dolap düzeni',
    definition:
      'Kişisel eşya ve kıyafetlerin birlikçe belirlenen biçimde yerleştirilmesini anlatır. Standartlar birliğe göre değişebilir.',
    category: 'Kışla Hayatı',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Kamuflaj',
    definition:
      'Gündelik dilde askerî görev kıyafeti için kullanılan addır; kıyafet türü görev ve kuvvete göre değişebilir.',
    category: 'Kışla Hayatı',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Bot',
    definition:
      'Askerî kıyafetin parçası olan koruyucu ayakkabıdır. Verilen malzemenin kullanımı birlik talimatlarına tabidir.',
    category: 'Kışla Hayatı',
  },
  {
    term: 'Sevk belgesi',
    definition:
      'Kimlik, statü, tertip edilen birlik, katılış tarihi ile yol ve iaşe bilgilerini içeren resmî belgedir. Birliğe katılışta barkodlu belgenin çıktısı gerekir.',
    category: 'Belgeler',
  },
  {
    term: 'Sülüs',
    definition:
      'Sevk belgesi için halk arasında kullanılan eski ve yaygın addır. Güncel resmî hizmetlerde “sevk belgesi” ifadesi kullanılır.',
    category: 'Belgeler',
    usage: 'Gündelik kullanım',
  },
  {
    term: 'Askerlik durum belgesi',
    definition:
      'Kişinin askerlik yükümlülüğü bakımından güncel durumunu gösteren barkodlu resmî belgedir.',
    category: 'Belgeler',
  },
  {
    term: 'Terhis belgesi',
    definition: 'Askerlik hizmetinin tamamlandığını gösteren resmî belgedir.',
    category: 'Belgeler',
  },
  {
    term: 'Yol ve iaşe bedeli',
    definition:
      'Sevk yolculuğu için mesafe ve resmî esaslara göre belirlenen yol ücreti ile günlük iaşe karşılığıdır; sevk belgesinde ilgili bilgiler yer alır.',
    category: 'Belgeler',
  },
  {
    term: 'Er statüsünde temel askerlik',
    definition:
      '7179 sayılı Kanun kapsamında erbaş ve erlerin temel hizmet süresi altı aydır. Kişisel statü sınıflandırma sonucuyla kesinleşir.',
    category: 'Askerlik Türleri',
  },
  {
    term: 'Bedelli askerlik',
    definition:
      'Kanunda belirlenen bedelin ödenmesi ve öngörülen temel eğitimin tamamlanmasıyla yerine getirilen askerlik hizmetidir.',
    category: 'Askerlik Türleri',
  },
  {
    term: 'Dövizle askerlik',
    definition:
      'Yurt dışında bulunan ve kanundaki şartları sağlayan yükümlüler için öngörülen dövizle askerlik uygulamasıdır.',
    category: 'Askerlik Türleri',
  },
  {
    term: 'Yedek subay',
    definition:
      'Sınıflandırma sonucu yedek subay statüsüne ayrılan yükümlünün askerlik hizmeti statüsüdür. Seçim yalnız mezuniyet tercihine dayanmaz; ihtiyaç ve mevzuat birlikte uygulanır.',
    category: 'Askerlik Türleri',
  },
  {
    term: 'Yedek astsubay',
    definition:
      'Sınıflandırma sonucu yedek astsubay statüsüne ayrılan yükümlünün askerlik hizmeti statüsüdür.',
    category: 'Askerlik Türleri',
  },
  {
    term: 'Sözleşmeli askerlik',
    definition:
      'Profesyonel personelin ilgili sözleşme ve personel mevzuatı kapsamında görev yapmasıdır; zorunlu askerlik hizmet türü değildir.',
    category: 'Askerlik Türleri',
  },
  {
    term: 'İkinci altı ay hizmet',
    definition:
      'Erbaş ve erlerin ilk altı aylık hizmetten sonra istekli olmaları ve uygun görülmeleri hâlinde ücretli olarak devam edebildiği dönemdir.',
    category: 'Askerlik Türleri',
  },
];

export type RankGroup =
  | 'General / Amiral'
  | 'Subay'
  | 'Astsubay'
  | 'Erbaş / Er';

export type RankItem = {
  id: string;
  name: string;
  group: RankGroup;
  position: string;
  description: string;
  image: string | null;
};

export type ForceRanks = {
  id: 'kara' | 'hava' | 'deniz';
  label: string;
  ranks: RankItem[];
};

const rankDescriptions: Record<string, string> = {
  Orgeneral: 'Kara ve Hava Kuvvetlerindeki en yüksek faal general rütbesidir.',
  Oramiral: 'Deniz Kuvvetlerindeki en yüksek faal amiral rütbesidir.',
  Korgeneral: 'Orgeneral ile tümgeneral arasında yer alan general rütbesidir.',
  Koramiral: 'Oramiral ile tümamiral arasında yer alan amiral rütbesidir.',
  Tümgeneral: 'Korgeneral ile tuğgeneral arasında yer alan general rütbesidir.',
  Tümamiral: 'Koramiral ile tuğamiral arasında yer alan amiral rütbesidir.',
  Tuğgeneral: 'Kara ve Hava Kuvvetlerinde general sınıfının ilk rütbesidir.',
  Tuğamiral: 'Deniz Kuvvetlerinde amiral sınıfının ilk rütbesidir.',
  Albay: 'Üstsubay grubunun en yüksek rütbesidir.',
  Yarbay: 'Albay ile binbaşı arasında yer alan üstsubay rütbesidir.',
  Binbaşı: 'Yarbay ile yüzbaşı arasında yer alan üstsubay rütbesidir.',
  Yüzbaşı: 'Binbaşı ile üsteğmen arasında yer alan subay rütbesidir.',
  Üsteğmen: 'Yüzbaşı ile teğmen arasında yer alan subay rütbesidir.',
  Teğmen: 'Üsteğmenin altında yer alan subay rütbesidir.',
  Asteğmen:
    'Subay sınıfının başlangıç rütbesidir; yedek subaylar da bu rütbeyle göreve başlayabilir.',
  'Astsubay Kıdemli Başçavuş':
    'Astsubay rütbe sıralamasının en üst basamağıdır.',
  'Astsubay Başçavuş':
    'Kıdemli başçavuş ile kıdemli üstçavuş arasında yer alan astsubay rütbesidir.',
  'Astsubay Kıdemli Üstçavuş':
    'Başçavuş ile üstçavuş arasında yer alan astsubay rütbesidir.',
  'Astsubay Üstçavuş':
    'Kıdemli üstçavuş ile kıdemli çavuş arasında yer alan astsubay rütbesidir.',
  'Astsubay Kıdemli Çavuş':
    'Üstçavuş ile astsubay çavuş arasında yer alan astsubay rütbesidir.',
  'Astsubay Çavuş':
    'Kıdemli çavuş ile astçavuş arasında yer alan astsubay rütbesidir.',
  'Astsubay Astçavuş': 'Astsubay sınıfının başlangıç rütbesidir.',
  Çavuş: 'Erbaş grubunda onbaşının üstünde yer alan rütbedir.',
  Onbaşı: 'Erbaş grubunun başlangıç rütbesidir.',
  Er: 'Rütbesiz asker kişidir; ayrı bir rütbe işareti bulunmaz.',
};

const groupForRank = (name: string, index: number): RankGroup => {
  if (index < 4) return 'General / Amiral';
  if (index < 11) return 'Subay';
  if (index < 18) return 'Astsubay';
  return 'Erbaş / Er';
};

const createForce = (
  id: ForceRanks['id'],
  label: string,
  names: string[],
): ForceRanks => ({
  id,
  label,
  ranks: names.map((name, index) => {
    const imageId = `${id}-${name
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replaceAll('ı', 'i')
      .replaceAll('ş', 's')
      .replaceAll('ç', 'c')
      .replaceAll('ğ', 'g')
      .replaceAll('ü', 'u')
      .replaceAll('ö', 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`;

    return {
      id: imageId,
      name,
      group: groupForRank(name, index),
      position: `${groupForRank(name, index)} · ${index + 1}. sıra`,
      description: rankDescriptions[name],
      image: name === 'Er' ? null : `/asker-sozlugu/ranks/${imageId}.png`,
    };
  }),
});

const sharedLowerRanks = [
  'Astsubay Kıdemli Başçavuş',
  'Astsubay Başçavuş',
  'Astsubay Kıdemli Üstçavuş',
  'Astsubay Üstçavuş',
  'Astsubay Kıdemli Çavuş',
  'Astsubay Çavuş',
  'Astsubay Astçavuş',
  'Çavuş',
  'Onbaşı',
  'Er',
];

const landAndAirOfficers = [
  'Orgeneral',
  'Korgeneral',
  'Tümgeneral',
  'Tuğgeneral',
  'Albay',
  'Yarbay',
  'Binbaşı',
  'Yüzbaşı',
  'Üsteğmen',
  'Teğmen',
  'Asteğmen',
];

export const forceRanks: ForceRanks[] = [
  createForce('kara', 'Kara Kuvvetleri', [
    ...landAndAirOfficers,
    ...sharedLowerRanks,
  ]),
  createForce('hava', 'Hava Kuvvetleri', [
    ...landAndAirOfficers,
    ...sharedLowerRanks,
  ]),
  createForce('deniz', 'Deniz Kuvvetleri', [
    'Oramiral',
    'Koramiral',
    'Tümamiral',
    'Tuğamiral',
    'Albay',
    'Yarbay',
    'Binbaşı',
    'Yüzbaşı',
    'Üsteğmen',
    'Teğmen',
    'Asteğmen',
    ...sharedLowerRanks,
  ]),
];

export const unitHierarchy = [
  {
    name: 'Tugay',
    note: 'Birden fazla taburu bir araya getirebilen üst birlik.',
  },
  { name: 'Tabur', note: 'Genellikle birden fazla bölükten oluşur.' },
  { name: 'Bölük', note: 'Genellikle birden fazla takımdan oluşur.' },
  { name: 'Takım', note: 'Genellikle birden fazla mangayı bir araya getirir.' },
  { name: 'Manga', note: 'Küçük temel ekip seviyelerinden biridir.' },
];

export const serviceTimeline = [
  {
    name: 'Yoklama',
    note: 'Kimlik, öğrenim, meslek ve sağlık bilgileri tamamlanır.',
  },
  {
    name: 'Hizmet ve celp tercihi',
    note: 'Tercihler Askerliğim hizmeti veya şube üzerinden bildirilir.',
  },
  {
    name: 'Sınıflandırma',
    note: 'Statü, sınıf, branş ve birlik sonucu açıklanır.',
  },
  {
    name: 'Sevk belgesi',
    note: 'Barkodlu belge resmî kanaldan alınır ve çıktısı hazırlanır.',
  },
  {
    name: 'Birliğe katılış',
    note: 'Belgedeki katılış tarihi ve yol süresi esas alınır.',
  },
  { name: 'Hizmet ve terhis', note: 'Planlanan askerlik hizmeti tamamlanır.' },
];

export const barracksGuide = [
  {
    name: 'Günlük düzen',
    note: 'İçtima, eğitim, görev ve istirahat saatleri birlik planına göre yürür.',
  },
  {
    name: 'Eşya düzeni',
    note: 'Dolap, yatak ve kişisel malzeme için birliğin gösterdiği standart izlenir.',
  },
  {
    name: 'Sağlık',
    note: 'Rahatsızlık durumunda amire bilgi verilir ve revir süreci takip edilir.',
  },
  {
    name: 'İzinler',
    note: 'Çarşı ve diğer izinler otomatik hak gibi düşünülmemeli; birlik kararı esas alınmalıdır.',
  },
];

export const documentLinks = [
  {
    name: 'Sevk belgesi nedir, nasıl alınır?',
    note: 'Belgedeki alanları ve e-Devlet sürecini öğren.',
    href: '/blog/sevk-belgesi-nedir-nasil-alinir',
  },
  {
    name: '2026 celp ve sevk tarihleri',
    note: 'Sınıflandırma dönemlerini ve güncel takvimi incele.',
    href: '/blog/2026-askerlik-celp-sevk-tarihleri',
  },
  {
    name: 'Askere giderken çanta rehberi',
    note: 'Götürülecekleri sade ve pratik biçimde planla.',
    href: '/blog/askere-giderken-canta-nasil-sadelesir',
  },
];

export const serviceTypes = [
  { name: 'Er statüsünde', duration: '6 ay', note: 'Temel askerlik hizmeti.' },
  {
    name: 'Yedek subay',
    duration: '12 ay',
    note: 'Sınıflandırmayla belirlenen statü.',
  },
  {
    name: 'Yedek astsubay',
    duration: '12 ay',
    note: 'Sınıflandırmayla belirlenen statü.',
  },
  {
    name: 'Bedelli',
    duration: '1 ay temel eğitim',
    note: 'Kanuni bedel ve başvuru şartlarına tabi.',
  },
  {
    name: 'Dövizle',
    duration: 'Şartlara bağlı',
    note: 'Yurt dışındaki yükümlüler için özel uygulama.',
  },
];

export const dictionarySources = [
  {
    label: 'MSB Askeralma — askerlik başvurusu ve süreç adımları',
    href: 'https://www.msb.gov.tr/Askeralma/icerik/askerlik-basvurusu-nasil-yapilir',
  },
  {
    label: 'MSB Askeralma — sevk belgesi',
    href: 'https://www.msb.gov.tr/Askeralma/icerik/sevk-belgesi-nasil-alinir',
  },
  {
    label: 'e-Devlet — Askerliğim hizmeti',
    href: 'https://www.turkiye.gov.tr/mill-savunma-askerligim',
  },
  {
    label: "Vikipedi — Türkiye'nin askerî rütbeleri",
    href: "https://tr.wikipedia.org/wiki/T%C3%BCrkiye'nin_asker%C3%AE_r%C3%BCtbeleri",
  },
];

export const termId = (term: string) =>
  term
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('ı', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ç', 'c')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ö', 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
