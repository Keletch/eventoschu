"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw, Server } from "lucide-react";

interface OperationProgressDialogProps {
  isOpen: boolean;
  current: number;
  total: number;
  message: string;
  title?: string;
}

export function OperationProgressDialog({
  isOpen,
  current,
  total,
  message,
  title = "Sincronizando con Keap CRM"
}: OperationProgressDialogProps) {
  const percent = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="rounded-[40px] p-8 max-w-md border-none shadow-2xl bg-card text-foreground"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-6">
          <div className="flex justify-center relative">
            <div className="p-5 rounded-[24px] bg-primary/10 text-primary relative animate-pulse">
              <Server className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-amber-500 text-white animate-spin">
                <RefreshCw className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-2xl font-black text-center text-foreground leading-snug">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-semibold text-xs uppercase tracking-widest">
              Operación en Segundo Plano
            </DialogDescription>
          </div>

          <div className="space-y-4 pt-2">
            {/* Barra de progreso animada */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-muted-foreground px-1">
                <span>Progreso</span>
                <span className="text-primary font-black">{percent}% ({current} de {total})</span>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-3.5 overflow-hidden border border-border/30 p-[2px]">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-primary/30" 
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Paso actual */}
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border min-h-[64px]">
              <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
              <p className="text-xs font-semibold text-foreground/80 leading-relaxed truncate-1-line text-left">
                {message || "Procesando registros..."}
              </p>
            </div>

            <p className="text-[10px] font-bold text-center text-muted-foreground bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 leading-normal">
              ⚠️ Esta operación afecta de forma masiva a Keap CRM. Por favor, mantén esta ventana abierta y no recargues la página hasta que finalice.
            </p>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
