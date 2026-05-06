"use client";

import React, { useRef } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { SocialIcon } from "./footer/social-icon";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ANIM_CONFIG } from "@/lib/animations";

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Animación de entrada suave coordinada con el sistema global
    gsap.fromTo(footerRef.current, 
      { opacity: 0, y: 10 },
      { 
        opacity: 1, 
        y: 0, 
        duration: ANIM_CONFIG.duration.slow, 
        delay: 0.6, // Un poco más de delay para que sea lo último en entrar
        ease: ANIM_CONFIG.ease.out,
        clearProps: "all"
      }
    );
  }, { scope: footerRef });

  return (
    <footer 
      ref={footerRef}
      className="w-full py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10 bg-[#3154dc] relative z-[60]"
    >
      <div className="flex flex-col md:flex-row items-center gap-0.5 md:gap-3">
        <p className="text-[10px] font-bold text-white tracking-[0.05em] uppercase opacity-80">
          @elclubdeinversionistas | Todos los derechos reservados
        </p>
        <p className="text-[9px] font-medium text-white/40 italic">
          Educación financiera y trading de alto nivel
        </p>
      </div>

      <div className="flex items-center gap-3">
        {SOCIAL_LINKS.map((social) => (
          <SocialIcon key={social.name} name={social.name} href={social.href} />
        ))}
      </div>
    </footer>
  );
}
