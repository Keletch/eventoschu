"use client";
import React from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useUserNotifications } from "@/hooks/user/use-user-notifications";

// Modular Components
import { Logo } from "./header/logo";
import { AuthSection } from "./header/auth-section";

interface HeaderProps {
  registrationId?: string | null;
  step?: number | null;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isSurveyMissing?: boolean;
  setIsSurveyOpen?: (open: boolean) => void;
}

import { ThemeToggle } from "./ui/theme-toggle";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function Header({ 
  registrationId, 
  step, 
  onToggleSidebar, 
  isSidebarOpen,
  isSurveyMissing = false,
  setIsSurveyOpen
}: HeaderProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const headerRef = React.useRef<HTMLDivElement>(null);

  const { 
    notifications, 
    unreadCount, 
    isLoading,
    handleMarkAsRead, 
    handleMarkAllRead, 
    isOpen, 
    setIsOpen,
    userId 
  } = useUserNotifications(registrationId);

  useGSAP((context, contextSafe) => {
    gsap.fromTo(".header-animate-item", 
      { opacity: 0, scale: 0.8, y: -10 },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        delay: 0.2,
        ease: "back.out(1.7)",
        onComplete: contextSafe(() => {
          // Limpieza profesional usando el selector del contexto
          const items = context.selector?.(".header-animate-item");
          if (items) {
            items.forEach((item: any) => item.classList.remove("opacity-0"));
          }
        })
      }
    );
  }, { scope: headerRef });

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-center px-4 md:px-8 z-[60]">
      <div className="w-full max-w-[1512px] flex items-center justify-between">
        
        {/* 1. Izquierda: Hamburguesa + Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="header-animate-item opacity-0 p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="header-animate-item opacity-0">
            <Logo onClick={onToggleSidebar} />
          </div>
        </div>

        {/* 2. Centro: Espacio vacío (YouTube Style) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          {/* Aquí podría ir un SearchBar en el futuro */}
        </div>

        {/* 3. Derecha: AuthSection + ThemeToggle */}
        <div className="flex items-center gap-4">
          <AuthSection 
            isSignedIn={!!isSignedIn}
            isLoaded={isLoaded}
            userId={userId || undefined}
            notifications={notifications}
            unreadCount={unreadCount}
            handleMarkAsRead={handleMarkAsRead}
            handleMarkAllRead={handleMarkAllRead}
            isNotifOpen={isOpen}
            setIsNotifOpen={setIsOpen}
            step={step || null}
            isSurveyMissing={isSurveyMissing}
            setIsSurveyOpen={setIsSurveyOpen}
          />
          <div className="header-animate-item opacity-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
