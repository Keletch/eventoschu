"use client";

import React from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { SocialIcon } from "./footer/social-icon";

export function Footer() {
  return (
    <footer className="w-full py-8 px-6 flex flex-col items-center gap-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm mt-8">
      <div className="flex items-center gap-4">
        {SOCIAL_LINKS.map((social) => (
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
