export type LegalLink = {
  label: string;
  href: string;
  description?: string;
};

export type LegalBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'links'; items: LegalLink[] }
  | {
      type: 'callout';
      title: string;
      content: string;
      link?: LegalLink;
      tone?: 'default' | 'important';
    }
  | { type: 'contact'; includeOperators?: boolean; includeAddress?: boolean };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  updatedAt: string;
  intro: string[];
  sections: LegalSection[];
};

const updatedAt = '1 Eylül 2026';

export const privacyDocument: LegalDocument = {
  slug: 'privacy',
  title: 'Gizlilik Politikası',
  shortTitle: 'Gizlilik Politikası',
  description:
    "Devrem'in mobil uygulama, internet sitesi ve bağlantılı hizmetlerde kişisel verileri nasıl işlediğini öğrenin.",
  updatedAt,
  intro: [
    'Devrem, askerlik sürecindeki kullanıcıların aynı celp dönemindeki, aynı askerlik şehrindeki veya aynı birlikteki diğer kullanıcılarla iletişim kurmasına ve askerlik sürecine hazırlanmasına yardımcı olan bağımsız bir platformdur.',
    'Devrem; Onurcan Özovalı, Muhammet Şen ve Mertcan Uğurluel tarafından işletilmektedir.',
    'Bu Gizlilik Politikası, Devrem mobil uygulaması, devrem.co internet sitesi ve Devrem tarafından sunulan bağlantılı hizmetler kapsamında kişisel verilerin nasıl işlendiğini açıklamaktadır.',
  ],
  sections: [
    {
      id: 'isledigimiz-bilgiler',
      title: '1. İşlediğimiz bilgiler',
      blocks: [
        {
          type: 'paragraph',
          content:
            "Devrem'in kullanılan özelliğine bağlı olarak aşağıdaki bilgiler işlenebilir:",
        },
        {
          type: 'callout',
          title: 'Hesap ve kimlik bilgileri',
          content:
            'Ad ve soyad, telefon numarası, kullanıcı hesabına ait teknik kimlikler ile doğum yılı veya yaş uygunluğu için gerekli bilgiler.',
        },
        {
          type: 'callout',
          title: 'Profil ve askerlik bilgileri',
          content:
            'Kullanıcının sağladığı ikamet veya çıkış şehri, celp ya da sınıflandırma dönemi, askerlik şehri, askerlik birliği, askerlik türü veya statüsü, kuvvet bilgisi ve profil fotoğrafı.',
        },
        {
          type: 'callout',
          title: 'Kullanıcı tarafından oluşturulan içerikler',
          content:
            'Grup mesajları, doğrudan mesajlar, gönderilen fotoğraflar, gönderilen dosya veya belgeler ve profil içerikleri.',
        },
        {
          type: 'callout',
          title: 'Uygulama kullanım bilgileri',
          content:
            'Grup üyelikleri, mesaj okunma durumları, hazırlık listesi ilerlemeleri, engelleme ve raporlama işlemleri ile bildirim tercihleri.',
        },
        {
          type: 'callout',
          title: 'Teknik bilgiler',
          content:
            "Hizmetin çalıştırılması ve güvenliğinin sağlanması için cihaz veya uygulama kurulum kimlikleri, push notification token'ları, hata ve güvenlik kayıtları, uygulama sürümü ve benzeri sınırlı teknik bilgiler.",
        },
        {
          type: 'paragraph',
          content:
            'Devrem, GPS üzerinden hassas konum bilgisi toplamayı amaçlamaz. Kullanıcıların profilinde görünen şehir bilgileri kullanıcı tarafından girilen bilgilerdir.',
        },
      ],
    },
    {
      id: 'verileri-neden-kullaniyoruz',
      title: '2. Verileri neden kullanıyoruz?',
      blocks: [
        {
          type: 'paragraph',
          content: 'Kişisel veriler başlıca şu amaçlarla işlenir:',
        },
        {
          type: 'list',
          items: [
            'Kullanıcı hesabının oluşturulması ve yönetilmesi',
            'Kullanıcının uygun Devre grubuna yönlendirilmesi',
            'Aynı dönem veya birlikteki kullanıcıların bulunabilmesi',
            'Grup ve doğrudan mesajlaşma özelliklerinin çalıştırılması',
            'Bildirimlerin gönderilmesi ve kullanıcı tercihlerinin saklanması',
            'Kötüye kullanım, spam ve güvenlik olaylarının önlenmesi',
            'Kullanıcı raporlarının incelenmesi',
            'Hizmetin işletilmesi ve teknik sorunların giderilmesi',
            'Yasal yükümlülüklerin yerine getirilmesi',
          ],
        },
      ],
    },
    {
      id: 'diger-kullanicilarla-paylasilan-bilgiler',
      title: '3. Diğer kullanıcılarla paylaşılan bilgiler',
      blocks: [
        {
          type: 'paragraph',
          content:
            "Devrem sosyal ve topluluk özellikleri içerir. Bir kullanıcının profilindeki bazı bilgiler, Devrem'in eşleştirme ve topluluk özelliklerinin çalışması için ilgili diğer kullanıcılara gösterilebilir.",
        },
        {
          type: 'list',
          items: [
            'Ad ve soyad',
            'Profil fotoğrafı',
            'Celp dönemi',
            'Askerlik şehri ve askerlik birliği',
            'Askerlik türü veya statüsü',
            'Kuvvet bilgisi',
            'Kullanıcının paylaşmayı tercih ettiği diğer profil bilgileri',
          ],
        },
        {
          type: 'paragraph',
          content:
            'Telefon numarası, kimlik doğrulama amacı dışında diğer kullanıcılara açık şekilde gösterilmez. Özel mesajların içeriği yalnızca ilgili konuşmanın katılımcıları tarafından görüntülenmek üzere tasarlanmıştır.',
        },
      ],
    },
    {
      id: 'hizmet-saglayicilar',
      title: '4. Hizmet sağlayıcılar',
      blocks: [
        {
          type: 'paragraph',
          content:
            "Devrem'in teknik altyapısının sağlanması amacıyla üçüncü taraf hizmet sağlayıcılardan yararlanılabilir.",
        },
        {
          type: 'list',
          items: [
            'Google Firebase',
            'Firebase Authentication',
            'Cloud Firestore',
            'Firebase Storage',
            'Cloud Functions',
            'Firebase Cloud Messaging',
            'Expo / EAS',
          ],
        },
        {
          type: 'paragraph',
          content:
            'Bu sağlayıcılar verilere yalnızca hizmetin sunulması için gerekli olduğu ölçüde erişebilir ve kendi sözleşme ve güvenlik yükümlülüklerine tabidir.',
        },
      ],
    },
    {
      id: 'yurt-disi-altyapi',
      title: '5. Yurt dışı altyapı',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kullanılan bulut ve altyapı hizmetlerinin teknik yapısına bağlı olarak bazı veriler Türkiye dışında bulunan sistemlerde işlenebilir.',
        },
        {
          type: 'paragraph',
          content:
            'Yurt dışına kişisel veri aktarımının söz konusu olduğu durumlarda uygulanabilir kişisel veri koruma mevzuatı ve gerekli aktarım mekanizmaları dikkate alınır.',
        },
      ],
    },
    {
      id: 'verilerin-guvenligi',
      title: '6. Verilerin güvenliği',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Devrem, kişisel verilere yetkisiz erişimi, değiştirmeyi, açıklamayı veya kaybı önlemek amacıyla makul teknik ve idari güvenlik önlemleri uygular.',
        },
        {
          type: 'paragraph',
          content:
            'Bunlar arasında erişim kontrolleri, kimlik doğrulama, yetkilendirme kuralları ve şifreli ağ iletişimi bulunabilir. Bununla birlikte internet üzerinden gerçekleştirilen hiçbir veri aktarımı veya depolama yöntemi mutlak güvenlik garantisi sağlayamaz.',
        },
      ],
    },
    {
      id: 'saklama-ve-silme',
      title: '7. Saklama ve silme',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kişisel veriler, ilgili hizmetin sağlanması için gerekli olduğu süre boyunca veya hukuki ve güvenlik gerekliliklerinin zorunlu kıldığı ölçüde saklanır.',
        },
        {
          type: 'paragraph',
          content:
            'Hesap silme talebi doğrulanıp işleme alındığında, hesapla ilişkilendirilen kişisel veriler uygulanabilir teknik ve hukuki gereklilikler doğrultusunda silinir veya anonimleştirilir ve aktif hesap erişimi kaldırılır.',
        },
        {
          type: 'paragraph',
          content:
            'Güvenlik, dolandırıcılığın önlenmesi, kötüye kullanım incelemeleri, hukuki yükümlülükler veya uyuşmazlıkların çözümü için tutulması zorunlu olan sınırlı kayıtlar gerekli süre boyunca saklanabilir. Bu kayıtların tutulması, kullanıcı hesabının aktif tutulduğu anlamına gelmez.',
        },
      ],
    },
    {
      id: 'hesabin-ve-verilerin-silinmesi',
      title: '8. Hesabın ve verilerin silinmesi',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kullanıcılar Devrem uygulamasındaki hesap ayarlarında bulunan hesap silme seçeneğinden silme işlemini başlatabilir. Uygulamaya erişimi olmayan kullanıcılar hesap silme sayfasındaki e-posta yöntemini kullanabilir.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'Hesap ve veri silme seçeneklerini görüntüle',
              href: '/account-deletion',
            },
          ],
        },
      ],
    },
    {
      id: 'kullanicinin-haklari',
      title: '9. Kullanıcının hakları',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kullanıcılar, uygulanabilir mevzuat kapsamında kişisel verileriyle ilgili bilgi talep etme, düzeltme, silme ve diğer kanuni haklarını kullanabilir.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'KVKK Aydınlatma Metni',
              href: '/kvkk',
              description: 'KVKK kapsamındaki ayrıntılı bilgileri inceleyin.',
            },
            {
              label: 'iletisim@devrem.co',
              href: 'mailto:iletisim@devrem.co?subject=Kişisel%20Veri%20Başvurusu',
              description: 'Kişisel verilerinizle ilgili başvurunuzu iletin.',
            },
          ],
        },
      ],
    },
    {
      id: 'cocuklarin-gizliligi',
      title: '10. Çocukların gizliliği',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Devrem askerlik çağındaki kullanıcılara yönelik bir hizmettir.',
        },
      ],
    },
    {
      id: 'politika-degisiklikleri',
      title: '11. Politika değişiklikleri',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Bu politika hizmetlerdeki, mevzuattaki veya veri işleme uygulamalarındaki değişikliklere bağlı olarak güncellenebilir. Önemli değişikliklerde güncelleme tarihi değiştirilir ve gerektiğinde kullanıcılar bilgilendirilir.',
        },
      ],
    },
    {
      id: 'iletisim',
      title: '12. İletişim',
      blocks: [
        { type: 'contact', includeOperators: true, includeAddress: true },
      ],
    },
  ],
};

export const kvkkDocument: LegalDocument = {
  slug: 'kvkk',
  title: 'KVKK Aydınlatma Metni',
  shortTitle: 'KVKK Aydınlatma Metni',
  description:
    "Devrem'in 6698 sayılı Kanun kapsamında kişisel verileri işleme amaçları, yöntemleri ve ilgili kişi hakları.",
  updatedAt,
  intro: [
    "Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi kapsamında Devrem hizmetlerini kullanan kişileri kişisel verilerinin işlenmesi hakkında bilgilendirmek amacıyla hazırlanmıştır.",
  ],
  sections: [
    {
      id: 'veri-sorumlusu',
      title: '1. Veri sorumlusu',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Devrem platformu Onurcan Özovalı, Muhammet Şen ve Mertcan Uğurluel tarafından birlikte işletilmektedir.',
        },
        { type: 'contact', includeAddress: true },
      ],
    },
    {
      id: 'islenen-kisisel-veri-kategorileri',
      title: '2. İşlenen kişisel veri kategorileri',
      blocks: [
        {
          type: 'paragraph',
          content:
            "Devrem'in kullanılan özelliklerine bağlı olarak aşağıdaki kişisel veri kategorileri işlenebilir:",
        },
        {
          type: 'list',
          items: [
            'Kimlik bilgileri: ad, soyad, doğum yılı',
            'İletişim bilgileri: telefon numarası',
            'Kullanıcı işlem bilgileri ve profil bilgileri',
            'Kullanıcının girdiği şehir bilgileri',
            'Celp dönemi ve askerlik sürecine ilişkin kullanıcı tarafından sağlanan bilgiler',
            'Profil fotoğrafı',
            'Mesaj, fotoğraf ve dosya gibi kullanıcı içerikleri',
            "Bildirim tercihleri ve cihaz token'ları",
            'Grup ve konuşma üyelik bilgileri',
            'Engelleme ve raporlama kayıtları',
            'Hizmet güvenliği ve hata giderimi için gerekli teknik kayıtlar',
          ],
        },
      ],
    },
    {
      id: 'kisisel-verilerin-islenme-amaclari',
      title: '3. Kişisel verilerin işlenme amaçları',
      blocks: [
        {
          type: 'list',
          items: [
            'Kullanıcı hesabının oluşturulması ve yönetilmesi',
            'Kimlik doğrulama',
            'Devre eşleştirme ve grup özelliklerinin çalıştırılması',
            'Kullanıcıların birbirleriyle iletişim kurmasının sağlanması',
            'Profil ve hazırlık özelliklerinin sunulması',
            'Bildirim gönderilmesi',
            "Güvenliğin sağlanması, kötüye kullanım ve spam'in önlenmesi",
            'Rapor ve şikâyetlerin değerlendirilmesi',
            'Teknik sorunların giderilmesi',
            'Hukuki yükümlülüklerin yerine getirilmesi',
          ],
        },
      ],
    },
    {
      id: 'toplama-yontemi',
      title: '4. Toplama yöntemi',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kişisel veriler aşağıdaki kanallar aracılığıyla tamamen veya kısmen otomatik yollarla elde edilebilir:',
        },
        {
          type: 'list',
          items: [
            'Kullanıcının mobil uygulamaya girdiği bilgiler',
            'Hesap ve profil oluşturma işlemleri',
            'Mesajlaşma ve topluluk özellikleri',
            'Kullanıcının verdiği uygulama izinleri',
            'Uygulamanın çalışması sırasında oluşan teknik kayıtlar',
          ],
        },
      ],
    },
    {
      id: 'hukuki-sebepler',
      title: '5. Hukuki sebepler',
      blocks: [
        {
          type: 'paragraph',
          content: 'Kişisel veriler, işleme faaliyetine göre;',
        },
        {
          type: 'list',
          items: [
            'Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması',
            'Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi',
            'Bir hakkın tesisi, kullanılması veya korunması',
            'İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati',
          ],
        },
        {
          type: 'paragraph',
          content:
            'gibi uygulanabilir işleme şartlarına dayanılarak işlenebilir. Bir veri işleme faaliyeti açık rıza gerektiriyorsa, açık rıza ayrıca ve aydınlatma metninden bağımsız şekilde alınmalıdır.',
        },
      ],
    },
    {
      id: 'kisisel-verilerin-aktarilmasi',
      title: '6. Kişisel verilerin aktarılması',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kişisel veriler, hizmetlerin sunulması için gerekli olduğu ölçüde aşağıdaki alıcılara aktarılabilir:',
        },
        {
          type: 'list',
          items: [
            'Bulut altyapısı sağlayıcıları',
            'Kimlik doğrulama hizmet sağlayıcıları',
            'Bildirim ve depolama hizmet sağlayıcıları',
            'Hukuken yetkili kamu kurum ve kuruluşları',
          ],
        },
        {
          type: 'paragraph',
          content:
            'Aktarım yalnızca ilgili amaç için gerekli kapsamla sınırlı tutulur.',
        },
      ],
    },
    {
      id: 'yurt-disina-aktarim',
      title: '7. Yurt dışına aktarım',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Firebase, Google ve diğer teknik altyapı sağlayıcılarının sistemlerinin konumuna bağlı olarak yurt dışına veri aktarımı söz konusu olabilir.',
        },
        {
          type: 'paragraph',
          content:
            'Yurt dışına aktarım söz konusu olduğunda uygulanabilir veri koruma mevzuatı, üretimde kullanılan gerçek altyapı ve gerekli aktarım şartları birlikte değerlendirilir.',
        },
      ],
    },
    {
      id: 'ilgili-kisinin-haklari',
      title: '8. İlgili kişinin hakları',
      blocks: [
        {
          type: 'paragraph',
          content:
            "Kullanıcılar 6698 sayılı Kanun'un 11. maddesi kapsamındaki hakları doğrultusunda kişisel verileri hakkında bilgi talep edebilir ve uygulanabilir durumlarda düzeltme, silme veya diğer haklarını kullanabilir.",
        },
        {
          type: 'paragraph',
          content:
            'Kimlik doğrulaması, yetkisiz kişilerin başka bir kullanıcı adına işlem yapmasını engellemek amacıyla talep edilebilir.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'KVKK başvurusu gönder',
              href: 'mailto:iletisim@devrem.co?subject=KVKK%20Başvurusu',
            },
          ],
        },
      ],
    },
    {
      id: 'aydinlatma-ve-acik-riza-ayrimi',
      title: '9. Aydınlatma ve açık rıza ayrımı',
      blocks: [
        {
          type: 'callout',
          title: 'Bu metin bir aydınlatma metnidir',
          content:
            'Bu metnin kullanıcı tarafından okunması veya görüntülenmesi, başlı başına açık rıza anlamına gelmez. Açık rıza gerektiren bir veri işleme faaliyeti bulunması halinde kullanıcıya ayrı bir açık rıza seçeneği sunulur.',
          tone: 'important',
        },
      ],
    },
  ],
};

export const termsDocument: LegalDocument = {
  slug: 'terms',
  title: 'Devrem Kullanım Koşulları',
  shortTitle: 'Kullanım Koşulları',
  description:
    'Devrem mobil uygulamasını, devrem.co internet sitesini ve bağlantılı hizmetleri kullanırken geçerli koşullar.',
  updatedAt,
  intro: [
    'Bu Kullanım Koşulları, Devrem mobil uygulamasını, devrem.co internet sitesini ve bağlantılı Devrem hizmetlerini kullanan kişiler için geçerlidir.',
    "Devrem'i kullanarak bu koşullara uygun davranmayı kabul etmiş olursunuz.",
  ],
  sections: [
    {
      id: 'devrem-hakkinda',
      title: '1. Devrem hakkında',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Devrem; askerlik sürecindeki kullanıcıların bilgi edinmesine, hazırlık yapmasına ve benzer celp dönemi veya birlik bilgilerine sahip kullanıcılarla iletişim kurmasına yardımcı olan bağımsız bir platformdur.',
        },
        {
          type: 'paragraph',
          content:
            'Devrem; Millî Savunma Bakanlığı, Türk Silahlı Kuvvetleri, askerlik şubeleri veya başka bir kamu kurumunun resmî hizmeti değildir.',
        },
        {
          type: 'callout',
          title: 'Resmî kaynaklar esastır',
          content:
            'Resmî askerlik işlemleri ve kişisel askerlik bilgileri için her zaman MSB ve e-Devlet kayıtları esas alınmalıdır.',
          tone: 'important',
        },
      ],
    },
    {
      id: 'bilgilendirici-icerikler',
      title: '2. Bilgilendirici içerikler',
      blocks: [
        {
          type: 'paragraph',
          content:
            "Devrem'de yayımlanan rehberler, tablolar, haberler ve diğer içerikler bilgilendirme amacı taşır. Mevzuat, celp dönemleri, ücretler veya askerlik uygulamaları değişebilir.",
        },
        {
          type: 'paragraph',
          content:
            'Bu nedenle kullanıcıların işlem yapmadan önce bilgileri resmî MSB ve e-Devlet kaynaklarından kontrol etmesi gerekir.',
        },
      ],
    },
    {
      id: 'kullanici-hesabi',
      title: '3. Kullanıcı hesabı',
      blocks: [
        {
          type: 'list',
          items: [
            'Doğru ve güncel bilgi sağlamak',
            'Hesabının güvenliğini korumak',
            'Hesabı üzerinden gerçekleştirilen faaliyetlerden sorumlu olmak',
          ],
        },
        {
          type: 'paragraph',
          content:
            'Başkasının kimliğine bürünmek, sahte hesap oluşturmak veya yanıltıcı askerlik bilgileri kullanmak yasaktır.',
        },
      ],
    },
    {
      id: 'kullanici-icerikleri',
      title: '4. Kullanıcı içerikleri',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kullanıcılar Devrem üzerinden mesaj, profil bilgisi, fotoğraf ve diğer içerikleri paylaşabilir. Kullanıcı, paylaştığı içerikten kendisi sorumludur.',
        },
        {
          type: 'paragraph',
          content: 'Şu içerikler yasaktır:',
        },
        {
          type: 'list',
          items: [
            'Tehdit, taciz, zorbalık ve nefret söylemi',
            'Müstehcen veya hukuka aykırı içerik',
            'Dolandırıcılık ve spam',
            'Başkasına ait kişisel bilgilerin izinsiz paylaşılması',
            'Telif veya diğer hakları ihlal eden içerik',
            'Suç teşkil eden içerik veya davranışlar',
          ],
        },
        {
          type: 'links',
          items: [
            {
              label: 'Devrem Topluluk Kuralları',
              href: '/community-guidelines',
            },
          ],
        },
      ],
    },
    {
      id: 'moderasyon',
      title: '5. Moderasyon',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Devrem, kullanıcı ve platform güvenliğini korumak amacıyla;',
        },
        {
          type: 'list',
          items: [
            'Kullanıcı içeriklerini inceleyebilir',
            'Raporlanan içeriği kaldırabilir',
            'Özelliklere erişimi sınırlayabilir',
            'Hesabı geçici olarak askıya alabilir',
            'Ciddi veya tekrarlanan ihlallerde hesabı kapatabilir',
          ],
        },
      ],
    },
    {
      id: 'engelleme-ve-raporlama',
      title: '6. Engelleme ve raporlama',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kullanıcılar uygunsuz davranan kullanıcıları engelleyebilir ve uygun yüzeylerde içerik veya kullanıcı raporlayabilir.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'Acil veya ciddi güvenlik konusunu bildir',
              href: 'mailto:iletisim@devrem.co?subject=Güvenlik%20Bildirimi',
            },
          ],
        },
      ],
    },
    {
      id: 'hizmetin-kullanilabilirligi',
      title: '7. Hizmetin kullanılabilirliği',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Devrem hizmetlerinin kesintisiz veya hatasız olacağı garanti edilmez. Bakım, güvenlik, altyapı değişikliği veya teknik sorunlar nedeniyle hizmet geçici olarak kullanılamayabilir.',
        },
      ],
    },
    {
      id: 'hesabin-kapatilmasi',
      title: '8. Hesabın kapatılması',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kullanıcı hesabını uygulamadaki hesap ayarlarında bulunan hesap silme seçeneğinden silebilir. Uygulamaya erişimi olmayan kullanıcılar herkese açık hesap silme sayfasını kullanabilir.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'Devrem hesabını ve verilerini sil',
              href: '/account-deletion',
            },
          ],
        },
      ],
    },
    {
      id: 'fikri-mulkiyet',
      title: '9. Fikri mülkiyet',
      blocks: [
        {
          type: 'paragraph',
          content:
            "Devrem'e ait tasarım, marka, yazılım, logo ve özgün içerikler ilgili hak sahiplerinin izni olmadan ticari amaçla kopyalanamaz veya yeniden kullanılamaz.",
        },
        {
          type: 'paragraph',
          content:
            "Kullanıcı tarafından oluşturulan içeriklerin mülkiyeti kullanıcıda kalır. Devrem'e yalnızca hizmetin sunulması, görüntülenmesi, saklanması ve moderasyonu için gerekli ölçüde kullanım yetkisi verilir.",
        },
      ],
    },
    {
      id: 'sorumlulugun-sinirlari',
      title: '10. Sorumluluğun sınırları',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Devrem, kullanıcılar arasındaki iletişimin tarafı değildir. Kullanıcıların platform üzerinden kurdukları iletişim veya platform dışında gerçekleştirdikleri faaliyetlerden kullanıcıların kendileri sorumludur.',
        },
        {
          type: 'paragraph',
          content:
            "Devrem'deki bilgilendirici içerikler resmî askerlik belgesi veya kamu kurumu açıklamasının yerine geçmez.",
        },
      ],
    },
    {
      id: 'degisiklikler',
      title: '11. Değişiklikler',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Bu koşullar hizmet veya mevzuat değişikliklerine bağlı olarak güncellenebilir. Önemli değişikliklerde güncelleme tarihi değiştirilir.',
        },
      ],
    },
    {
      id: 'iletisim',
      title: '12. İletişim',
      blocks: [
        { type: 'contact', includeOperators: true, includeAddress: true },
      ],
    },
  ],
};

export const accountDeletionDocument: LegalDocument = {
  slug: 'account-deletion',
  title: 'Devrem Hesabını ve Verilerini Sil',
  shortTitle: 'Hesap Silme',
  description:
    'Devrem hesabınızı uygulama içinden veya uygulamaya erişemiyorsanız e-posta yoluyla kalıcı olarak kapatma seçenekleri.',
  updatedAt,
  intro: [
    'Devrem hesabınızı istediğiniz zaman silebilirsiniz.',
    'Hesap silme, hesabın geçici olarak dondurulması değil, hesabın kalıcı olarak kapatılması işlemidir.',
  ],
  sections: [
    {
      id: 'uygulama-icinden-hesap-silme',
      title: 'Uygulama içerisinden hesap silme',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Devrem uygulamasındaki hesap silme seçeneğinden işlemi başlatabilirsiniz. Hesabın kalıcı olarak kapatılacağı işlem öncesinde açıkça belirtilir.',
        },
        {
          type: 'paragraph',
          content:
            'Yetkisiz bir kişinin başka bir kullanıcı adına işlem yapmasını önlemek için kimlik doğrulaması veya silme onayı istenebilir.',
        },
      ],
    },
    {
      id: 'uygulamaya-erisemiyorsaniz',
      title: 'Uygulamaya erişemiyorsanız',
      blocks: [
        {
          type: 'callout',
          title: 'E-posta ile silme talebi',
          content:
            "Hesap silme talebinizi iletisim@devrem.co adresine 'Hesap Silme Talebi' başlığıyla iletebilirsiniz.",
          link: {
            label: 'Hesap silme talebi gönder',
            href: 'mailto:iletisim@devrem.co?subject=Hesap%20Silme%20Talebi',
          },
          tone: 'important',
        },
        {
          type: 'paragraph',
          content:
            'Talebin doğru hesaptan geldiğini doğrulamak için yalnızca gerekli hesap bilgileri istenebilir. Gereksiz kimlik belgeleri talep edilmez ve bir hesabın varlığı kamuya açık şekilde doğrulanmaz.',
        },
      ],
    },
    {
      id: 'silme-isleminde-ne-olur',
      title: 'Silme işleminde ne olur?',
      blocks: [
        {
          type: 'list',
          items: [
            'Kullanıcı hesabı kalıcı olarak kapatılır',
            'Doğrudan kullanıcı profiline bağlı bilgiler silinir veya anonimleştirilir',
            'Kullanıcıya ait aktif erişimler kaldırılır',
            'Kaldırılabilir medya ve hesap verileri temizlenir',
          ],
        },
        {
          type: 'paragraph',
          content:
            'Güvenlik, kötüye kullanımın önlenmesi, moderasyon, hukuki yükümlülükler veya uyuşmazlıkların çözümü için gerekli olan asgari kayıtlar, yalnızca gerekli olduğu süre boyunca tutulabilir. Bu kayıtlar aktif bir kullanıcı profilini sürdürmek için kullanılmaz.',
        },
      ],
    },
    {
      id: 'silme-ne-kadar-surer',
      title: 'Ne kadar sürer?',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Silme talebi doğrulandıktan sonra hesap kapatma işlemi başlatılır. Teknik temizlik ve saklanması zorunlu kayıtların ayrıştırılması, kullanılan altyapının işleyişine göre devam edebilir.',
        },
      ],
    },
    {
      id: 'yardim',
      title: 'Yardım',
      blocks: [
        {
          type: 'links',
          items: [
            {
              label: 'iletisim@devrem.co',
              href: 'mailto:iletisim@devrem.co?subject=Hesap%20Silme%20Hakkında',
              description: 'Hesap silme süreciyle ilgili sorularınızı iletin.',
            },
          ],
        },
      ],
    },
  ],
};

export const communityGuidelinesDocument: LegalDocument = {
  slug: 'community-guidelines',
  title: 'Devrem Topluluk Kuralları',
  shortTitle: 'Topluluk Kuralları',
  description:
    "Devrem'in güvenli, saygılı ve faydalı bir topluluk ortamı için uyguladığı kurallar ve yaptırımlar.",
  updatedAt,
  intro: [
    'Devrem, askerlik sürecindeki kullanıcıların güvenli ve faydalı bir ortamda iletişim kurabilmesini amaçlar.',
    'Topluluk özelliklerini kullanırken aşağıdaki kurallara uyulmalıdır.',
  ],
  sections: [
    {
      id: 'saygili-davran',
      title: 'Saygılı davran',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Hakaret, tehdit, taciz, zorbalık ve hedef gösterme kabul edilmez.',
        },
      ],
    },
    {
      id: 'nefret-soylemi-yasaktir',
      title: 'Nefret söylemi yasaktır',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Bir kişiyi veya grubu kimliği veya kişisel özellikleri nedeniyle aşağılayan ya da saldırıya hedef haline getiren içeriklere izin verilmez.',
        },
      ],
    },
    {
      id: 'taciz-ve-istenmeyen-iletisim-yasaktir',
      title: 'Taciz ve istenmeyen iletişim yasaktır',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Bir kullanıcı iletişim kurmak istemediğini belirttiğinde veya sizi engellediğinde farklı hesaplarla iletişimi sürdürmeye çalışmayın.',
        },
      ],
    },
    {
      id: 'cinsel-veya-mustehcen-icerik-yasaktir',
      title: 'Cinsel veya müstehcen içerik yasaktır',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Cinsel içerik, pornografik materyal ve kullanıcıları cinsel amaçla rahatsız eden davranışlara izin verilmez.',
        },
      ],
    },
    {
      id: 'kisisel-bilgileri-koru',
      title: 'Kişisel bilgileri koru',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Başka kişilere ait aşağıdaki bilgiler izin olmadan paylaşılmamalıdır:',
        },
        {
          type: 'list',
          items: [
            'Telefon numarası',
            'Adres',
            'Kimlik bilgileri',
            'Özel yazışmalar',
            'Fotoğraf veya belgeler',
          ],
        },
      ],
    },
    {
      id: 'sahte-hesap-ve-kimlige-burunme-yasaktir',
      title: 'Sahte hesap ve kimliğe bürünme yasaktır',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Başka bir kişiyi taklit etmek veya yanıltıcı bilgiler kullanmak yasaktır.',
        },
      ],
    },
    {
      id: 'spam-ve-dolandiricilik-yasaktir',
      title: 'Spam ve dolandırıcılık yasaktır',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Toplu istenmeyen mesajlar, sahte kampanyalar, para talebi, oltalama ve diğer dolandırıcılık davranışlarına izin verilmez.',
        },
      ],
    },
    {
      id: 'yasa-disi-icerik-ve-faaliyetler-yasaktir',
      title: 'Yasa dışı içerik ve faaliyetler yasaktır',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Suç teşkil eden içerik veya faaliyetlerin Devrem üzerinden organize edilmesine izin verilmez.',
        },
      ],
    },
    {
      id: 'raporlama',
      title: 'Raporlama',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kuralları ihlal ettiğini düşündüğünüz kullanıcı veya içeriği uygulamadaki raporlama seçenekleri üzerinden bildirebilirsiniz.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'Acil veya ciddi durumu bildir',
              href: 'mailto:iletisim@devrem.co?subject=Topluluk%20Güvenliği%20Bildirimi',
            },
          ],
        },
      ],
    },
    {
      id: 'engelleme',
      title: 'Engelleme',
      blocks: [
        {
          type: 'paragraph',
          content:
            'İletişim kurmak istemediğiniz kullanıcıları engelleyebilirsiniz. Engellenen kullanıcıların sizinle iletişim kurmasını önlemek için Devrem teknik kontroller uygular.',
        },
      ],
    },
    {
      id: 'yaptirimlar',
      title: 'Yaptırımlar',
      blocks: [
        {
          type: 'paragraph',
          content: 'İhlalin niteliğine ve tekrarına göre;',
        },
        {
          type: 'list',
          items: [
            'İçerik kaldırılabilir',
            'Özelliklere erişim sınırlandırılabilir',
            'Hesap geçici olarak askıya alınabilir',
            'Hesap kalıcı olarak kapatılabilir',
          ],
        },
        {
          type: 'paragraph',
          content:
            'Ciddi ihlaller doğrudan kalıcı yaptırım ile sonuçlanabilir.',
        },
      ],
    },
  ],
};

export const supportDocument: LegalDocument = {
  slug: 'support',
  title: 'Destek ve İletişim',
  shortTitle: 'Destek ve İletişim',
  description:
    'Devrem hakkında genel destek, hesap, gizlilik, hesap silme, şikâyet ve güvenlik konularında iletişim seçenekleri.',
  updatedAt,
  intro: [
    'Devrem ile ilgili soru, teknik sorun, gizlilik talebi veya güvenlik bildirimi için bizimle iletişime geçebilirsiniz.',
  ],
  sections: [
    {
      id: 'iletisim-bilgileri',
      title: 'İletişim bilgileri',
      blocks: [
        { type: 'contact', includeOperators: true, includeAddress: true },
      ],
    },
    {
      id: 'genel-destek',
      title: 'Genel destek',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Devrem uygulaması, web sitesi veya içerikler hakkındaki genel sorularınızı bize iletebilirsiniz.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'Genel destek e-postası gönder',
              href: 'mailto:iletisim@devrem.co?subject=Genel%20Destek',
            },
          ],
        },
      ],
    },
    {
      id: 'hesap-ve-giris-sorunlari',
      title: 'Hesap ve giriş sorunları',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Giriş, telefon doğrulaması veya hesabınıza erişimle ilgili teknik sorunlarda kullandığınız telefon numarasını herkese açık bir alanda paylaşmadan bize ulaşın.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'Hesap desteği iste',
              href: 'mailto:iletisim@devrem.co?subject=Hesap%20ve%20Giriş%20Desteği',
            },
          ],
        },
      ],
    },
    {
      id: 'gizlilik-ve-kvkk-talepleri',
      title: 'Gizlilik / KVKK talepleri',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Kişisel verilerinizin işlenmesi ve kanuni haklarınız hakkında bilgi edinebilir veya başvuruda bulunabilirsiniz.',
        },
        {
          type: 'links',
          items: [
            { label: 'Gizlilik Politikası', href: '/privacy' },
            { label: 'KVKK Aydınlatma Metni', href: '/kvkk' },
            {
              label: 'Gizlilik başvurusu gönder',
              href: 'mailto:iletisim@devrem.co?subject=Gizlilik%20ve%20KVKK%20Talebi',
            },
          ],
        },
      ],
    },
    {
      id: 'hesap-silme',
      title: 'Hesap silme',
      blocks: [
        {
          type: 'callout',
          title: 'Hesabınızı kalıcı olarak kapatın',
          content:
            'Uygulama içindeki silme seçeneğini kullanabilir veya uygulamaya erişemiyorsanız herkese açık hesap silme sayfasındaki yöntemi izleyebilirsiniz.',
          link: {
            label: 'Hesap ve veri silme sayfasına git',
            href: '/account-deletion',
          },
          tone: 'important',
        },
      ],
    },
    {
      id: 'kullanici-veya-icerik-sikayeti',
      title: 'Kullanıcı veya içerik şikâyeti',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Uygunsuz kullanıcı veya içeriği öncelikle uygulamadaki raporlama seçenekleri üzerinden bildirebilirsiniz. Ciddi durumlarda e-posta yoluyla da ulaşabilirsiniz.',
        },
        {
          type: 'links',
          items: [
            { label: 'Topluluk Kuralları', href: '/community-guidelines' },
            {
              label: 'Kullanıcı veya içerik şikâyeti gönder',
              href: 'mailto:iletisim@devrem.co?subject=Kullanıcı%20veya%20İçerik%20Şikâyeti',
            },
          ],
        },
      ],
    },
    {
      id: 'guvenlik-bildirimi',
      title: 'Güvenlik bildirimi',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Hesap güvenliği, şüpheli davranış veya Devrem altyapısını etkileyebilecek bir güvenlik sorunu fark ettiyseniz ayrıntıları sorumlu bir şekilde iletin. Mesajınıza parola, doğrulama kodu veya gereksiz kişisel belge eklemeyin.',
        },
        {
          type: 'links',
          items: [
            {
              label: 'Güvenlik bildirimi gönder',
              href: 'mailto:iletisim@devrem.co?subject=Güvenlik%20Bildirimi',
            },
          ],
        },
      ],
    },
  ],
};

export const legalDocuments = [
  privacyDocument,
  kvkkDocument,
  termsDocument,
  accountDeletionDocument,
  communityGuidelinesDocument,
  supportDocument,
];
