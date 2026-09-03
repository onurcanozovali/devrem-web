import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpenText, Clock3 } from 'lucide-react';
import { Container } from '@/components/site/container';
import { listPublishedBlogPosts } from '@/lib/blog/repository';
import type { BlogPost } from '@/src/fixtures/content';

function listingTitle(post: BlogPost) {
  return post.cardTitle?.trim() || post.title;
}

function EditorialCover({
  post,
  sizes,
}: {
  post: BlogPost;
  sizes: string;
}) {
  if (post.coverImage?.src) {
    return (
      <Image
        alt={post.coverImage.alt}
        className="home-blog-cover-image"
        fill
        sizes={sizes}
        src={post.coverImage.src}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`home-blog-cover-fallback home-blog-cover-${post.tone}`}
    >
      <BookOpenText className="size-9" />
    </span>
  );
}

function ArticleMeta({ post }: { post: BlogPost }) {
  return (
    <div className="home-blog-meta">
      <span>{post.category}</span>
      <small>
        <Clock3 className="size-3" aria-hidden="true" /> {post.readingTime}
      </small>
      <time dateTime={post.publishedIso}>{post.publishedAt}</time>
    </div>
  );
}

function FeaturedGuide({ post }: { post: BlogPost }) {
  return (
    <article className="home-blog-featured">
      <Link
        aria-label={`${post.title} yazısını oku`}
        className="home-blog-featured-cover"
        href={`/blog/${post.slug}`}
      >
        <EditorialCover
          post={post}
          sizes="(max-width: 1023px) 100vw, 62vw"
        />
        <span className="home-blog-cover-label">Öne çıkan rehber</span>
      </Link>
      <div className="home-blog-featured-copy">
        <ArticleMeta post={post} />
        <h3>
          <Link href={`/blog/${post.slug}`}>{listingTitle(post)}</Link>
        </h3>
        <p>{post.excerpt}</p>
        <Link className="home-blog-read-link" href={`/blog/${post.slug}`}>
          Rehberi oku <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function CompactGuide({ post }: { post: BlogPost }) {
  return (
    <article className="home-blog-compact">
      <Link
        aria-label={`${post.title} yazısını oku`}
        className="home-blog-compact-cover"
        href={`/blog/${post.slug}`}
      >
        <EditorialCover
          post={post}
          sizes="(max-width: 639px) 38vw, (max-width: 1023px) 42vw, 180px"
        />
      </Link>
      <div className="home-blog-compact-copy">
        <ArticleMeta post={post} />
        <h3>
          <Link href={`/blog/${post.slug}`}>{listingTitle(post)}</Link>
        </h3>
        <Link className="home-blog-read-link" href={`/blog/${post.slug}`}>
          Oku <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export async function EditorialGuides() {
  const posts = await listPublishedBlogPosts();
  const featured = posts.find((post) => post.featured) ?? posts[0] ?? null;

  if (!featured) return null;

  const supporting = posts
    .filter((post) => post.slug !== featured.slug)
    .slice(0, 2);

  return (
    <section
      className="home-blog-section"
      id="blog"
      aria-labelledby="home-blog-title"
    >
      <Container>
        <div className="home-blog-heading">
          <div>
            <p>Devrem Blog</p>
            <h2 id="home-blog-title">
              Güncel askerlik rehberleri ve analizler
            </h2>
          </div>
          <div className="home-blog-heading-copy">
            <p>
              Resmî kaynaklara dayanan açıklamalar, süreç rehberleri ve
              Bedelli verisini anlamlandıran güncel içerikler.
            </p>
          </div>
        </div>

        <div
          className={`home-blog-layout ${supporting.length ? '' : 'home-blog-layout-single'}`}
        >
          <FeaturedGuide post={featured} />

          {supporting.length ? (
            <div className="home-blog-supporting">
              {supporting.map((post) => (
                <CompactGuide key={post.slug} post={post} />
              ))}
              <Link className="home-blog-all-card" href="/blog">
                <span>Devrem Blog</span>
                <strong>Tüm rehberleri keşfet</strong>
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
