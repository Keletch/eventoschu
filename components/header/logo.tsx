"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  onClick?: () => void;
}

export function Logo({ onClick }: LogoProps) {
  return (
    <div className="flex items-center gap-2 shrink-0 min-w-[120px] md:min-w-[144px]">
      <Link 
        href="/" 
        suppressHydrationWarning
        onClick={(e: React.MouseEvent) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className="transition-transform hover:scale-105 active:scale-95 block h-10 md:h-12 w-[120px] md:w-[144px] cursor-pointer relative"
      >
        {/* Light theme logo: imagen directa nítida */}
        <div className="logo-light-img w-full h-full">
          <Image
            src="/cdi-logo.png"
            alt="Club de Inversionistas"
            width={144}
            height={48}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        {/* Temas alternativos (dark, synthwave, hacker, coffee, boreal, halloween-dark, etc.): color camaleónico */}
        <div 
          className="logo-mask-theme h-full w-full transition-colors duration-300"
          style={{ 
            backgroundColor: "var(--logo-color)",
            mask: "url('/cdi-logo.png') no-repeat center / contain",
            WebkitMask: "url('/cdi-logo.png') no-repeat center / contain"
          }}
          aria-label="Club de Inversionistas Logo"
        />
      </Link>
    </div>
  );
}
