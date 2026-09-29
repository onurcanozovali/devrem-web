const eligiblePublicRoutes = [
  '/',
  '/bedelli',
  '/araclar',
  '/haberler',
  '/blog',
  '/asker-sozlugu',
  '/asker-rutbeleri',
  '/birlikler',
] as const;

const excludedRoutePrefixes = [
  '/admin',
  '/api',
  '/giris',
  '/kayit',
  '/profil',
  '/hesap',
  '/ayarlar',
  '/mesaj',
  '/mesajlar',
  '/sohbet',
  '/chat',
  '/dm',
  '/ozel-grup',
] as const;

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isAdEligiblePathname(pathname: string) {
  const normalizedPath = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';

  if (excludedRoutePrefixes.some((route) => matchesRoute(normalizedPath, route))) {
    return false;
  }

  return eligiblePublicRoutes.some((route) => matchesRoute(normalizedPath, route));
}

// Integrate Google-certified CMP before serving personalized ads in EEA/UK/Switzerland.
