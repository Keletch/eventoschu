"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { useTheme } from "next-themes";

interface LogoProps {
  onClick?: () => void;
}

export function Logo({ onClick }: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkish = mounted && (theme === "dark" || theme === "synthwave");

  return (
    <div className="flex items-center gap-2 shrink-0 min-w-[120px] md:min-w-[144px]">
      <Link 
        href="/" 
        onClick={(e: React.MouseEvent) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className="transition-transform hover:scale-105 active:scale-95 block h-10 md:h-12 w-[120px] md:w-[144px] cursor-pointer"
      >
        {mounted && theme === "light" ? (
          <Image
            src="/cdi-logo.png"
            alt="Club de Inversionistas"
            width={144}
            height={48}
            className="h-full w-full object-contain"
            priority
          />
        ) : (
          <div 
            className="block h-full w-full transition-colors duration-300"
            style={{ 
              backgroundColor: "var(--logo-color)",
              mask: "url('/cdi-logo.png') no-repeat center / contain",
              WebkitMask: "url('/cdi-logo.png') no-repeat center / contain"
            }}
            aria-label="Club de Inversionistas Logo"
          />
        )}
      </Link>
    </div>
  );
}
