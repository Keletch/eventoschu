"use client";

import { Loader2, Info, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInButton } from "@clerk/nextjs";
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
  eventConfig,
}: UserDataCardProps) {
  const badgeConfig = STATUS_CONFIGS[(status as RegistrationStatus) || "pending"] ?? STATUS_CONFIGS.pending;

  // 🧠 Obtener etiqueta desde la configuración centralizada
  const displayLabel = eventConfig.statusLabels[status as RegistrationStatus] || badgeConfig.label;

  return (
    <div className="max-w-[1372px] mx-auto bg-white rounded-[32px] p-8 md:p-12 lg:p-16 relative user-data-container border border-neutral-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] transform backface-visibility-hidden antialiased">
      {/* Badge de estado — esquina superior derecha en md+ */}
      <div className="md:absolute md:top-10 md:right-10 mb-8 md:mb-0 flex justify-center md:justify-end">
        {isLoadingEvents ? (
          <Skeleton className="h-10 w-32 md:w-40 rounded-2xl bg-neutral-200/50" />
        ) : (
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className={cn("px-5 py-2 md:px-6 md:py-2 rounded-2xl font-bold text-base md:text-lg flex items-center gap-2 transition-all duration-500 transform backface-visibility-hidden", badgeConfig.bg, badgeConfig.text)}>
              {badgeConfig.icon}
              {displayLabel}
            </div>
            {badgeConfig.description && (
              <p className={cn("text-[13px] font-medium animate-in fade-in slide-in-from-top-1", status === 'confirmed' ? 'text-emerald-600/80' : 'text-slate-500/80')}>
                {badgeConfig.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Información del Evento — esquina superior izquierda */}
      <div className="mb-8 md:mb-12">
        {isLoadingEvents ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-neutral-200/50" />
            <Skeleton className="h-8 w-64 bg-neutral-200/30" />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600/80">Inscripción activa</span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 leading-tight">
              {eventTitle || "Evento"}
            </h2>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm md:text-base">
               <span>{eventCity}</span>
               <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
               <span>{eventCountry}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-8 lg:gap-y-12 pt-4">
        {isLoadingEvents ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-32 bg-neutral-200/50" />
              <Skeleton className="h-11 w-full rounded-xl bg-neutral-200/30" />
            </div>
          ))
        ) : (
          <>
            {/* Nombre */}
            <div className="space-y-3">
              <label className="text-[15px] font-medium text-slate-500">Nombre <span className="text-red-500">*</span></label>
              {isEditing ? (
                <Input name="firstName" value={editFormData?.firstName || ""} onChange={handleEditChange} className="h-11 rounded-xl" />
              ) : (
                <div className="h-11 px-5 flex items-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium">{displayData.firstName}</div>
              )}
            </div>

            {/* Apellido */}
            <div className="space-y-3">
              <label className="text-[15px] font-medium text-slate-500">Apellido <span className="text-red-500">*</span></label>
              {isEditing ? (
                <Input name="lastName" value={editFormData?.lastName || ""} onChange={handleEditChange} className="h-11 rounded-xl" />
              ) : (
                <div className="h-11 px-5 flex items-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium">{displayData.lastName}</div>
              )}
            </div>

            {/* Correo (solo lectura siempre) */}
            <div className="space-y-3">
              <label className="text-[15px] font-medium text-slate-500">Correo electrónico <span className="text-red-500">*</span></label>
              <div className="h-11 px-5 flex items-center bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-500 font-medium truncate">{displayData.email}</div>
            </div>

            {/* País */}
            <div className="space-y-3">
              <label className="text-[15px] font-medium text-slate-500">País de residencia (opcional)</label>
              {isEditing ? (
                <Input name="country" value={editFormData?.country || ""} onChange={handleEditChange} className="h-11 rounded-xl" />
              ) : (
                <div className="h-11 px-5 flex items-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium">{displayData.country || "No especificado"}</div>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-3">
              <label className="text-[15px] font-medium text-slate-500">WhatsApp <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="w-16 h-11 px-3 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-500 font-medium">{displayData.phoneCode}</div>
                {isEditing ? (
                  <Input name="phone" value={editFormData?.phone || ""} onChange={handleEditChange} className="h-11 rounded-xl flex-1" />
                ) : (
                  <div className="flex-1 h-11 px-5 flex items-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium">{displayData.phone}</div>
                )}
              </div>
            </div>

            {/* Acciones de edición */}
            <div className="flex flex-col items-center gap-2 pb-1 pt-[31px]">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 text-[#00A650] font-bold text-base underline hover:opacity-80 transition-opacity">
                      <Edit3 className="size-5" />
                      Inicia sesión para editar tu información
                    </button>
                  </SignInButton>
                  <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <Info className="size-3" />
                    Usa el mismo correo con el que te inscribiste para poder editar.
                  </p>
                </>
              ) : isEditing ? (
                <div className="flex gap-3">
                  <Button onClick={handleUpdateRegistration} disabled={isSubmitting} className="bg-[#00A650] hover:bg-[#008540] text-white font-bold rounded-xl">
                    {isSubmitting ? <Loader2 className="animate-spin size-4" /> : "Guardar cambios"}
                  </Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-gray-500 font-bold">Cancelar</Button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditFormData(displayData); setIsEditing(true); }}
                  className="flex items-center gap-2 text-blue-600 font-bold text-base underline hover:opacity-80 transition-opacity"
                >
                  <Edit3 className="size-5" />
                  Editar información
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
