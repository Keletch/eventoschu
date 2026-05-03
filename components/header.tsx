"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useUserNotifications } from "@/hooks/user/use-user-notifications";

// Modular Components
import { Logo } from "./header/logo";
import { DesktopNav } from "./header/desktop-nav";
import { MobileNav } from "./header/mobile-nav";
import { AuthSection } from "./header/auth-section";

interface HeaderProps {
  registrationId?: string | null;
}

export function Header({ registrationId }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const { 
    notifications, 
    unreadCount, 
    handleMarkAsRead, 
    handleMarkAllRead, 
    isOpen, 
    setIsOpen,
    userId 
  } = useUserNotifications(registrationId);

  return (
    <header className="w-full flex justify-center pt-6 md:pt-8 px-4 md:px-8 lg:px-12 relative z-50">
      <div className="w-full max-w-[1372px] grid grid-cols-[1fr_auto_1fr] items-center bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[32px] px-6 py-3 md:py-4 transition-all duration-500 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.12)]">
        
        {/* 1. Logo (Izquierda) */}
        <div className="flex justify-start min-w-[120px] md:min-w-[180px]">
          <Logo />
        </div>

        {/* 2. Navegación (Centro - Absolutamente centrado) */}
        <div className="flex justify-center">
          <div className="hidden lg:block">
            <DesktopNav />
          </div>
          
          {/* Mobile Toggle (Solo visible en móviles) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* 3. Acciones/Auth (Derecha) */}
        <div className="flex justify-end">
          <AuthSection 
            isSignedIn={isSignedIn}
            userId={userId}
            notifications={notifications}
            unreadCount={unreadCount}
            handleMarkAsRead={handleMarkAsRead}
            handleMarkAllRead={handleMarkAllRead}
            isNotifOpen={isOpen}
            setIsNotifOpen={setIsOpen}
          />
        </div>
      </div>

      {/* Menú Móvil */}
      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        isSignedIn={isSignedIn}
      />
    </header>
  );
}
