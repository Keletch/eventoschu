"use client";

import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface CheckRegistrationPanelProps {
  isOpen: boolean;
  isChecking: boolean;
  handleCheckRegistration: (email: string) => Promise<void>;
  setIsCheckMode: (val: boolean) => void;
}

export function CheckRegistrationPanel({
  isOpen,
  isChecking,
  handleCheckRegistration,
  setIsCheckMode,
}: CheckRegistrationPanelProps) {
  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={setIsCheckMode}>
      <DialogContent className="max-w-xl p-0 border-none bg-transparent shadow-none overflow-visible focus:outline-none focus-visible:ring-0 ring-0">
        <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] space-y-10 outline-none">
          {/* Encabezado */}
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center justify-center size-16 bg-[#3154DC]/10 rounded-2xl text-[#3154DC] mb-2">
              <Search className="size-8" />
            </div>
            <h3 className="text-3xl font-extrabold text-black tracking-tight">
              Consulta tu registro
            </h3>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              Ingresa tu correo para revisar tus registros activos
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase text-slate-400 tracking-[0.1em] ml-1">
                Correo electrónico
              </label>
              <input
                ref={emailRef}
                type="email"
                id="check-email"
                placeholder="ejemplo@correo.com"
                className="w-full h-16 px-8 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-[#3154DC] focus:ring-4 focus:ring-[#3154DC]/10 transition-all outline-none text-xl font-medium"
              />
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  const email = emailRef.current?.value || "";
                  handleCheckRegistration(email);
                }}
                disabled={isChecking}
                className="w-full h-16 bg-[#3154DC] hover:bg-[#3154DC]/90 text-white font-bold rounded-2xl text-xl flex items-center justify-center gap-3 shadow-xl shadow-[#3154DC]/20 transition-all active:scale-[0.98]"
              >
                {isChecking ? <Loader2 className="size-7 animate-spin" /> : "Consultar ahora"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

  );
}
