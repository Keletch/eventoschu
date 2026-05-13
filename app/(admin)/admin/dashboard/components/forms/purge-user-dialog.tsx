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
import { AlertTriangle, Loader2 } from "lucide-react";

interface PurgeUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export function PurgeUserDialog({
  isOpen,
  onOpenChange,
  userEmail,
  onConfirm,
  isSubmitting
}: PurgeUserDialogProps) {
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleClose = () => {
    setConfirmEmail("");
    onOpenChange(false);
  };

  const isInvalid = !confirmEmail || confirmEmail.toLowerCase() !== userEmail.toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card rounded-[32px] p-8 border-none shadow-2xl text-foreground">
        <DialogHeader className="space-y-4">
          <div className="size-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto">
            <AlertTriangle className="size-8" />
          </div>
          <DialogTitle className="text-2xl font-black text-center text-foreground">
            ¿Confirmar purga total?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-medium leading-relaxed">
            Esta acción eliminará permanentemente la cuenta en <strong>Clerk</strong>, sus registros en <strong>Supabase</strong> y sus tags de eventos en <strong>Keap</strong>. <br />
            <span className="text-destructive font-bold">Esta acción no se puede deshacer.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">
            Escribe el correo para confirmar: <br />
            <span className="text-foreground lowercase select-all font-black">{userEmail}</span>
          </p>
          <Input
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Introduce el correo del usuario"
            className="h-14 rounded-2xl border-border bg-muted/30 focus:ring-destructive/20 focus:border-destructive text-center text-lg font-medium transition-all"
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter className="sm:justify-center gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-12 px-8 font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isInvalid || isSubmitting}
            className="h-12 px-8 font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl shadow-lg shadow-destructive/20 disabled:opacity-30 transition-all"
          >
            {isSubmitting ? <Loader2 className="animate-spin size-5" /> : "Confirmar Purga Total"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
