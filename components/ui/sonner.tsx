"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme, theme } = useTheme()
  // Sonner solo entiende 'light' | 'dark' | 'system'
  const isDark = resolvedTheme === "dark" || 
    ["dark", "halloween-dark", "boreal", "synthwave", "coffee", "hacker"].includes(theme || "");
  const sonnerTheme = isDark ? "dark" : "light";

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 shrink-0 text-emerald-500" />
        ),
        info: (
          <InfoIcon className="size-4 shrink-0 text-blue-500" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 shrink-0 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-4 shrink-0 text-red-500" />
        ),
        loading: (
          <Loader2Icon className="size-4 shrink-0 animate-spin text-primary" />
        ),
      }}
      closeButton={false}
      toastOptions={{
        closeButton: false,
        classNames: {
          toast: "!bg-card !text-foreground !border !border-border !shadow-2xl !rounded-[24px] font-sans p-4",
          title: "font-semibold text-sm !text-foreground",
          description: "text-xs !text-muted-foreground leading-relaxed mt-0.5",
          actionButton: "bg-primary text-primary-foreground font-medium rounded-lg text-xs px-3 py-1.5",
          cancelButton: "bg-muted text-muted-foreground font-medium rounded-lg text-xs px-3 py-1.5",
          closeButton: "!hidden",
          success: "!bg-card !text-foreground !border-emerald-500/40",
          error: "!bg-card !text-foreground !border-red-500/40",
          warning: "!bg-card !text-foreground !border-amber-500/40",
          info: "!bg-card !text-foreground !border-blue-500/40",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
