"use client";

import dynamic from "next/dynamic";

export const CustomScrollbar = dynamic(
  () => import("./custom-scrollbar").then((mod) => mod.CustomScrollbar),
  { ssr: false }
);
