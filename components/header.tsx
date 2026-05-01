"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useUserNotifications } from "@/hooks/user/use-user-notifications";

// Modular Components
import { Logo } from "./header/logo";
import { DesktopNav } from "./header/desktop-nav";
import { MobileNav } from "./header/mobile-nav";
import { AuthSection } from "./header/auth-section";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    handleMarkAsRead, 
    handleMarkAllRead, 
    isOpen, 
    setIsOpen,
    isSignedIn 
  } = useUserNotifications();

  return (
    <header className="w-full flex justify-center pt-6 md:pt-8 px-4 md:px-8 lg:px-12 relative z-50">
      <div className="w-full max-w-[1440px] flex items-center justify-between gap-4">
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
          isSignedIn={isSignedIn}
          notifications={notifications}
          unreadCount={unreadCount}
          handleMarkAsRead={handleMarkAsRead}
          handleMarkAllRead={handleMarkAllRead}
          isNotifOpen={isOpen}
          setIsNotifOpen={setIsOpen}
        />
      </div>

      <MobileNav 
        isOpen={isMobileMenuOpen} 
        isSignedIn={isSignedIn} 
      />
    </header>
  );
}
