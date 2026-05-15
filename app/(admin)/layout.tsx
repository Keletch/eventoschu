import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "../globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
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
                            <Toaster 
                position="bottom-right" 
                expand={true} 
                richColors 
                toastOptions={{
                  className: "!bg-card !text-foreground !border-border !rounded-[20px] !shadow-xl font-sans",
                }}
              />

            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
