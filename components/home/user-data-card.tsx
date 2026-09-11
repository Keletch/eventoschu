"use client";

import { Loader2, Info, Edit3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInButton } from "@clerk/nextjs";
import { trackGTMEvent } from "@/lib/gtm-utils";
import { cn } from "@/lib/utils";
import { STATUS_CONFIGS, RegistrationStatus } from "@/components/home/utils/home-constants";
import { EventUIConfig } from "@/lib/event-config";

interface UserDataCardProps {
  displayData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneCode: string;
    country: string;
    city: string;
  };
  status: string;
  eventTitle: string;
  eventCity: string;
  eventCountry: string;
  isLoadingEvents: boolean;
  isEditing: boolean;
  editFormData: any;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsEditing: (val: boolean) => void;
  setEditFormData: (val: any) => void;
  isSubmitting: boolean;
  handleUpdateRegistration: () => Promise<void>;
  isSignedIn: boolean | undefined;
  eventConfig: EventUIConfig;
  currentEvent?: any;
  eventCounts?: Record<string, number>;
}

export function UserDataCard({
  displayData,
  status,
  eventTitle,
  eventCity,
  eventCountry,
  isLoadingEvents,
  isEditing,
  editFormData,
  handleEditChange,
  setIsEditing,
  setEditFormData,
  isSubmitting,
  handleUpdateRegistration,
  isSignedIn,
  currentEvent,
  eventCounts = {},
}: UserDataCardProps) {
  const badgeConfig = STATUS_CONFIGS[(status as RegistrationStatus) || "pending"] ?? STATUS_CONFIGS.pending;

  // 🧠 Para la tarjeta de datos, usamos las etiquetas simplificadas (Activo, Pendiente, Cancelado)
  const displayLabel = badgeConfig.label;

  return (
    <div className="max-w-[1372px] mx-auto bg-card rounded-[32px] p-8 md:p-12 lg:p-16 relative user-data-container border-[3px] border-border shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] transform backface-visibility-hidden antialiased">
      {/* Cabecera: Título + Badge de estado */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8 md:mb-12">
        {/* Información del Evento */}
        <div className="flex flex-col gap-1">
          {isLoadingEvents ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-64" />
            </div>
          ) : !currentEvent ? (
            <>
              <div className="flex items-center gap-1.5 text-muted-foreground font-black text-[12px] md:text-sm uppercase tracking-[0.15em]">
                <span>Sin selección</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight">
                No hay eventos registrados
              </h2>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-primary font-black text-[12px] md:text-sm uppercase tracking-[0.15em]">
                <span>{eventCity}</span>
                <span className="w-1 h-1 rounded-full bg-primary mx-0.5" />
                <span>{eventCountry}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                {eventTitle || "Evento"}
              </h2>
            </>
          )}
        </div>

        {/* Badge de estado */}
        <div className="shrink-0">
          {isLoadingEvents ? (
            <Skeleton className="h-10 w-32 md:w-40 rounded-2xl" />
          ) : !currentEvent ? (
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="px-4 py-1.5 rounded-xl font-bold text-[15px] flex items-center gap-2 bg-muted text-muted-foreground border border-border">
                <div className="size-2 rounded-full bg-muted-foreground/40" />
                No hay evento activo
              </div>
              <p className="text-[13px] font-medium text-muted-foreground">
                Selecciona un evento en el calendario para confirmar tu cupo.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center md:items-end gap-2">
              {(() => {
                const isClosed = currentEvent?.initial_status === 'pending';
                const eventTags = currentEvent?.event_tags?.map((et: any) => et.tags).filter(Boolean) || [];
                const isPagoCupo = isClosed && eventTags.some((t: any) => t.slug === 'pago_cupo');
                const confirmedCount = eventCounts[currentEvent?.id] || 0;
                const capacity = currentEvent?.capacity || 50;
                const isFull = confirmedCount >= capacity;

                const cardBadgeLabel = (status === 'pending' && isPagoCupo && isFull)
                  ? "Lista de espera"
                  : displayLabel;

                const descriptionText = (status === 'pending' && isPagoCupo)
                  ? (isFull 
                      ? "Cupos llenos. Te notificaremos si se abre un lugar disponible." 
                      : "Esperando pago para confirmar tu cupo")
                  : badgeConfig.description;

                return (
                  <>
                    <div className={cn("px-4 py-1.5 rounded-xl font-bold text-[15px] flex items-center gap-2 transition-all duration-500 transform backface-visibility-hidden", badgeConfig.bg, badgeConfig.text, badgeConfig.border, "border")}>
                      {badgeConfig.icon}
                      {cardBadgeLabel}
                    </div>
                    {descriptionText && (
                      <p className={cn("text-[13px] font-medium animate-in fade-in slide-in-from-top-1", badgeConfig.descriptionColor || "text-muted-foreground/80")}>
                        {descriptionText}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-8 lg:gap-y-12 pt-4">
        {isLoadingEvents ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))
        ) : (
          <>
            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground font-normal px-1 text-base">Nombre <span className="text-red-500">*</span></label>
              {isEditing ? (
                <Input 
                  name="firstName" 
                  value={editFormData?.firstName || ""} 
                  onChange={handleEditChange} 
                  className="h-10 md:h-11 rounded-xl border-border focus:ring-primary bg-muted text-foreground font-medium text-base transition-all" 
                />
              ) : (
                <div className="h-10 md:h-11 px-5 flex items-center bg-muted border border-border rounded-xl text-base text-foreground font-medium transition-all">
                  {displayData.firstName}
                </div>
              )}
            </div>

            {/* Apellido */}
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground font-normal px-1 text-base">Apellido <span className="text-red-500">*</span></label>
              {isEditing ? (
                <Input 
                  name="lastName" 
                  value={editFormData?.lastName || ""} 
                  onChange={handleEditChange} 
                  className="h-10 md:h-11 rounded-xl border-border focus:ring-primary bg-muted text-foreground font-medium text-base transition-all" 
                />
              ) : (
                <div className="h-10 md:h-11 px-5 flex items-center bg-muted border border-border rounded-xl text-base text-foreground font-medium transition-all">
                  {displayData.lastName}
                </div>
              )}
            </div>

            {/* Correo (solo lectura siempre) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground font-normal px-1 text-base">Correo electrónico <span className="text-red-500">*</span></label>
              <div className="h-10 md:h-11 px-5 flex items-center bg-muted border border-border rounded-xl text-base text-foreground font-medium truncate">
                {displayData.email}
              </div>
            </div>

            {/* País */}
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground font-normal px-1 text-base">País de residencia <span className="text-muted-foreground/60 font-normal ml-1">(opcional)</span></label>
              {isEditing ? (
                <Input 
                  name="country" 
                  value={editFormData?.country || ""} 
                  onChange={handleEditChange} 
                  className="h-10 md:h-11 rounded-xl border-border focus:ring-primary bg-muted text-foreground font-medium text-base transition-all" 
                />
              ) : (
                <div className="h-10 md:h-11 px-5 flex items-center bg-muted border border-border rounded-xl text-base text-foreground font-medium transition-all">
                  {displayData.country || "No especificado"}
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground font-normal px-1 text-base">WhatsApp <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="w-16 h-10 md:h-11 flex items-center justify-center bg-muted border border-border rounded-xl text-base text-foreground font-medium">
                  {displayData.phoneCode}
                </div>
                {isEditing ? (
                  <Input 
                    name="phone" 
                    value={editFormData?.phone || ""} 
                    onChange={handleEditChange} 
                    className="h-10 md:h-11 rounded-xl flex-1 border-border focus:ring-primary bg-muted text-foreground font-medium text-base transition-all" 
                  />
                ) : (
                  <div className="flex-1 h-10 md:h-11 px-5 flex items-center bg-muted border border-border rounded-xl text-base text-foreground font-medium transition-all">
                    {displayData.phone}
                  </div>
                )}
              </div>
            </div>



            {/* Acciones de edición */}
            <div className="flex flex-col items-end gap-2 pb-1 pt-[31px]">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button 
                      onClick={() => trackGTMEvent("clerk_auth_initiated")}
                      className="flex items-center gap-2 text-secondary font-bold text-base underline hover:opacity-80 transition-opacity"
                    >
                      <Edit3 className="size-5" />
                      Inicia sesión para editar tu información
                    </button>
                  </SignInButton>
                  <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <Info className="size-3" />
                    Usa el mismo correo con el que te inscribiste para poder editar.
                  </p>
                </>
              ) : isEditing ? (
                <div className="flex gap-3">
                  <Button onClick={handleUpdateRegistration} disabled={isSubmitting} className="bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-xl">
                    {isSubmitting ? <Loader2 className="animate-spin size-4" /> : "Guardar cambios"}
                  </Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground font-bold">Cancelar</Button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditFormData(displayData); setIsEditing(true); }}
                  className="flex items-center gap-2 text-secondary font-bold text-base underline hover:opacity-80 transition-opacity"
                >
                  <Edit3 className="size-5" />
                  Editar información
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* 🚀 Botón de Rescate Dinámico (Pago con cupo en eventos cerrados) */}
      {(() => {
        if (status !== "pending" || !currentEvent) return null;

        const isClosed = currentEvent.initial_status === "pending";
        const isPagoCupo = isClosed && (currentEvent.event_tags || []).some((et: any) => et.tags?.slug === "pago_cupo");
        if (!isPagoCupo) return null;

        const pConfig = (currentEvent.paid_links || []).find((l: any) => l.type === "pago_cupo_config");
        const checkoutUrl = pConfig?.checkout_url || pConfig?.url;
        if (!checkoutUrl) return null;

        // Evaluar aforo en tiempo real vía eventCounts
        const confirmedCount = eventCounts[currentEvent.id] || 0;
        const capacity = currentEvent.capacity || 50;
        const hasSpotsAvailable = confirmedCount < capacity;

        if (!hasSpotsAvailable) return null;

        const queryParams = new URLSearchParams({
          name: `${displayData.firstName} ${displayData.lastName}`.trim(),
          email: displayData.email,
          phone: `${displayData.phoneCode || ""}${displayData.phone || ""}`.replace(/\s+/g, '')
        }).toString();

        const separator = checkoutUrl.includes("?") ? "&" : "?";
        const finalUrl = `${checkoutUrl}${separator}${queryParams}`;
        const buttonText = pConfig.checkout_button_text || "Completar Pago";

        return (
          <div className="mt-8 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 p-6 rounded-[24px] border">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-black text-foreground flex items-center justify-center sm:justify-start gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                ¡Cupos disponibles en este momento!
              </h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Tu solicitud está en lista de espera. Puedes asegurar tu entrada y confirmar tu lugar ahora mismo completando el pago.
              </p>
            </div>
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl shadow-lg shadow-primary/20 text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>{buttonText}</span>
              <ExternalLink className="size-4" />
            </a>
          </div>
        );
      })()}
    </div>
  );
}
