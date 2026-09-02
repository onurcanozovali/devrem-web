'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="admin-main">
      <div className="admin-error-state" role="alert">
        <p className="admin-kicker">İşlem tamamlanamadı</p>
        <h1>Yönetim verisi alınamadı</h1>
        <p>{error.message || 'Beklenmeyen bir hata oluştu.'}</p>
        <button onClick={reset} type="button">Tekrar dene</button>
      </div>
    </main>
  );
}
