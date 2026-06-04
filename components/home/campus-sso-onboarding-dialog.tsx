"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";
import { Key, UserCheck, ShieldCheck, HelpCircle, MousePointerClick, AlertTriangle } from "lucide-react";
import { trackGTMEvent } from "@/lib/gtm-utils";

interface CampusSSOOnboardingDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function CampusSSOOnboardingDialog({
  isOpen,
  setIsOpen,
}: CampusSSOOnboardingDialogProps) {
  const { openSignIn } = useClerk();

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleDismissForever = () => {
    localStorage.setItem("chu_onboarding_dismissed", "true");
    setIsOpen(false);
  };

  const handleSignIn = () => {
    trackGTMEvent("clerk_auth_initiated_onboarding");
    localStorage.setItem("chu_onboarding_dismissed", "true");
    setIsOpen(false);
    openSignIn({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[720px] w-[calc(100%-2rem)] mx-4 sm:mx-auto rounded-[32px] p-0 bg-card text-foreground border-border shadow-2xl z-[250] outline-none flex flex-col max-h-[90vh]"
      >
        {/* Área scrollable sin scrollbar */}
        <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-6 md:p-8">
            <DialogHeader className="space-y-3">
              {/* Ícono centrado */}
              <div className="flex justify-center mb-1">
                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Key className="size-7 animate-pulse-gentle" />
                </div>
              </div>
              <DialogTitle className="text-2xl font-black leading-tight text-center">
                ¡Nuevo beneficio para miembros!
              </DialogTitle>
              <DialogDescription className="text-center text-sm font-medium text-muted-foreground">
                Al iniciar sesión o verificar el correo del campus, podrás acceder a cupones exclusivos (cuando estén disponibles) según tu nivel de membresía.
              </DialogDescription>
            </DialogHeader>

            <div className="pt-5 space-y-4">
              {/* 1. Cupones */}
              <div className="flex gap-4 items-start">
                <div className="size-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                  <ShieldCheck className="size-4.5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-sm font-bold text-foreground">Cupones según tu membresía</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Si tienes una membresía activa, los botones de compra se transformarán en enlaces al carrito con cupones exclusivos aplicados automáticamente para tu nivel de suscripción.
                  </p>
                </div>
              </div>

              {/* 2. Correo del campus */}
              <div className="flex gap-4 items-start">
                <div className="size-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                  <UserCheck className="size-4.5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-sm font-bold text-foreground">Usa el correo de tu campus</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Para que la vinculación sea automática, inicia sesión en el calendario usando{" "}
                    <span className="font-bold text-foreground">exactamente el mismo correo</span>{" "}
                    con el que estás inscrito en el campus.
                  </p>
                </div>
              </div>

              {/* 3. Correos distintos */}
              <div className="flex gap-4 items-start">
                <div className="size-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                  <HelpCircle className="size-4.5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-sm font-bold text-foreground">¿Tienes correos distintos?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Si ya iniciaste sesión o te registraste en algún evento con un correo diferente al del campus, inicia sesión con ese correo y luego añade el correo de tu campus como dirección secundaria para que ambos queden vinculados correctamente.
                  </p>
                </div>
              </div>

              {/* 4. Sin sesión: verificación desde la tarjeta */}
              <div className="flex gap-4 items-start">
                <div className="size-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                  <MousePointerClick className="size-4.5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-sm font-bold text-foreground">¿Prefieres no iniciar sesión?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cada tarjeta de evento pagado tiene un botón para verificar tu correo directamente y comprobar si eres candidato a cupón, sin necesidad de crear una cuenta.
                  </p>
                  {/* Advertencia */}
                  <div className="mt-2 flex gap-2 items-start rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                    <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                      <span className="font-bold">Importante:</span> no uses el correo de otra persona para acceder a cupones que no te corresponden. El acceso puede ser revocado y existe la posibilidad de no recuperar completamente el dinero del evento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer fijo — fuera del scroll */}
        <div className="px-6 md:px-8 pt-6 pb-4 md:pt-8 md:pb-5 space-y-3 border-t border-border shrink-0">
          {/* Botones */}
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDismiss}
              className="flex-1 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
            >
              Continuar sin iniciar sesión
            </Button>
            <Button
              type="button"
              onClick={handleSignIn}
              className="flex-1 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20"
            >
              Iniciar Sesión / Registrarse
            </Button>
          </div>

          {/* Dismiss permanente */}
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={handleDismissForever}
              className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground underline underline-offset-2 transition-colors"
            >
              Ya entendí, no volver a mostrar este aviso
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
