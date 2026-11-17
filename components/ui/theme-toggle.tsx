"use client";

import * as React from "react";
import { Sun, Moon, Gamepad2, Terminal, Coffee, Citrus, Ghost, Trees, Gift, Snowflake } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme, themes } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  // El ciclo sigue el orden de `themes` del ThemeProvider de cada layout (público: solo navidad).
  const cycle = themes.filter((t) => t !== "system");

  React.useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  // Tema guardado que este layout ya no ofrece (ej. "hacker" desde el admin) → primer tema del ciclo.
  React.useEffect(() => {
    if (!mounted || !theme || !cycle.length || cycle.includes(theme)) return;
    document.documentElement.classList.remove(theme); // next-themes solo limpia los temas listados
    setTheme(cycle[0]);
  }, [mounted, theme, cycle, setTheme]);

  const toggleTheme = () => {
    const i = cycle.indexOf(theme ?? "");
    setTheme(cycle[(i + 1) % cycle.length]);
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
