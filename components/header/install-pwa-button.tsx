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
                               window.matchMedia('(display-mode: minimal-ui)').matches || 
                               window.matchMedia('(display-mode: fullscreen)').matches || 
                               window.matchMedia('(display-mode: window-controls-overlay)').matches || 
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

    // Revisar si el evento ya se disparó antes de que React montara este componente
    if (typeof window !== 'undefined' && (window as any).deferredPWAPrompt) {
      setTimeout(() => {
        setDeferredPrompt((window as any).deferredPWAPrompt);
        setIsInstallable(true);
      }, 0);
    }

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
      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors shadow-md"
    >
      <Download className="w-4 h-4" />
      <span>Instalar App</span>
    </button>
  );
}
