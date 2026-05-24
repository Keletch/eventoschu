"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      // Verificamos si ya está instalada
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone || 
                               document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);

      // Detección de iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);
    }, 0);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else if (isIOS && !isStandalone) {
      alert("Para instalar en iOS: toca el botón de 'Compartir' (el cuadrado con la flecha hacia arriba) y selecciona 'Agregar a Inicio'.");
    }
  };

  // No mostrar si ya está en modo standalone (instalada)
  if (isStandalone) return null; 
  // Mostrar si es instalable en Android/Desktop o si es iOS
  if (!isInstallable && !isIOS) return null;

  return (
    <button 
      onClick={handleInstallClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors shadow-sm"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Instalar App</span>
    </button>
  );
}
