import { notFound } from 'next/navigation';
import { BlogEditor } from '@/components/admin/blog-editor';
import {
  getAdminBlogPost,
  listAdminBlogPosts,
} from '@/lib/blog/repository';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function EditBlogPostPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const [post, posts, query] = await Promise.all([
    getAdminBlogPost(id),
    listAdminBlogPosts(),
    searchParams,
  ]);
  if (!post) notFound();
  return (
    <BlogEditor
      initialPost={post}
      postId={id}
      previewOnLoad={query.preview === '1'}
      relatedOptions={posts.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
      }))}
    />
  );
}
