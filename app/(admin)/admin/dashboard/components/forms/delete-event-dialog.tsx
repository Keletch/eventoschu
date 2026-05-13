"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeleteEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  registrationsCount: number;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export function DeleteEventDialog({
  isOpen,
  onOpenChange,
  eventTitle,
  registrationsCount,
  onConfirm,
  isSubmitting
}: DeleteEventDialogProps) {
  const [confirmTitle, setConfirmTitle] = useState("");

  const handleClose = () => {
    setConfirmTitle("");
    onOpenChange(false);
  };

  const isInvalid = confirmTitle.trim().toLowerCase() !== eventTitle.trim().toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] bg-card rounded-[40px] p-8 border-none shadow-2xl text-foreground">
        <DialogHeader className="space-y-4">
          <div className="size-20 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mx-auto shadow-sm">
            <AlertTriangle className="size-10" />
          </div>
          <DialogTitle className="text-3xl font-black text-center text-foreground leading-tight">
            ¿Eliminar evento y purgar inscritos?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-medium leading-relaxed">
            Esta es una operación masiva. Se eliminará el evento de la base de datos y se 
            <span className="text-destructive font-bold"> limpiarán los tags de Keap </span> 
            de todos los usuarios afectados.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="bg-muted/50 rounded-2xl p-4 flex items-center justify-between border border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Info className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Impacto Estimado</p>
                <p className="text-sm font-bold text-foreground">{registrationsCount} usuarios serán actualizados</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-card border-border text-muted-foreground font-bold">
              Cascada
            </Badge>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">
              Escribe el nombre del evento para confirmar: <br />
              <span className="text-foreground select-all font-black">{eventTitle}</span>
            </p>
            <Input
              value={confirmTitle}
              onChange={(e) => setConfirmTitle(e.target.value)}
              placeholder="Introduce el nombre exacto del evento"
              className="h-16 rounded-2xl border-border bg-muted/30 focus:ring-destructive/20 focus:border-destructive text-center text-lg font-medium shadow-sm transition-all"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-14 px-8 font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isInvalid || isSubmitting}
            className="h-14 px-10 font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-2xl shadow-xl shadow-destructive/20 disabled:opacity-30 transition-all transform active:scale-95"
          >
            {isSubmitting ? <Loader2 className="animate-spin size-6" /> : "Confirmar Eliminación Masiva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
