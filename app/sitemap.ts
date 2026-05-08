import { MetadataRoute } from 'next';
import { getEvents } from '@/app/actions/events';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventoschu.vercel.app';
  
  // 🔄 Obtener eventos para determinar frescura de datos
  const { data: events } = await getEvents();
  
  // Determinar la última fecha de modificación (basada en el evento más reciente o hoy)
  const lastEventDate = events && events.length > 0 
    ? new Date(Math.max(...events.map(e => new Date(e.start_date).getTime())))
    : new Date();

  return [
    {
      url: baseUrl,
      lastModified: lastEventDate,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
