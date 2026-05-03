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
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-2 text-gray-600 font-bold hover:text-[#3154DC] hover:bg-blue-50/50 rounded-xl px-5 py-2.5 transition-all duration-300 border border-transparent hover:border-blue-100 group active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-70 group-hover:opacity-100 transition-opacity"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
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
