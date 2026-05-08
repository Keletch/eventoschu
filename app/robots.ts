import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventoschu.vercel.app';

  return {
    rules: [
      {
        userAgent: ['GPTBot', 'Google-Extended', 'Amazonbot', 'Claude-Web'],
        allow: '/',
        disallow: ['/admin', '/api', '/_next'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/_next'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
