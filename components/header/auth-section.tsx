'use client';
import React, { useEffect, useState } from 'react';
import { UserButton, SignInButton } from '@clerk/nextjs';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderAlerts, CampusSSOAlertNudge } from './header-alerts';
import { trackGTMEvent } from '@/lib/gtm-utils';

interface AuthSectionProps {
  isSignedIn: boolean;
  userId: string | null | undefined;
  notifications: any[];
  unreadCount: number;
  handleMarkAsRead: (id: string) => void;
  handleMarkAllRead: () => void;
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;
  step: number | null;
  isLoaded: boolean;
  isSurveyMissing?: boolean;
  setIsSurveyOpen?: (open: boolean) => void;
  onOpenSSOOnboarding?: () => void;
}

/**
 * AuthSection (V6 - Sin GSAP para Pruebas)
 * Eliminamos GSAP para verificar si es la causa de los parpadeos.
 */
export function AuthSection({
  isSignedIn,
  notifications,
  unreadCount,
  handleMarkAsRead,
  handleMarkAllRead,
  isNotifOpen,
  setIsNotifOpen,
  step,
  isLoaded,
  isSurveyMissing = false,
  setIsSurveyOpen,
  onOpenSSOOnboarding = () => {}
}: AuthSectionProps) {
  const [isFullyReady, setIsFullyReady] = useState(false);

  // Sincronización de preparación: Esperamos a que Clerk se asiente
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setIsFullyReady(true), 400);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Determinismo de la Campana
  const shouldShowBell = isLoaded && (isSignedIn || step === 2);

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 h-10">
        <div className="size-10" />
        <div className="size-10" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 h-10">
      {/* Slot de Alertas (Modular) */}
      <HeaderAlerts 
        isSurveyMissing={isSurveyMissing} 
        onOpenSurvey={() => setIsSurveyOpen?.(true)} 
      />

      {/* Slot de Notificaciones */}
      <div className="size-10 flex items-center justify-center">
        {shouldShowBell && (
          <div className="relative animate-in fade-in zoom-in duration-300">
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
      </div>

      {/* Librito — campus Thinkific, junto al login */}
      <CampusSSOAlertNudge onClick={onOpenSSOOnboarding} />

      {/* Slot de Usuario */}
      <div className="size-10 flex items-center justify-center">
        <div className={cn(
          "relative size-10 rounded-xl bg-accent overflow-hidden flex items-center justify-center transition-all duration-300",
          !isFullyReady ? "opacity-0 scale-90" : "opacity-100 scale-100"
        )}>
          {isSignedIn ? (
            <UserButton 
              appearance={{
                variables: {
                  colorForeground: "hsl(var(--foreground))",
                  colorMutedForeground: "hsl(var(--muted-foreground))",
                  colorBackground: "hsl(var(--card))",
                  colorPrimary: "hsl(var(--primary))"
                },
                elements: {
                  rootBox: "user-button-root-custom",
                  userButtonTrigger: "user-button-trigger-custom",
                  userButtonAvatarBox: "user-button-avatar-box-custom",
                  avatarBox: "size-10 rounded-xl",
                  userButtonPopoverCard: "shadow-xl border border-border bg-card text-foreground",
                  userButtonPopoverActions: "bg-card text-foreground",
                  userButtonPopoverActionButton: "text-foreground hover:bg-muted hover:text-foreground transition-colors",
                  userButtonPopoverActionButtonText: "text-foreground font-medium",
                  userButtonPopoverActionButtonIcon: "text-muted-foreground",
                  userButtonPopoverFooter: "bg-muted border-t border-border text-muted-foreground",
                  userButtonPopoverFooterButton: "text-muted-foreground hover:text-foreground",
                  userButtonPopoverUserPreview: "bg-card text-foreground border-b border-border",
                  userButtonPopoverUserPreviewTitle: "text-foreground font-semibold",
                  userButtonPopoverUserPreviewSubtitle: "text-muted-foreground",
                  userButtonPopoverMain: "bg-card text-foreground",
                  userButtonPopoverMainButton: "text-foreground hover:bg-muted"
                }
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button 
                onClick={() => trackGTMEvent("clerk_auth_initiated")}
                className="text-muted-foreground hover:text-foreground transition-colors w-full h-full flex items-center justify-center cursor-pointer"
              >
                <UserIcon className="h-5 w-5" />
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  );
}
