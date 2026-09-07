import type { Metadata } from 'next';
import { PhoneAuthForm } from '@/components/auth/user-auth';

export const metadata: Metadata = {
  title: 'Giriş Yap',
  description: 'Devrem hesabına telefon numaranla güvenli biçimde giriş yap.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main
      className="flex min-h-[calc(100svh-5rem)] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(99,211,166,0.16),transparent_38%)] px-5 py-14 sm:px-8"
      id="ana-icerik"
    >
      <PhoneAuthForm />
    </main>
  );
}
