import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronRight, Clock3 } from 'lucide-react';
import { ArticleToc } from '@/components/content/article-toc';
import { getQuickSummary, type ArticleTocItem } from '@/lib/content';
import type { BlogPost } from '@/src/fixtures/content';

export function ArticleHeader({
  post,
  toc,
}: {
  post: BlogPost;
  toc: ArticleTocItem[];
}) {
  const standfirst = post.standfirst ?? [post.excerpt];
  const summary = getQuickSummary(post);

  return (
    <header className="article-hero page-hero">
      <nav aria-label="İçerik yolu">
        <ol className="article-breadcrumb">
          <li><Link href="/">Ana Sayfa</Link></li>
          <li><ChevronRight className="size-3.5" aria-hidden="true" /><Link href="/blog">Blog</Link></li>
          <li aria-current="page"><ChevronRight className="size-3.5" aria-hidden="true" /><span>{post.title}</span></li>
        </ol>
      </nav>

      <div className="article-meta page-hero-meta">
        <span className="article-category-badge">{post.category}</span>
        <time dateTime={post.publishedIso}>{post.publishedAt}</time>
        {post.updatedIso && post.updatedIso !== post.publishedIso ? (
          <time dateTime={post.updatedIso}>Güncellendi: {post.updatedAt}</time>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5" aria-hidden="true" /> {post.readingTime}{' '}
          okuma
        </span>
        <span>Yazan: {post.author}</span>
      </div>

      <h1 className="page-title">{post.title}</h1>

      <div className="article-standfirst">
        {standfirst.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section
        className="article-quick-summary"
        aria-labelledby="quick-summary-title"
      >
        <div>
          <span>60 saniyede</span>
          <h2 id="quick-summary-title">Kısa özet</h2>
        </div>
        <ul>
          {summary.map((item) => (
            <li key={item}>
              <Check className="size-4 shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="article-mobile-navigation">
        <ArticleToc items={toc} variant="mobile" />
      </div>

      {post.coverImage ? (
        <figure className="article-cover">
          <div>
            <Image
              alt={post.coverImage.alt}
              fill
              sizes="(max-width: 900px) 100vw, 760px"
              src={post.coverImage.src}
              style={{ objectFit: 'contain' }}
            />
          </div>
          {post.coverImage.caption ? (
            <figcaption>{post.coverImage.caption}</figcaption>
          ) : null}
        </figure>
      ) : null}
    </header>
  );
}
