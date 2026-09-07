import type { Metadata } from 'next';
import { UserProfile } from '@/components/auth/user-auth';

export const metadata: Metadata = {
  title: 'Profilim',
  description: 'Devrem hesabındaki askerlik ve hazırlık bilgilerini görüntüle.',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <main
      className="flex min-h-[calc(100svh-5rem)] justify-center bg-[radial-gradient(circle_at_top_left,rgba(99,211,166,0.14),transparent_36%)] px-5 py-14 sm:px-8 sm:py-20"
      id="ana-icerik"
    >
      <UserProfile />
    </main>
  );
}
