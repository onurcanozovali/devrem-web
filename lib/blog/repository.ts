import {
  FirebaseConfigurationError,
  createFirestoreDocument,
  deleteFirestoreDocument,
  deleteFirebaseStorageObject,
  getFirestoreDocument,
  isFirebaseServerConfigured,
  listFirestoreDocuments,
  replaceFirestoreDocument,
} from '@/lib/firebase/server';
import { firestorePostToView, legacyPostToFields } from '@/src/blog/legacy';
import type {
  BlogPostDocument,
  BlogPostWriteInput,
  BlogSource,
} from '@/src/blog/types';
import { blogPosts, type BlogPost } from '@/src/fixtures/content';

const collection = 'blogPosts';

export class BlogSlugConflictError extends Error {
  constructor() {
    super('Bu slug başka bir yazı tarafından kullanılıyor.');
    this.name = 'BlogSlugConflictError';
  }
}

function asDocument(id: string, data: Record<string, unknown>) {
  const raw = data as Omit<Partial<BlogPostDocument>, 'sources'> & {
    sources?: Array<Record<string, unknown>>;
  };
  const title = typeof raw.title === 'string' ? raw.title : '';
  const seoTitle = typeof raw.seoTitle === 'string' ? raw.seoTitle : title;
  const now = new Date().toISOString();
  const sources: BlogSource[] = Array.isArray(raw.sources)
    ? raw.sources.flatMap((source) => {
        const legacyLabel =
          typeof source.label === 'string' ? source.label : '';
        const organization =
          typeof source.organization === 'string'
            ? source.organization
            : legacyLabel;
        const sourceTitle =
          typeof source.title === 'string' ? source.title : legacyLabel;
        const url =
          typeof source.url === 'string'
            ? source.url
            : typeof source.href === 'string'
              ? source.href
              : '';
        if (!organization || !sourceTitle || !url) return [];
        return [
          {
            organization,
            title: sourceTitle,
            url,
            lastVerifiedAt:
              typeof source.lastVerifiedAt === 'string'
                ? source.lastVerifiedAt
                : null,
          },
        ];
      })
    : [];

  return {
    id,
    title,
    cardTitle:
      typeof raw.cardTitle === 'string' && raw.cardTitle.trim()
        ? raw.cardTitle.trim()
        : undefined,
    slug: typeof raw.slug === 'string' ? raw.slug : id,
    excerpt: typeof raw.excerpt === 'string' ? raw.excerpt : '',
    category: typeof raw.category === 'string' ? raw.category : 'Rehber',
    author: typeof raw.author === 'string' ? raw.author : 'Devrem Editör',
    status: raw.status === 'published' ? 'published' : 'draft',
    primarySearchQuery:
      typeof raw.primarySearchQuery === 'string'
        ? raw.primarySearchQuery
        : seoTitle || title,
    secondaryQueries: Array.isArray(raw.secondaryQueries)
      ? raw.secondaryQueries.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
    searchIntent:
      raw.searchIntent === 'fresh-current' ||
      raw.searchIntent === 'transactional-process'
        ? raw.searchIntent
        : 'informational',
    seoTitle,
    metaDescription:
      typeof raw.metaDescription === 'string'
        ? raw.metaDescription
        : typeof raw.excerpt === 'string'
          ? raw.excerpt
          : '',
    primaryIntent:
      typeof raw.primaryIntent === 'string' ? raw.primaryIntent : title,
    excludedTopics: Array.isArray(raw.excludedTopics)
      ? raw.excludedTopics.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
    standfirst: Array.isArray(raw.standfirst)
      ? raw.standfirst.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
    quickSummary: Array.isArray(raw.quickSummary)
      ? raw.quickSummary.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
    contentBlocks: Array.isArray(raw.contentBlocks) ? raw.contentBlocks : [],
    faq: Array.isArray(raw.faq) ? raw.faq : [],
    sources,
    relatedArticleIds: Array.isArray(raw.relatedArticleIds)
      ? raw.relatedArticleIds.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
    coverImage: raw.coverImage ?? null,
    ogImage: raw.ogImage ?? null,
    featured: Boolean(raw.featured),
    lastVerifiedAt:
      typeof raw.lastVerifiedAt === 'string' ? raw.lastVerifiedAt : null,
    publishedAt: typeof raw.publishedAt === 'string' ? raw.publishedAt : null,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    previousSlugs: Array.isArray(raw.previousSlugs)
      ? raw.previousSlugs.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
  } satisfies BlogPostDocument;
}

function fixtureDocuments(): BlogPostDocument[] {
  return blogPosts.map((post) => ({
    id: post.slug,
    ...legacyPostToFields(post),
    publishedAt: `${post.publishedIso}T09:00:00.000Z`,
    createdAt: `${post.publishedIso}T09:00:00.000Z`,
    updatedAt: `${post.updatedIso ?? post.publishedIso}T09:00:00.000Z`,
    previousSlugs: [],
  }));
}

function canUseDevelopmentFixtures() {
  return process.env.NODE_ENV !== 'production';
}

async function listDocuments({ admin = false } = {}) {
  if (!isFirebaseServerConfigured()) {
    if (!admin && canUseDevelopmentFixtures()) return fixtureDocuments();
    throw new FirebaseConfigurationError();
  }
  const documents = await listFirestoreDocuments(collection);
  return documents.map(({ id, data }) => asDocument(id, data));
}

export async function listAdminBlogPosts() {
  const posts = await listDocuments({ admin: true });
  return posts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listPublishedBlogDocuments() {
  const posts = await listDocuments();
  return posts
    .filter((post) => post.status === 'published' && post.publishedAt)
    .sort((a, b) =>
      (b.publishedAt ?? b.updatedAt).localeCompare(
        a.publishedAt ?? a.updatedAt,
      ),
    );
}

export async function listPublishedBlogPosts(): Promise<BlogPost[]> {
  return (await listPublishedBlogDocuments()).map(firestorePostToView);
}

export async function getPublishedBlogPost(slug: string) {
  const post = (await listPublishedBlogDocuments()).find(
    (candidate) =>
      candidate.slug === slug || candidate.previousSlugs.includes(slug),
  );
  return post ? firestorePostToView(post) : null;
}

export async function getPublishedRelatedPosts(ids: string[]) {
  if (!ids.length) return [];
  const posts = await listPublishedBlogDocuments();
  return ids
    .map((id) =>
      posts.find((candidate) => candidate.id === id || candidate.slug === id),
    )
    .filter((post): post is BlogPostDocument => Boolean(post))
    .map(firestorePostToView);
}

export async function getAdminBlogPost(id: string) {
  if (!isFirebaseServerConfigured()) throw new FirebaseConfigurationError();
  const document = await getFirestoreDocument(collection, id);
  return document ? asDocument(document.id, document.data) : null;
}

async function assertUniqueSlug(slug: string, currentId: string) {
  const posts = await listDocuments({ admin: true });
  if (
    posts.some(
      (post) =>
        post.id !== currentId &&
        (post.slug === slug || post.previousSlugs.includes(slug)),
    )
  ) {
    throw new BlogSlugConflictError();
  }
}

export async function createBlogPost(id: string, input: BlogPostWriteInput) {
  await assertUniqueSlug(input.slug, id);
  const now = new Date().toISOString();
  const document: BlogPostDocument = {
    id,
    ...input,
    publishedAt: input.status === 'published' ? now : null,
    createdAt: now,
    updatedAt: now,
    previousSlugs: [],
  };
  await createFirestoreDocument(collection, id, document);
  return document;
}

export async function updateBlogPost(id: string, input: BlogPostWriteInput) {
  const existing = await getAdminBlogPost(id);
  if (!existing) return null;
  await assertUniqueSlug(input.slug, id);
  const now = new Date().toISOString();
  const previousSlugs =
    input.slug !== existing.slug && existing.publishedAt
      ? Array.from(new Set([...existing.previousSlugs, existing.slug])).slice(
          -20,
        )
      : existing.previousSlugs;
  const document: BlogPostDocument = {
    id,
    ...input,
    publishedAt:
      existing.publishedAt ?? (input.status === 'published' ? now : null),
    createdAt: existing.createdAt,
    updatedAt: now,
    previousSlugs,
  };
  await replaceFirestoreDocument(collection, id, document);
  return document;
}

export async function setBlogPostStatus(
  id: string,
  status: BlogPostDocument['status'],
) {
  const existing = await getAdminBlogPost(id);
  if (!existing) return null;
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    previousSlugs: _previousSlugs,
    ...fields
  } = existing;
  return updateBlogPost(id, { ...fields, status });
}

export async function deleteBlogPost(id: string) {
  const existing = await getAdminBlogPost(id);
  if (!existing) return false;
  const mediaPaths = new Set<string>();
  if (existing.coverImage?.path) mediaPaths.add(existing.coverImage.path);
  if (existing.ogImage?.path) mediaPaths.add(existing.ogImage.path);
  for (const block of existing.contentBlocks) {
    if (block.type === 'image' && block.path) mediaPaths.add(block.path);
  }
  for (const path of mediaPaths) {
    if (path.startsWith(`blog/${id}/`)) {
      await deleteFirebaseStorageObject(path);
    }
  }
  await deleteFirestoreDocument(collection, id);
  return true;
}
