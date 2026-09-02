import type { BlogImage } from './types';

export function blogMediaUrl(image: Pick<BlogImage, 'path' | 'url'>) {
  if (!image.path) return image.url;

  const params = new URLSearchParams({ path: image.path });
  try {
    const version = new URL(image.url).searchParams.get('v');
    if (version) params.set('v', version);
  } catch {
    // Legacy relative URLs do not need an additional cache version.
  }
  return `/api/blog/media?${params.toString()}`;
}
