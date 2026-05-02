"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, RefreshCw, PowerOff } from "lucide-react";

interface ToggleEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  isActive: boolean;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ToggleEventDialog({
  isOpen,
  onOpenChange,
  eventTitle,
  isActive,
  onConfirm,
  isSubmitting
}: ToggleEventDialogProps) {
  const isDeactivating = isActive; // Si estaba activo y lo tocamos, vamos a desactivar

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] p-8 max-w-md border-none shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className={`p-4 rounded-3xl ${isDeactivating ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              {isDeactivating ? <PowerOff className="w-8 h-8" /> : <RefreshCw className="w-8 h-8" />}
            </div>
          </div>
          <DialogTitle className="text-2xl font-black text-center text-neutral-900">
            {isDeactivating ? '¿Desactivar Evento?' : '¿Reactivar Evento?'}
          </DialogTitle>
          <DialogDescription className="text-center text-neutral-500 font-medium leading-relaxed">
            {isDeactivating ? (
              <>
                Al desactivar <span className="font-bold text-neutral-900">"{eventTitle}"</span>, 
                se eliminarán automáticamente los tags de Keap de todos los usuarios inscritos. 
                <br /><br />
                <span className="text-amber-600 font-bold flex items-center justify-center gap-1 text-sm">
                  <AlertTriangle className="w-4 h-4" /> Los registros se mantendrán en Supabase.
                </span>
              </>
            ) : (
              <>
                Al reactivar <span className="font-bold text-neutral-900">"{eventTitle}"</span>, 
                el sistema restaurará automáticamente los tags de Keap a todos los usuarios 
                que ya estaban registrados en Supabase.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button 
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-2xl h-12 font-bold border-neutral-200 hover:bg-neutral-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isSubmitting}
            className={`flex-1 rounded-2xl h-12 font-bold text-white shadow-lg transition-all border-none ${
              isDeactivating 
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' 
                : 'bg-blue-700 hover:bg-blue-800 shadow-blue-200'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              isDeactivating ? 'Confirmar Desactivación' : 'Confirmar Reactivación'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
