const baseUrl = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  throw new Error('ADMIN_USERNAME ve ADMIN_PASSWORD test ortamında gerekli.');
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function json(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

async function run() {
  const originHeaders = { origin: baseUrl };

  const protectedPage = await fetch(`${baseUrl}/admin/blog`, {
    redirect: 'manual',
  });
  assert(
    [302, 303, 307, 308].includes(protectedPage.status) &&
      protectedPage.headers.get('location')?.includes('/admin/login'),
    'Korunan admin sayfası girişe yönlendirilmedi.',
  );

  const unauthorizedApi = await fetch(`${baseUrl}/api/admin/blog`);
  assert(unauthorizedApi.status === 401, 'Korunan admin API 401 dönmedi.');

  const wrongLogin = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { ...originHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: `${password}-yanlis` }),
  });
  assert(wrongLogin.status === 401, 'Yanlış parola reddedilmedi.');

  const login = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { ...originHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  assert(login.ok, `Admin girişi başarısız (${login.status}).`);
  const setCookie = login.headers.get('set-cookie') ?? '';
  assert(setCookie.includes('HttpOnly'), 'Session cookie HttpOnly değil.');
  assert(
    setCookie.toLowerCase().includes('samesite=lax'),
    'Session cookie SameSite=Lax değil.',
  );
  const cookie = setCookie.split(';')[0];
  const authHeaders = {
    ...originHeaders,
    cookie,
    'content-type': 'application/json',
  };

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const mutationsAllowed =
    process.env.ALLOW_E2E_MUTATIONS === 'true' &&
    Boolean(projectId) &&
    projectId !== 'devrem-d985b';
  if (!mutationsAllowed) {
    const adminList = await fetch(`${baseUrl}/api/admin/blog`, {
      headers: { cookie },
    });
    assert(adminList.ok, 'Salt okunur admin blog kontrolü başarısız.');
    const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
    assert(sitemap.ok, 'Salt okunur sitemap kontrolü başarısız.');
    console.log(
      'Blog Admin E2E salt okunur modda başarılı; Firebase mutasyonları güvenlik nedeniyle atlandı.',
    );
    return;
  }

  const id = `codex-e2e-${Date.now()}`;
  const slug = `codex-e2e-${Date.now()}`;
  const updatedSlug = `${slug}-guncel`;
  const internalOnlyTopic = `internal-only-${Date.now()}`;
  const draft = {
    title: 'Codex E2E Blog Admin Testi',
    slug,
    excerpt:
      'Bu içerik yalnızca Blog Admin v1 akışını doğrulamak için oluşturuldu.',
    category: 'Rehber',
    author: 'Devrem Test',
    status: 'draft',
    primarySearchQuery: 'codex e2e primary query',
    secondaryQueries: ['codex e2e secondary query'],
    searchIntent: 'informational',
    seoTitle: 'Codex E2E Blog Admin Testi',
    metaDescription: 'Devrem Blog Admin v1 için geçici otomasyon testi.',
    primaryIntent: 'Blog Admin yayın akışını doğrulamak',
    excludedTopics: [internalOnlyTopic],
    standfirst: ['Taslak, yayın ve yayından kaldırma akışı doğrulanıyor.'],
    quickSummary: [
      'Taslak public görünmez.',
      'Yayınlanan içerik anında görünür.',
    ],
    contentBlocks: [
      { type: 'heading', level: 2, text: 'Test bölümü' },
      {
        type: 'paragraph',
        text: 'Kalıcı **Firestore** verisi *yenileme* sonrasında korunur. [Devrem Blog](/blog) ve [resmî site](https://example.com).',
      },
      {
        type: 'paragraph',
        text: '<script>alert(1)</script> metin olarak kalır.',
      },
      {
        type: 'list',
        style: 'bullet',
        items: ['Birinci madde', 'İkinci madde'],
      },
      {
        type: 'table',
        columns: ['Alan', 'Sonuç'],
        rows: [
          ['Taslak', 'Gizli'],
          ['Yayın', 'Görünür'],
        ],
        note: 'Geçici test tablosu',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'İpucu',
        body: 'Bu geçici veri test sonunda silinir.',
      },
      { type: 'checklist', items: ['TOC', 'SSS', 'Kaynaklar'] },
      {
        type: 'cta',
        title: 'Devrem',
        description: 'Test CTA bloğu',
        label: 'Bloga git',
        href: '/blog',
        presentation: 'end',
      },
    ],
    faq: [
      { question: 'Bu bir test mi?', answer: 'Evet, test sonunda temizlenir.' },
    ],
    sources: [
      {
        organization: 'Devrem',
        title: 'Devrem Blog',
        url: '/blog',
        lastVerifiedAt: '2026-09-01',
      },
    ],
    relatedArticleIds: ['2026-askerlik-celp-sevk-tarihleri'],
    coverImage: null,
    ogImage: null,
    featured: false,
    lastVerifiedAt: '2026-09-01',
  };

  let created = false;
  try {
    const create = await fetch(`${baseUrl}/api/admin/blog`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ id, post: draft }),
    });
    assert(
      create.status === 201,
      `Taslak oluşturulamadı (${create.status}): ${JSON.stringify(await json(create))}`,
    );
    created = true;

    const duplicateSlug = await fetch(`${baseUrl}/api/admin/blog`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ id: `${id}-duplicate`, post: draft }),
    });
    assert(
      duplicateSlug.status === 409,
      'Aynı slug ile ikinci yazı engellenmedi.',
    );

    const draftPublic = await fetch(`${baseUrl}/blog/${slug}`);
    assert(draftPublic.status === 404, 'Taslak public detaydan erişilebildi.');
    const draftSitemap = await fetch(`${baseUrl}/sitemap.xml`);
    assert(
      !(await draftSitemap.text()).includes(`/blog/${slug}`),
      'Taslak sitemap içinde göründü.',
    );

    const webp = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x08, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    const upload = await fetch(
      `${baseUrl}/api/admin/blog/${id}/images?kind=content`,
      {
        method: 'POST',
        headers: { ...originHeaders, cookie, 'content-type': 'image/webp' },
        body: webp,
      },
    );
    const uploaded = await json(upload);
    assert(
      upload.ok &&
        typeof uploaded.path === 'string' &&
        typeof uploaded.url === 'string',
      `Görsel yüklenemedi (${upload.status}).`,
    );
    assert(
      (uploaded.path as string).startsWith(`blog/${id}/`),
      'Storage yolu yazı sahipliğiyle eşleşmiyor.',
    );

    const withImage = {
      ...draft,
      ogImage: {
        path: uploaded.path,
        url: uploaded.url,
        alt: 'E2E sosyal paylaşım görseli',
      },
      contentBlocks: [
        ...draft.contentBlocks,
        {
          type: 'image',
          path: uploaded.path,
          url: uploaded.url,
          alt: 'E2E doğrulama görseli',
          caption: 'Geçici test görseli',
        },
      ],
    };
    const update = await fetch(`${baseUrl}/api/admin/blog/${id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ post: withImage }),
    });
    assert(update.ok, `Görselli taslak güncellenemedi (${update.status}).`);

    const persisted = await fetch(`${baseUrl}/api/admin/blog/${id}`, {
      headers: { cookie },
    });
    const persistedBody = await json(persisted);
    assert(
      persisted.ok &&
        JSON.stringify(persistedBody).includes('E2E doğrulama görseli') &&
        JSON.stringify(persistedBody).includes(internalOnlyTopic) &&
        JSON.stringify(persistedBody).includes('2026-09-01'),
      'Kaydedilen içerik yeniden okunamadı.',
    );

    const previewPage = await fetch(`${baseUrl}/admin/blog/${id}?preview=1`, {
      headers: { cookie },
    });
    const previewHtml = await previewPage.text();
    assert(
      previewPage.ok &&
        previewHtml.includes('Yazı önizlemesi') &&
        previewHtml.includes('Masaüstü') &&
        previewHtml.includes('Mobil'),
      'Admin önizleme sayfası oluşturulmadı.',
    );

    const publish = await fetch(`${baseUrl}/api/admin/blog/${id}/status`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ status: 'published' }),
    });
    assert(publish.ok, `Yayınlama başarısız (${publish.status}).`);

    const publicList = await fetch(`${baseUrl}/blog`);
    assert(
      (await publicList.text()).includes(draft.title),
      'Yayınlanan yazı public listede görünmedi.',
    );

    const publicDetail = await fetch(`${baseUrl}/blog/${slug}`);
    const detailHtml = await publicDetail.text();
    assert(publicDetail.ok, 'Yayınlanan yazı public detayda açılmadı.');
    assert(
      detailHtml.includes(draft.title),
      'Makale başlığı ilk HTML içinde yok.',
    );
    assert(
      detailHtml.includes(`<title>${draft.seoTitle} | Devrem</title>`),
      'SEO başlığı ilk HTML metadata içinde yok.',
    );
    assert(
      detailHtml.includes('Test bölümü'),
      'TOC/başlık içeriği render edilmedi.',
    );
    assert(
      detailHtml.includes('<strong>Firestore</strong>') &&
        detailHtml.includes('<em>yenileme</em>') &&
        detailHtml.includes('href="/blog"') &&
        detailHtml.includes('href="https://example.com/"'),
      'Güvenli zengin metin server-rendered HTML içinde yok.',
    );
    assert(
      !detailHtml.includes('<script>alert(1)</script>') &&
        detailHtml.includes('&lt;script&gt;alert(1)&lt;/script&gt;'),
      'Paragraf içindeki HTML güvenli metin olarak tutulmadı.',
    );
    assert(detailHtml.includes('Bu bir test mi?'), 'SSS render edilmedi.');
    assert(
      detailHtml.includes('Devrem — Devrem Blog'),
      'Yeni kaynak yapısı render edilmedi.',
    );
    assert(
      detailHtml.includes('2026 Askerlik Celp ve Sevk Tarihleri'),
      'Seçilen ilgili yazı render edilmedi.',
    );
    assert(
      detailHtml.includes(draft.metaDescription),
      'SEO meta description render edilmedi.',
    );
    assert(
      detailHtml.includes(`href="https://devrem.co/blog/${slug}"`) &&
        detailHtml.includes('rel="canonical"'),
      'Canonical ilk HTML içinde oluşturulmadı.',
    );
    assert(
      detailHtml.includes('Article') &&
        detailHtml.includes('BlogPosting') &&
        detailHtml.includes('BreadcrumbList'),
      'Article/Breadcrumb structured data oluşturulmadı.',
    );
    assert(
      !detailHtml.includes(internalOnlyTopic) &&
        !detailHtml.includes('codex e2e secondary query'),
      'Editoryal-only SEO alanları public sayfaya sızdı.',
    );
    assert(
      detailHtml.includes(uploaded.url as string),
      'OG görseli metadata içinde kullanılmadı.',
    );

    const publishedSitemap = await fetch(`${baseUrl}/sitemap.xml`);
    const publishedSitemapXml = await publishedSitemap.text();
    assert(
      publishedSitemap.ok && publishedSitemapXml.includes(`/blog/${slug}`),
      'Yayınlanan yazı sitemap içinde görünmedi.',
    );

    const search = await fetch(`${baseUrl}/api/blog/search?q=Codex%20E2E`);
    assert(
      JSON.stringify(await json(search)).includes(slug),
      'Yayınlanan yazı aramada bulunmadı.',
    );

    const editedTitle = `${draft.title} Güncel`;
    const editPublished = await fetch(`${baseUrl}/api/admin/blog/${id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        post: {
          ...withImage,
          title: editedTitle,
          slug: updatedSlug,
          status: 'published',
        },
      }),
    });
    assert(
      editPublished.ok,
      `Yayınlanmış yazı düzenlenemedi (${editPublished.status}).`,
    );

    const oldSlugResponse = await fetch(`${baseUrl}/blog/${slug}`, {
      redirect: 'manual',
    });
    assert(
      oldSlugResponse.status === 308 &&
        oldSlugResponse.headers
          .get('location')
          ?.endsWith(`/blog/${updatedSlug}`),
      'Eski slug yeni slug’a kalıcı yönlendirilmedi.',
    );
    const editedDetail = await fetch(`${baseUrl}/blog/${updatedSlug}`);
    assert(
      editedDetail.ok && (await editedDetail.text()).includes(editedTitle),
      'Düzenlenen yayın yeni slug ile açılmadı.',
    );

    const editedSitemap = await fetch(`${baseUrl}/sitemap.xml`);
    const editedSitemapXml = await editedSitemap.text();
    assert(
      editedSitemapXml.includes(`/blog/${updatedSlug}`) &&
        !editedSitemapXml.includes(`<loc>https://devrem.co/blog/${slug}</loc>`),
      'Sitemap güncel slug ile yenilenmedi.',
    );

    const unpublish = await fetch(`${baseUrl}/api/admin/blog/${id}/status`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ status: 'draft' }),
    });
    assert(unpublish.ok, 'Yayından kaldırma başarısız.');
    const hiddenAgain = await fetch(`${baseUrl}/blog/${updatedSlug}`);
    assert(
      hiddenAgain.status === 404,
      'Yayından kaldırılan yazı public erişilebilir kaldı.',
    );
    const unpublishedSitemap = await fetch(`${baseUrl}/sitemap.xml`);
    assert(
      !(await unpublishedSitemap.text()).includes(`/blog/${updatedSlug}`),
      'Yayından kaldırılan yazı sitemap içinde kaldı.',
    );

    assert(projectId, 'FIREBASE_PROJECT_ID test ortamında eksik.');
    const publicWrite = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blogPosts?documentId=unauthorized-e2e`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fields: { status: { stringValue: 'published' } },
        }),
      },
    );
    assert(
      [401, 403].includes(publicWrite.status),
      'Yetkisiz doğrudan Firestore yazımı reddedilmedi.',
    );

    console.log('Blog Admin E2E: başarılı.');
  } finally {
    if (created) {
      const remove = await fetch(`${baseUrl}/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      assert(remove.ok, `Geçici test yazısı temizlenemedi (${remove.status}).`);
      const removed = await fetch(`${baseUrl}/api/admin/blog/${id}`, {
        headers: { cookie },
      });
      assert(removed.status === 404, 'Geçici test yazısı silinmedi.');
      console.log('Geçici E2E yazısı ve bağlı görsel temizlendi.');
    }
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
