import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "../globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { ThemeProvider } from "@/components/providers/theme-provider";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Panel de Gestión | Club de Inversionistas",
  description: "Administración centralizada de eventos e inscripciones.",
  robots: { index: false, follow: false } // No queremos que Google indexe el admin
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
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
              <Toaster position="bottom-right" expand={true} richColors />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
