"use client";

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

export function Header({ 
  registrationId, 
  step, 
  onToggleSidebar, 
  isSidebarOpen,
  isSurveyMissing = false,
  setIsSurveyOpen
}: HeaderProps) {
  const { isSignedIn, isLoaded } = useAuth();

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

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-center px-4 md:px-8 z-[60]">
      <div className="w-full max-w-[1512px] flex items-center justify-between">
        
        {/* 1. Izquierda: Hamburguesa + Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Logo onClick={onToggleSidebar} />
        </div>

        {/* 2. Centro: Espacio vacío (YouTube Style) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          {/* Aquí podría ir un SearchBar en el futuro */}
        </div>

        {/* 3. Derecha: AuthSection */}
        <div className="flex items-center">
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
        </div>
      </div>
    </header>
  );
}
