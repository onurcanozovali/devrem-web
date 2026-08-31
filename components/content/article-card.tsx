import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import type { BlogPost } from '@/src/fixtures/content';

export function ArticleCard({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) {
  return (
    <article
      className={`article-card article-card-${post.tone} ${featured ? 'article-card-featured' : ''}`}
    >
      <Link
        aria-label={`${post.title} yazısını oku`}
        className="article-card-cover"
        href={`/blog/${post.slug}`}
      >
        <span>{post.category}</span>
        <strong>{post.title.split(' ').slice(0, 3).join(' ')}</strong>
      </Link>
      <div className="article-card-body">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-secondary-foreground">
          <span className="rounded-full bg-primary-subtle px-2.5 py-1 font-bold text-primary-ink">
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3" aria-hidden="true" /> {post.readingTime}
          </span>
          <span>{post.publishedAt}</span>
        </div>
        <h2
          className={`${featured ? 'text-3xl sm:text-4xl' : 'text-xl'} mt-5 font-bold leading-tight tracking-[-0.045em]`}
        >
          <Link
            className="transition hover:text-primary-ink"
            href={`/blog/${post.slug}`}
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-6 text-secondary-foreground">
          {post.excerpt}
        </p>
        <Link
          className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-primary-ink hover:text-primary-dark"
          href={`/blog/${post.slug}`}
        >
          Yazıyı oku <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
