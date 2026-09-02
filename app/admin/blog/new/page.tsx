import { BlogEditor } from '@/components/admin/blog-editor';
import { listAdminBlogPosts } from '@/lib/blog/repository';

export const dynamic = 'force-dynamic';

export default async function NewBlogPostPage() {
  const postId = crypto.randomUUID();
  const posts = await listAdminBlogPosts();
  return (
    <BlogEditor
      postId={postId}
      relatedOptions={posts.map((post) => ({
        id: post.id,
        title: post.title,
        status: post.status,
      }))}
    />
  );
}
