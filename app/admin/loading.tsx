export default function AdminLoading() {
  return (
    <main className="admin-main" aria-busy="true" aria-label="Yükleniyor">
      <div className="admin-loading-heading" />
      <div className="admin-loading-grid">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="admin-loading-card" key={index} />
        ))}
      </div>
    </main>
  );
}
