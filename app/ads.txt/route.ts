const adsensePublisherId = process.env.ADSENSE_PUBLISHER_ID?.trim();
const validPublisherId = /^pub-\d{16}$/.test(adsensePublisherId ?? '');

export function GET() {
  // Add the exact AdSense ads.txt line copied from the AdSense dashboard after approval/setup.
  if (!validPublisherId) {
    return new Response(null, {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  return new Response(
    `google.com, ${adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
