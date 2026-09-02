import { getFirestoreDocument, createFirestoreDocument } from '../lib/firebase/server';
import { legacyPostToFields } from '../src/blog/legacy';
import { blogPosts } from '../src/fixtures/content';

async function migrate() {
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID eksik.');
  }
  let created = 0;
  let skipped = 0;

  for (const post of blogPosts) {
    const existing = await getFirestoreDocument('blogPosts', post.slug);
    if (existing) {
      console.log(`atlandı: ${post.slug}`);
      skipped += 1;
      continue;
    }
    const publishedAt = `${post.publishedIso}T09:00:00.000Z`;
    await createFirestoreDocument('blogPosts', post.slug, {
      id: post.slug,
      ...legacyPostToFields(post),
      publishedAt,
      createdAt: publishedAt,
      updatedAt: `${post.updatedIso ?? post.publishedIso}T09:00:00.000Z`,
    });
    console.log(`oluşturuldu: ${post.slug}`);
    created += 1;
  }

  console.log(`Tamamlandı. Oluşturulan: ${created}, atlanan: ${skipped}.`);
}

migrate().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
