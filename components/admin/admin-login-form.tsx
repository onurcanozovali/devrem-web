'use client';

import { useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';

export function AdminLoginForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  return (
    <form
      className="admin-login-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        const form = new FormData(event.currentTarget);
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            username: form.get('username'),
            password: form.get('password'),
          }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(result.error ?? 'Giriş yapılamadı.');
          setBusy(false);
          return;
        }
        window.location.assign('/admin/dashboard');
      }}
    >
      <label>
        <span>E-posta veya kullanıcı adı</span>
        <input autoComplete="username" name="username" required />
      </label>
      <label>
        <span>Parola</span>
        <input
          autoComplete="current-password"
          name="password"
          required
          type="password"
        />
      </label>
      {error ? (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button disabled={busy} type="submit">
        {busy ? (
          <LockKeyhole className="size-4" aria-hidden="true" />
        ) : (
          <LogIn className="size-4" aria-hidden="true" />
        )}
        {busy ? 'Kontrol ediliyor…' : 'Giriş yap'}
      </button>
    </form>
  );
}
