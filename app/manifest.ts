import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Calendario de Eventos HyenUk Chu',
    short_name: 'Eventos CHU',
    description: 'Reserva tu cupo para las giras y talleres presenciales de HyenUk Chu.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3154dc',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
