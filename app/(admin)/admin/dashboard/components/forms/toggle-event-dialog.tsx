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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ToggleEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  isActive: boolean;
  onConfirm: () => void;
  isSubmitting: boolean;
  removeKeapTags?: boolean;
  setRemoveKeapTags?: (val: boolean) => void;
}

export function ToggleEventDialog({
  isOpen,
  onOpenChange,
  eventTitle,
  isActive,
  onConfirm,
  isSubmitting,
  removeKeapTags = false,
  setRemoveKeapTags
}: ToggleEventDialogProps) {
  const isDeactivating = isActive; // Si estaba activo y lo tocamos, vamos a desactivar

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] p-8 max-w-md border-none shadow-2xl bg-card text-foreground">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className={`p-4 rounded-3xl ${isDeactivating ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
              {isDeactivating ? <PowerOff className="w-8 h-8" /> : <RefreshCw className="w-8 h-8" />}
            </div>
          </div>
          <DialogTitle className="text-2xl font-black text-center text-foreground">
            {isDeactivating ? '¿Desactivar Evento?' : '¿Reactivar Evento?'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-medium leading-relaxed">
            {isDeactivating 
              ? `El evento "${eventTitle}" se ocultará de la vista pública.` 
              : `El evento "${eventTitle}" volverá a mostrarse en la web.`}
          </DialogDescription>
          
          {isDeactivating && setRemoveKeapTags && (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border mt-4">
              <div className="space-y-0.5 text-left pr-4">
                <Label htmlFor="remove-keap" className="font-bold text-sm cursor-pointer">
                  Quitar tags en Keap
                </Label>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Remueve los tags del evento a los usuarios inscritos.
                </p>
              </div>
              <Switch 
                id="remove-keap" 
                checked={removeKeapTags} 
                onCheckedChange={setRemoveKeapTags} 
              />
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button 
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-2xl h-12 font-bold hover:bg-muted transition-all"
          >
            Cancelar
          </Button>
          <Button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isSubmitting}
            className={`flex-1 rounded-2xl h-12 font-bold shadow-lg transition-all border-none ${
              isDeactivating 
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
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
