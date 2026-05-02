"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useUserNotifications } from "@/hooks/user/use-user-notifications";

// Modular Components
import { Logo } from "./header/logo";
import { DesktopNav } from "./header/desktop-nav";
import { MobileNav } from "./header/mobile-nav";
import { AuthSection } from "./header/auth-section";

interface HeaderProps {
  registrationId?: string | null;
  step?: number | null;
}

export function Header({ registrationId, step }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { 
    notifications, 
    unreadCount, 
    handleMarkAsRead, 
    handleMarkAllRead, 
    isOpen: isNotifOpen, 
    setIsOpen,
    isSignedIn: authSignedIn,
    isLoaded,
    userId 
  } = useUserNotifications(registrationId);

  // La campana solo vive en Paso 2 para anónimos, o siempre para logueados
  const showBell = authSignedIn || step === 2;
  const effectiveUserId = showBell ? userId : null;

  return (
    <header className="w-full flex justify-center pt-6 md:pt-8 px-4 md:px-6 relative z-50">
      <div className="w-full max-w-[1372px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[32px] px-6 md:px-10 py-4 md:py-5 flex items-center justify-between transition-all duration-500 hover:shadow-[0_8px_40px_0_rgba(31,38,135,0.12)] hover:bg-white/90">
        <Logo />

        <DesktopNav />

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        <AuthSection 
          isSignedIn={authSignedIn}
          isLoaded={isLoaded}
          userId={effectiveUserId}
          notifications={notifications}
          unreadCount={unreadCount}
          handleMarkAsRead={handleMarkAsRead}
          handleMarkAllRead={handleMarkAllRead}
          isNotifOpen={isNotifOpen}
          setIsNotifOpen={setIsOpen}
        />
      </div>

      <MobileNav 
        isOpen={isMobileMenuOpen} 
        isSignedIn={authSignedIn} 
      />
    </header>
  );
}
