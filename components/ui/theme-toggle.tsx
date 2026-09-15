"use client";

import * as React from "react";
import { Sun, Moon, Gamepad2, Terminal, Coffee, Citrus, Ghost, Trees } from "lucide-react";
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
    // Ciclo alternado (Oscuro / Claro):
    // 1. light (Claro) -> 2. halloween-dark (Oscuro) -> 3. boreal (Claro) -> 4. synthwave (Oscuro) ->
    // 5. coffee (Claro) -> 6. hacker (Oscuro) -> 7. citric (Claro) -> 8. dark (Oscuro) -> light
    if (theme === "light") setTheme("halloween-dark");
    else if (theme === "halloween-dark") setTheme("boreal");
    else if (theme === "boreal") setTheme("synthwave");
    else if (theme === "synthwave") setTheme("coffee");
    else if (theme === "coffee") setTheme("hacker");
    else if (theme === "hacker") setTheme("citric");
    else if (theme === "citric") setTheme("dark");
    else setTheme("light"); 
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
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
