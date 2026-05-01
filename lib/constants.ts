export const COUNTRY_CODES = [
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+34", country: "España", flag: "🇪🇸" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+507", country: "Panamá", flag: "🇵🇦" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+502", country: "Guatemala", flag: "🇬🇹" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+595", country: "Paraguay", flag: "🇵🇾" },
  { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  { code: "+503", country: "El Salvador", flag: "🇸🇻" },
  { code: "+504", country: "Honduras", flag: "🇭🇳" },
  { code: "+505", country: "Nicaragua", flag: "🇳🇮" },
  { code: "+1", country: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "+1", country: "Puerto Rico", flag: "🇵🇷" },
];

export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/somoscdi?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=facebook" },
  { name: "Instagram", href: "https://www.instagram.com/elclubdeinversionistas?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=instagram" },
  { name: "Youtube", href: "https://www.youtube.com/channel/UCIOxD-w2fEkmd-IUCjhn-ZQ?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=youtube" },
  { name: "X", href: "https://x.com/somoscdi?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=twitter" },
  { name: "Twitch", href: "https://www.twitch.tv/hyenukchu?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=twitch" },
];

export const SURVEY_QUESTIONS = [
  {
    id: "relationship",
    label: "¿Cuál es tu relación actual con el Club de Inversionistas?",
    options: [
      { value: "nuevo", label: "Es mi primera vez con Hyenuk / El Club (Soy nuevo)." },
      { value: "seguidor", label: "Sigo el contenido pero aún no soy alumno." },
      { value: "alumno", label: "Ya soy (o he sido) alumno de un taller o membresía." },
    ]
  },
  {
    id: "topic",
    label: "Si tuvieras que elegir UN solo tema para profundizar en el Meetup, ¿cuál sería?",
    options: [
      { value: "crecimiento", label: "Crecimiento personal: Mentalidad y hábitos para el éxito." },
      { value: "inversiones", label: "Inversiones: Cómo poner a trabajar mi dinero a largo plazo." },
      { value: "finanzas", label: "Finanzas: Cómo organizar mis cuentas y salir de deudas." },
      { value: "trading", label: "Trading: Cómo entender los mercados." },
    ]
  },
  {
    id: "experience",
    label: "¿Cuál es tu nivel de experiencia en el mundo de las inversiones?",
    options: [
      { value: "nivel0", label: "Nivel 0: Solo tengo curiosidad, no he empezado." },
      { value: "nivel1", label: "Nivel 1: He estudiado pero aún no he puesto mi capital en marcha." },
      { value: "nivel2", label: "Nivel 2: Ya invierto de forma activa por mi cuenta." },
    ]
  },
  {
    id: "hurdle",
    label: "¿Qué es lo que más te detiene hoy para alcanzar tus objetivos financieros?",
    options: [
      { value: "dinero", label: "No tengo suficiente dinero para empezar" },
      { value: "guia", label: "No sé por dónde empezar" },
      { value: "miedo", label: "Me da miedo perder dinero" },
      { value: "constancia", label: "Me cuesta ser constante" },
      { value: "tiempo", label: "Tiempo" },
    ]
  }
];
