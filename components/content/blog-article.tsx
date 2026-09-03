import { ArticleBody } from '@/components/content/article-body';
import { ArticleHeader } from '@/components/content/article-header';
import { ArticleSources } from '@/components/content/article-sources';
import { ArticleToc } from '@/components/content/article-toc';
import { StoreButtons } from '@/components/site/store-buttons';
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

  return (
    <article className="article-shell">
      <div className="article-main-column">
        <ArticleHeader post={post} toc={toc} />
        <div className="article-layout">
          <ArticleBody post={post} relatedPosts={relatedPosts} />
        </div>
      </div>

      <aside
        className="article-desktop-sidebar"
        aria-label="Yazı navigasyonu"
      >
        <div className="article-sidebar-panel">
          <p className="article-sidebar-label">İçindekiler</p>
          <ArticleToc items={toc} variant="desktop" />

          {post.sources?.length ? (
            <div className="article-desktop-sources">
              <ArticleSources sources={post.sources} />
            </div>
          ) : null}

          <div className="article-sidebar-cta">
            <strong>Devrem’i indir</strong>
            <StoreButtons
              className="article-sidebar-store-buttons"
              compact
              tone="light"
            />
          </div>
        </div>
      </aside>
    </article>
  );
}
