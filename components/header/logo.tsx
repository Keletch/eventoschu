"use client";

import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
        <Image
          src="/cdi-logo.png"
          alt="Club de Inversionistas"
          width={180}
          height={60}
          className="h-10 md:h-12 w-auto object-contain"
          priority
        />
      </Link>
    </div>
  );
}
