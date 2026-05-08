import { MetadataRoute } from 'next';
import { getEvents } from '@/app/actions/events';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://calendario.chu.mx';
  
  // 🔄 Obtener eventos para determinar frescura de datos
  const { data: events = [] } = await getEvents();
  
  // Determinar la última fecha de modificación real
  const lastUpdate = events.length > 0 
    ? new Date(Math.max(...events.map(e => new Date(e.created_at || e.start_date).getTime())))
    : new Date();

  return [
    {
      url: baseUrl,
      lastModified: lastUpdate,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
