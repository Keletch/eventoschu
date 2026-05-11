"use client";

import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";

export function VercelAnalytics() {
  const pathname = usePathname();

  // Excluir rutas de administración
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <Analytics />;
}
