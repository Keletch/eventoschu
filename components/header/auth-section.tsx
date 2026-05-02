"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface AuthSectionProps {
  isSignedIn: boolean | undefined;
  isLoaded: boolean;
  userId: string | null | undefined;
  notifications: any[];
  unreadCount: number;
  handleMarkAsRead: (id: string) => void;
  handleMarkAllRead: () => void;
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;
}

export function AuthSection({
  isSignedIn,
  isLoaded,
  userId,
  notifications,
  unreadCount,
  handleMarkAsRead,
  handleMarkAllRead,
  isNotifOpen,
  setIsNotifOpen,
}: AuthSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animación de entrada para los elementos de autenticación
  useGSAP(() => {
    if (isLoaded && containerRef.current) {
      gsap.from(".auth-element", {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)",
        clearProps: "all"
      });
    }
  }, { dependencies: [isLoaded], scope: containerRef });

  // Mientras Clerk carga, mantenemos un espacio vacío del tamaño aproximado del UserButton+Bell
  if (!isLoaded) {
    return <div className="hidden sm:block w-[86px] h-10" />;
  }

  return (
    <div ref={containerRef} className="flex items-center gap-1.5 flex-shrink-0 pr-1">
      {userId && (
        <div className="auth-element">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllRead}
            isOpen={isNotifOpen}
            setIsOpen={setIsNotifOpen}
          />
        </div>
      )}
      {!isSignedIn ? (
        <div className="auth-element">
          <SignInButton mode="modal">
            <Button
              variant="ghost"
              className="flex items-center justify-center text-gray-600 hover:text-[#3154DC] hover:bg-blue-50/50 rounded-xl w-10 h-10 transition-all duration-300 border border-transparent hover:border-blue-100 group active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="!w-5 !h-5 opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Button>
          </SignInButton>
        </div>
      ) : (
        <div className="auth-element flex items-center justify-center w-10 h-10">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-xl"
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
