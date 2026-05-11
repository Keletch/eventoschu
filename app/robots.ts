import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calendario.chu.mx';

  return {
    rules: [
      {
        userAgent: ['GPTBot', 'Google-Extended', 'Amazonbot', 'Claude-Web'],
        allow: '/',
        disallow: ['/admin', '/api'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
