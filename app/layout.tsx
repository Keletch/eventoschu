import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Calendario HyenUk Chu | Lista de Espera",
  description: "Calendario de eventos de HyenUk Chu.",
  icons: {
    icon: "/cdi-favicon.png",
  },
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { CustomScrollbar } from "@/components/ui/custom-scrollbar";

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
            <Toaster position="bottom-right" expand={true} richColors />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
