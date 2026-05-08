import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

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
import { CustomScrollbar } from "@/components/ui/custom-scrollbar";
import { VercelAnalytics } from "@/components/vercel-analytics";
import { VercelSpeedInsights } from "@/components/vercel-speed-insights";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es" className={`${raleway.variable} antialiased`} suppressHydrationWarning>
        <body className="flex flex-col font-sans">
          <TooltipProvider>
            {children}
            <CustomScrollbar />
            <VercelAnalytics />
            <VercelSpeedInsights />
            <Toaster position="bottom-right" expand={true} richColors />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
