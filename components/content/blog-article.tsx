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
  const sidebarCta = post.endCta ?? {
    title: 'Daha fazla rehber',
    description:
      'Hazırlık sürecindeki diğer soruların için Devrem Blog’a göz at.',
    label: 'Tümünü gör',
    href: '/blog',
  };

  return (
    <article>
      <ArticleHeader post={post} toc={toc} />

      <div className="article-layout">
        <ArticleBody post={post} relatedPosts={relatedPosts} />

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
              <strong>{sidebarCta.title}</strong>
              <p>{sidebarCta.description}</p>
              <Link href={sidebarCta.href}>
                {sidebarCta.label}{' '}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
