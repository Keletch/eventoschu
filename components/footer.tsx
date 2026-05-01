const SocialIcon = ({ name, href }: { name: string; href: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
    Instagram: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    Youtube: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 0 0-2.122 2.136C0 8.055 0 12 0 12s0 3.945.501 5.814a3.017 3.017 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    X: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
    Twitch: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.571zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    ),
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3 bg-neutral-50 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-110 active:scale-95 group shadow-sm border border-transparent hover:border-blue-100"
      aria-label={name}
    >
      {icons[name]}
    </a>
  );
};

export function Footer() {
  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/somoscdi?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=facebook" },
    { name: "Instagram", href: "https://www.instagram.com/elclubdeinversionistas?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=instagram" },
    { name: "Youtube", href: "https://www.youtube.com/channel/UCIOxD-w2fEkmd-IUCjhn-ZQ?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=youtube" },
    { name: "X", href: "https://x.com/somoscdi?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=twitter" },
    { name: "Twitch", href: "https://www.twitch.tv/hyenukchu?utm_source=eventos_cdi&utm_medium=footer_social&utm_campaign=ecosistema_cdi&utm_content=twitch" },
  ];

  return (
    <footer className="w-full py-8 px-6 flex flex-col items-center gap-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm mt-8">
      <div className="flex items-center gap-4">
        {socialLinks.map((social) => (
          <SocialIcon key={social.name} name={social.name} href={social.href} />
        ))}
      </div>
      
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
          @elclubdeinversionistas | Todos los derechos reservados
        </p>
        <p className="text-[9px] font-medium text-gray-400 opacity-60">
          Educación financiera y trading de alto nivel
        </p>
      </div>
    </footer>
  );
}
