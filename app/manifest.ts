import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Calendario de Eventos HyenUk Chu',
    short_name: 'Eventos CHU',
    description: 'Reserva tu cupo para las giras y talleres presenciales de HyenUk Chu.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3154dc',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
