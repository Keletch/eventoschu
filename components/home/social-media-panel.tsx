"use client";

import React from "react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  Facebook: (
    <svg className="size-8 md:size-12" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  Instagram: (
    <svg className="size-8 md:size-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Youtube: (
    <svg className="size-8 md:size-12" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 0 0-2.122 2.136C0 8.055 0 12 0 12s0 3.945.501 5.814a3.017 3.017 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  TikTok: (
    <svg className="size-8 md:size-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  ),
  X: (
    <svg className="size-8 md:size-12" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  ),
};

const SOCIALS = [
  { 
    name: "Instagram", 
    href: "https://www.instagram.com/elclubdeinversionistas?utm_source=eventos_cdi&utm_medium=step2_social&utm_campaign=ecosistema_cdi&utm_content=instagram",
    color: "text-primary"
  },
  { 
    name: "Facebook", 
    href: "https://www.facebook.com/somoscdi?utm_source=eventos_cdi&utm_medium=step2_social&utm_campaign=ecosistema_cdi&utm_content=facebook",
    color: "text-primary"
  },
  { 
    name: "Youtube", 
    href: "https://www.youtube.com/channel/UCIOxD-w2fEkmd-IUCjhn-ZQ?utm_source=eventos_cdi&utm_medium=step2_social&utm_campaign=ecosistema_cdi&utm_content=youtube",
    color: "text-primary"
  },
  { 
    name: "TikTok", 
    href: "https://www.tiktok.com/@hyenukchu?utm_source=eventos_cdi&utm_medium=step2_social&utm_campaign=ecosistema_cdi&utm_content=tiktok",
    color: "text-primary"
  },
  { 
    name: "X", 
    href: "https://x.com/somoscdi?utm_source=eventos_cdi&utm_medium=step2_social&utm_campaign=ecosistema_cdi&utm_content=twitter",
    color: "text-primary"
  },
];

export function SocialMediaPanel() {
  return (
    <div className="max-w-[1372px] mx-auto mt-12 bg-muted dark:bg-muted/50 border border-border rounded-[32px] py-12 md:py-16 px-8 md:px-12 shadow-none text-center space-y-10">
      <h3 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
        No te pierdas ninguna novedad ¡Síguenos!
      </h3>

      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {SOCIALS.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 transition-transform hover:scale-110 active:scale-95"
            aria-label={social.name}
          >
            <div className="size-16 md:size-24 rounded-full bg-card border border-border/50 shadow-sm flex items-center justify-center transition-shadow group-hover:shadow-md">
              <span className={cn(social.color)}>
                {ICONS[social.name]}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
