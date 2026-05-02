"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";

interface AuthSectionProps {
  isSignedIn: boolean | undefined;
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
  userId,
  notifications,
  unreadCount,
  handleMarkAsRead,
  handleMarkAllRead,
  isNotifOpen,
  setIsNotifOpen,
}: AuthSectionProps) {
  return (
    <div className="flex items-center gap-3">
      {userId && (
        <NotificationBell 
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllRead}
          isOpen={isNotifOpen}
          setIsOpen={setIsNotifOpen}
        />
      )}
      {!isSignedIn ? (
        <SignInButton mode="modal">
          <Button variant="ghost" className="hidden sm:flex text-gray-500 font-bold hover:text-blue-700 rounded-xl px-4 transition-colors">
            Entrar
          </Button>
        </SignInButton>
      ) : (
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 rounded-xl"
            }
          }}
        />
      )}
    </div>
  );
}
