import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Info,
  NotebookPen,
  TriangleAlert,
} from 'lucide-react';
import { ArticleSources } from '@/components/content/article-sources';
import { SafeRichText } from '@/components/content/safe-rich-text';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getRelatedPosts, headingToId } from '@/lib/content';
import type {
  ArticleBlock,
  ArticleSection,
  BlogPost,
} from '@/src/fixtures/content';

const calloutIcons = {
  info: Info,
  warning: TriangleAlert,
  note: NotebookPen,
} as const;

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === 'paragraph') {
    return <p><SafeRichText text={block.text} /></p>;
  }

  if (block.type === 'bullet-list') {
    return (
      <ul className="article-bullet-list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === 'numbered-list') {
    return (
      <ol className="article-numbered-list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  if (block.type === 'table') {
    return (
      <div>
        <div className="article-table-wrap">
          <Table className="min-w-[620px]">
          {block.caption ? <TableCaption>{block.caption}</TableCaption> : null}
          <TableHeader>
            <TableRow>
              {block.headers.map((header) => (
                <TableHead className="whitespace-normal" key={header}>
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row, rowIndex) => (
              <TableRow key={`${row[0]}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    className="whitespace-normal"
                    key={`${cell}-${cellIndex}`}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
        {block.note ? <p className="article-table-note">{block.note}</p> : null}
      </div>
    );
  }

  if (block.type === 'checklist') {
    return (
      <ul className="article-checklist">
        {block.items.map((item) => (
          <li key={item}>
            <CheckCircle2 className="size-5" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'image') {
    return (
      <figure className="article-inline-image">
        <Image
          alt={block.alt}
          height={675}
          src={block.url}
          unoptimized
          width={1200}
        />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === 'cta') {
    return (
      <aside className="article-inline-cta">
        <div>
          <strong>{block.title}</strong>
          <p>{block.description}</p>
        </div>
        <Link href={block.href}>
          {block.label} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </aside>
    );
  }

  const Icon = calloutIcons[block.tone];
  return (
    <aside className={`article-callout article-callout-${block.tone}`}>
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <div>
        <strong>{block.title}</strong>
        <p>{block.body}</p>
      </div>
    </aside>
  );
}

function LegacySectionContent({ section }: { section: ArticleSection }) {
  return (
    <>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.bullets?.length ? (
        <ul className="article-bullet-list">
          {section.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function ArticleBody({
  post,
  relatedPosts: suppliedRelatedPosts,
}: {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}) {
  const relatedPosts = suppliedRelatedPosts ?? getRelatedPosts(post);
  const cta =
    post.endCta ??
    ({
      title: 'Bir sonraki sorunun cevabı hazır',
      description:
        'Devrem Blog’daki diğer rehberlerle hazırlık sürecini adım adım netleştir.',
      label: 'Tüm rehberleri gör',
      href: '/blog',
    } as const);

  return (
    <div className="article-body">
      {post.sections.map((section) => (
        <section className="article-content-section" key={section.heading}>
          <h2 id={headingToId(section.heading)}>{section.heading}</h2>
          {section.blocks?.map((block, index) => (
            <ArticleBlockView block={block} key={`${block.type}-${index}`} />
          ))}
          <LegacySectionContent section={section} />
          {section.subsections?.map((subsection) => (
            <section className="article-subsection" key={subsection.heading}>
              <h3 id={headingToId(subsection.heading)}>{subsection.heading}</h3>
              {subsection.blocks.map((block, index) => (
                <ArticleBlockView
                  block={block}
                  key={`${block.type}-${index}`}
                />
              ))}
            </section>
          ))}
        </section>
      ))}

      {post.contextualLinks?.length ? (
        <aside
          className="article-related article-contextual-guides"
          aria-label="Ayrıntılı rehberler"
        >
          <p className="article-section-kicker">Konuyu derinleştir</p>
          <p className="article-contextual-intro">
            Bu başlıkların ayrıntılarını ilgili rehberlerde bulabilirsin.
          </p>
          <div className="article-related-grid">
            {post.contextualLinks.map((item) => {
              const content = (
                <>
                  <span>{item.status}</span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                  {item.href ? (
                    <ArrowRight className="size-4" aria-hidden="true" />
                  ) : null}
                </>
              );

              return item.href ? (
                <Link href={item.href} key={item.title}>
                  {content}
                </Link>
              ) : (
                <div
                  className="article-context-link-placeholder"
                  key={item.title}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </aside>
      ) : null}

      <aside className="article-callout article-callout-note article-editorial-note">
        <NotebookPen className="size-5 shrink-0" aria-hidden="true" />
        <div>
          <strong>Önemli not</strong>
          <p>
            Devrem bağımsız bir platformdur. Resmî işlem, tarih ve belge
            bilgilerinde MSB ile e-Devlet kayıtlarını esas al.
          </p>
        </div>
      </aside>

      {post.faqs?.length ? (
        <section className="article-faq" id="sik-sorulan-sorular">
          <p className="article-section-kicker">Hızlı cevaplar</p>
          <h2>Sık sorulan sorular</h2>
          <div className="article-faq-list">
            {post.faqs.map((item) => (
              <div
                itemScope
                itemType="https://schema.org/Question"
                key={item.question}
              >
                <details>
                  <summary itemProp="name">
                    {item.question}
                    <ChevronDown
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                  </summary>
                  <div
                    itemProp="acceptedAnswer"
                    itemScope
                    itemType="https://schema.org/Answer"
                  >
                    <p itemProp="text">{item.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {post.sources?.length ? (
        <section className="article-mobile-sources" aria-label="Kaynaklar">
          <ArticleSources sources={post.sources} />
        </section>
      ) : null}

      <section className="article-related" id="ilgili-rehberler">
        <p className="article-section-kicker">Okumaya devam et</p>
        <h2>İlgili rehberler</h2>
        <div className="article-related-grid">
          {relatedPosts.map((related) => (
            <Link href={`/blog/${related.slug}`} key={related.slug}>
              <span>{related.category}</span>
              <strong>{related.title}</strong>
              <small>{related.readingTime} okuma</small>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="article-end-cta">
        <div>
          <p className="article-section-kicker">Devrem ile devam et</p>
          <h2>{cta.title}</h2>
          <p>{cta.description}</p>
        </div>
        <Link href={cta.href}>
          {cta.label} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
