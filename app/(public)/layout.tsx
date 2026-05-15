import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "../globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Calendario de Eventos HyenUk Chu | Club de Inversionistas",
  description: "Reserva tu cupo para las giras y talleres presenciales de HyenUk Chu. Únete a la comunidad del Club de Inversionistas y fortalece tus conexiones.",
  keywords: ["HyenUk Chu", "Club de Inversionistas", "Inversiones", "Eventos Presenciales", "Trading", "Talleres de Inversión"],
  authors: [{ name: "HyenUk Chu" }],
  creator: "Club de Inversionistas",
  openGraph: {
    title: "Calendario de Eventos HyenUk Chu | Club de Inversionistas",
    description: "Espacio exclusivo para compartir y fortalecer conexiones con HyenUk Chu.",
    url: "https://calendario.chu.mx",
    siteName: "Calendario HyenUk Chu",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos Presenciales HyenUk Chu",
    description: "Reserva tu cupo para los próximos eventos y talleres.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  }
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { esES } from "@clerk/localizations";
import { CustomScrollbar } from "@/components/ui/custom-scrollbar-wrapper";
import { VercelAnalytics } from "@/components/providers/vercel-analytics";
import { VercelSpeedInsights } from "@/components/providers/vercel-speed-insights";

import { ThemeProvider } from "@/components/providers/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      localization={esES}
      ui={ui}
      appearance={{
        variables: {
          colorPrimary: 'var(--primary)',
          colorBackground: 'var(--card)',
          colorForeground: 'var(--foreground)',
          colorInput: 'var(--input)',
          colorInputForeground: 'var(--foreground)',
          colorMutedForeground: 'var(--muted-foreground)',
        },
        elements: {
          modalBackdrop: "bg-transparent backdrop-blur-lg",
          card: "!bg-card border border-border shadow-2xl rounded-[32px] !text-foreground",
          headerTitle: "!text-foreground font-bold text-2xl",
          headerSubtitle: "!text-muted-foreground text-sm",
          socialButtonsBlockButton: "!bg-surface !border-surface-border !text-surface-foreground hover:!bg-surface/80 rounded-xl transition-all",
          socialButtonsBlockButtonText: "!text-surface-foreground font-semibold",
          socialButtonsBlockButtonArrow: "!text-surface-foreground",
          formFieldLabel: "!text-foreground font-semibold text-xs uppercase tracking-wider",
          formFieldInput: "!bg-input border-border !text-foreground rounded-xl focus:!ring-primary/50",
          footerActionText: "!text-muted-foreground",
          footerActionLink: "text-primary hover:text-primary/80 font-bold",
          formButtonPrimary: "!bg-primary !text-primary-foreground hover:opacity-90 rounded-xl py-3 text-base shadow-lg shadow-primary/20",
          formFieldInputShowPasswordButton: "!text-muted-foreground",
          dividerLine: "bg-border/50",
          dividerText: "!text-muted-foreground text-xs uppercase font-bold",
          identityPreviewText: "!text-foreground",
          identityPreviewEditButtonIcon: "!text-primary",
          modalCloseButton: "!text-foreground/60 hover:!text-foreground transition-colors",
          badge: "bg-primary text-primary-foreground border-primary px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider",
          logoBox: "dark:invert dark:brightness-200 synthwave:invert synthwave:brightness-200 hacker:invert hacker:brightness-200",
        }
      }}
    >
      <html lang="es" className={`${raleway.variable} antialiased`} suppressHydrationWarning>
        <body className="flex flex-col font-sans bg-background text-foreground transition-colors duration-300 min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            themes={["light", "dark", "synthwave", "hacker", "coffee"]}
          >
            <TooltipProvider>
              <div className="retro-grid" />
              {children}
              <CustomScrollbar />
              <VercelAnalytics />
              <VercelSpeedInsights />
                            <Toaster 
                position="bottom-right" 
                expand={true} 
                richColors 
                toastOptions={{
                  className: "!bg-card !text-foreground !border-border !rounded-[20px] !shadow-xl font-sans",
                }}
              />

            <div className="grain-overlay" />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
