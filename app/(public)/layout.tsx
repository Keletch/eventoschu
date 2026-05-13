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
      appearance={{
        elements: {
          modalBackdrop: "bg-transparent backdrop-blur-lg"
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
            themes={["light", "dark", "synthwave"]}
          >
            <TooltipProvider>
              <div className="retro-grid" />
              {children}
              <CustomScrollbar />
              <VercelAnalytics />
              <VercelSpeedInsights />
              <Toaster position="bottom-right" expand={true} richColors />
            <div className="grain-overlay" />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
