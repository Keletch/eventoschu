"use client";

import * as React from "react";
import { Sun, Moon, Gamepad2, Terminal, Coffee, Citrus, Ghost, Trees, Gift, Snowflake } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const toggleTheme = () => {
    // Ciclo (temporada navideña primero; navidad-noche es el tema inicial en los layouts):
    // 1. navidad-noche (Oscuro) -> 2. navidad (Claro) -> 3. light (Claro) -> 4. halloween-dark (Oscuro) ->
    // 5. boreal (Claro) -> 6. synthwave (Oscuro) -> 7. coffee (Claro) -> 8. hacker (Oscuro) ->
    // 9. citric (Claro) -> 10. dark (Oscuro) -> navidad-noche
    if (theme === "navidad-noche") setTheme("navidad");
    else if (theme === "navidad") setTheme("light");
    else if (theme === "light") setTheme("halloween-dark");
    else if (theme === "halloween-dark") setTheme("boreal");
    else if (theme === "boreal") setTheme("synthwave");
    else if (theme === "synthwave") setTheme("coffee");
    else if (theme === "coffee") setTheme("hacker");
    else if (theme === "hacker") setTheme("citric");
    else if (theme === "citric") setTheme("dark");
    else setTheme("navidad-noche");
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-xl opacity-0">
        <div className="size-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-xl hover:bg-muted/50 transition-all relative overflow-hidden"
      title={`Cambiar tema (Actual: ${theme})`}
    >
      {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem] text-muted-foreground animate-in zoom-in" />}
      {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem] text-muted-foreground animate-in zoom-in" />}
      {theme === "synthwave" && <Gamepad2 className="h-[1.2rem] w-[1.2rem] text-primary animate-in zoom-in" />}
      {theme === "hacker" && <Terminal className="h-[1.2rem] w-[1.2rem] text-primary animate-in zoom-in" />}
      {theme === "coffee" && <Coffee className="h-[1.2rem] w-[1.2rem] text-primary animate-in zoom-in" />}
      {theme === "citric" && <Citrus className="h-[1.2rem] w-[1.2rem] text-primary animate-in zoom-in" />}
      {theme === "halloween-dark" && <Ghost className="h-[1.2rem] w-[1.2rem] text-primary animate-in zoom-in" />}
      {theme === "boreal" && <Trees className="h-[1.2rem] w-[1.2rem] text-primary animate-in zoom-in" />}
      {theme === "navidad" && <Gift className="h-[1.2rem] w-[1.2rem] text-primary animate-in zoom-in" />}
      {theme === "navidad-noche" && <Snowflake className="h-[1.2rem] w-[1.2rem] text-secondary animate-in zoom-in" />}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
