import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminPostActions } from '@/components/admin/admin-post-actions';
import { listAdminBlogPosts } from '@/lib/blog/repository';

export const dynamic = 'force-dynamic';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}

export default async function AdminBlogPage() {
  let posts = [] as Awaited<ReturnType<typeof listAdminBlogPosts>>;
  let error = '';
  try {
    posts = await listAdminBlogPosts();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Yazılar alınamadı.';
  }

  return (
    <main className="admin-main" id="ana-icerik">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Yayın yönetimi</p>
          <h1>Blog Yazıları</h1>
          <p>Taslakları düzenle, önizle ve hazır olduğunda yayınla.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/blog/new">
          <Plus className="size-4" aria-hidden="true" /> Yeni Yazı
        </Link>
      </div>

      {error ? <div className="admin-config-error">{error}</div> : null}
      {!error ? (
        <div className="admin-table-wrap">
          <table className="admin-post-table">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Kategori</th>
                <th>Durum</th>
                <th>Yayın tarihi</th>
                <th>Son güncelleme</th>
                <th><span className="sr-only">İşlemler</span></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <strong>{post.title}</strong>
                    <small>/{post.slug}</small>
                  </td>
                  <td>{post.category}</td>
                  <td>
                    <span className={`admin-status admin-status-${post.status}`}>
                      {post.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td>{formatDate(post.publishedAt)}</td>
                  <td>{formatDate(post.updatedAt)}</td>
                  <td><AdminPostActions id={post.id} status={post.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!posts.length ? (
            <div className="admin-empty-state">Henüz blog yazısı yok.</div>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
