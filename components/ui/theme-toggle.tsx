"use client";

import * as React from "react";
import { Sun, Moon, Gamepad2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Ciclo: light -> dark -> synthwave -> light
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("synthwave");
    else setTheme("light"); // Maneja 'system' o cualquier otro valor enviándolo a 'light'
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
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
