import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CalendarDays, Check } from 'lucide-react';
import { Container } from '@/components/site/container';
import { siteConfig } from '@/src/config/site';
import { createPageMetadata } from '@/src/config/seo';
import {
  legalDocuments,
  type LegalBlock,
  type LegalDocument,
} from '@/src/fixtures/legal';

export function createLegalMetadata(document: LegalDocument): Metadata {
  return createPageMetadata({
    title: document.title,
    description: document.description,
    path: `/${document.slug}`,
  });
}

function LegalLinkItem({
  label,
  href,
  description,
}: {
  label: string;
  href: string;
  description?: string;
}) {
  const content = (
    <>
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
    </>
  );
  const className = 'legal-link-card';

  return href.startsWith('mailto:') ? (
    <a className={className} href={href}>
      {content}
    </a>
  ) : (
    <Link className={className} href={href}>
      {content}
    </Link>
  );
}

function LegalContact({
  includeOperators,
  includeAddress,
}: Extract<LegalBlock, { type: 'contact' }>) {
  return (
    <address className="legal-contact-card">
      <strong>{siteConfig.name}</strong>
      {includeOperators ? (
        <div>
          <span>İşleticiler</span>
          <p>{siteConfig.operatorName}</p>
        </div>
      ) : null}
      {includeAddress ? (
        <div>
          <span>Adres</span>
          {siteConfig.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
      <div>
        <span>E-posta</span>
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
      </div>
    </address>
  );
}

function LegalBlockContent({ block }: { block: LegalBlock }) {
  if (block.type === 'paragraph') return <p>{block.content}</p>;

  if (block.type === 'list') {
    const List = block.ordered ? 'ol' : 'ul';
    return (
      <List
        className={block.ordered ? 'legal-ordered-list' : 'legal-bullet-list'}
      >
        {block.items.map((item) => (
          <li key={item}>
            {!block.ordered ? (
              <Check className="size-4" aria-hidden="true" />
            ) : null}
            <span>{item}</span>
          </li>
        ))}
      </List>
    );
  }

  if (block.type === 'links') {
    return (
      <div className="legal-link-list">
        {block.items.map((item) => (
          <LegalLinkItem key={`${item.href}-${item.label}`} {...item} />
        ))}
      </div>
    );
  }

  if (block.type === 'callout') {
    return (
      <aside
        className={`legal-callout legal-callout-${block.tone ?? 'default'}`}
      >
        <strong>{block.title}</strong>
        <p>{block.content}</p>
        {block.link ? <LegalLinkItem {...block.link} /> : null}
      </aside>
    );
  }

  return <LegalContact {...block} />;
}

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <main className="legal-page" id="ana-icerik">
      <Container>
        <header className="legal-hero page-hero">
          <Link className="legal-back-link page-back-link" href="/">
            <ArrowLeft className="size-4" aria-hidden="true" /> Ana sayfaya dön
          </Link>
          <p className="legal-kicker page-hero-meta">Devrem · Bilgilendirme</p>
          <h1 className="page-title">{document.title}</h1>
          <div className="legal-updated">
            <CalendarDays className="size-4" aria-hidden="true" />
            <span>Son güncelleme: {document.updatedAt}</span>
          </div>
          <div className="legal-intro">
            {document.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        <div className="legal-layout">
          <article className="legal-document">
            {document.sections.map((section) => (
              <section
                className="legal-section"
                id={section.id}
                key={section.id}
              >
                <h2>{section.title}</h2>
                <div className="legal-section-content">
                  {section.blocks.map((block, index) => (
                    <LegalBlockContent
                      block={block}
                      key={`${section.id}-${block.type}-${index}`}
                    />
                  ))}
                </div>
              </section>
            ))}
          </article>

          <aside className="legal-sidebar" aria-label="Sayfa navigasyonu">
            <nav className="legal-toc" aria-label="Bu sayfada">
              <strong>Bu sayfada</strong>
              <ol>
                {document.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
            <nav
              className="legal-document-links"
              aria-label="Devrem bilgilendirme sayfaları"
            >
              <strong>Diğer sayfalar</strong>
              {legalDocuments
                .filter((item) => item.slug !== document.slug)
                .map((item) => (
                  <Link href={`/${item.slug}`} key={item.slug}>
                    {item.shortTitle}
                  </Link>
                ))}
            </nav>
          </aside>
        </div>
      </Container>
    </main>
  );
}
