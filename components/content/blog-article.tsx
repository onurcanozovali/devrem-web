import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArticleBody } from '@/components/content/article-body';
import { ArticleHeader } from '@/components/content/article-header';
import { ArticleSources } from '@/components/content/article-sources';
import { ArticleToc } from '@/components/content/article-toc';
import { getArticleToc } from '@/lib/content';
import type { BlogPost } from '@/src/fixtures/content';

export function BlogArticle({
  post,
  relatedPosts = [],
}: {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}) {
  const toc = getArticleToc(post);
  const showLastUpdated =
    post.slug ===
    '2027-bedelli-askerlik-ucreti-ne-kadar-olacak-guncel-tahmin';

  return (
    <article className="article-shell !block">
      <div className="article-main-column">
        <ArticleHeader post={post} toc={[]} />
        {showLastUpdated ? (
          <p className="mt-3 text-sm text-secondary-foreground">
            <time dateTime={post.updatedIso}>
              Son güncelleme: {post.updatedAt}
            </time>
          </p>
        ) : null}
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <aside
            className="article-desktop-sidebar order-first !block xl:order-last"
            aria-label="Yazı navigasyonu"
          >
            <div className="article-sidebar-panel">
              <p className="article-sidebar-label">İçindekiler</p>
              <ArticleToc items={toc} variant="desktop" />

              {post.sources?.length ? (
                <div className="article-desktop-sources !block">
                  <ArticleSources sources={post.sources} />
                </div>
              ) : null}

              <div className="article-sidebar-cta">
                <strong>Askerlik rehberlerini keşfet</strong>
                <p className="mt-2 text-xs leading-5 text-white/65">
                  Birlik, sevk, hazırlık ve bedelli içeriklerine tek yerden ulaş.
                </p>
                <Link className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary" href="/blog">
                  Tüm rehberler <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </aside>
          <div className="article-layout order-last min-w-0 xl:order-first">
            <ArticleBody post={post} relatedPosts={relatedPosts} />
          </div>
        </div>
      </div>
    </article>
  );
}
