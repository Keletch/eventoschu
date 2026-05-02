"use client";

import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <div className="flex items-center gap-2 shrink-0 min-w-[120px] md:min-w-[144px]">
      <Link href="/" className="transition-transform hover:scale-105 active:scale-95 block h-10 md:h-12 w-[120px] md:w-[144px]">
        <Image
          src="/cdi-logo.png"
          alt="Club de Inversionistas"
          width={144}
          height={48}
          className="h-full w-full object-contain"
          priority
        />
      </Link>
    </div>
  );
}
