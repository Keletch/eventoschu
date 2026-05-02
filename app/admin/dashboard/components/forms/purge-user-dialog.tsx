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

  const isInvalid = confirmEmail.toLowerCase() !== userEmail.toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-[32px] p-8 border-none shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="size-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
            <AlertTriangle className="size-8" />
          </div>
          <DialogTitle className="text-2xl font-black text-center text-gray-900">
            ¿Confirmar purga total?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 font-medium leading-relaxed">
            Esta acción eliminará permanentemente la cuenta en <strong>Clerk</strong>, sus registros en <strong>Supabase</strong> y sus tags de eventos en <strong>Keap</strong>. <br />
            <span className="text-rose-600 font-bold">Esta acción no se puede deshacer.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">
            Escribe el correo para confirmar: <br />
            <span className="text-gray-900 lowercase select-all">{userEmail}</span>
          </p>
          <Input
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Introduce el correo del usuario"
            className="h-14 rounded-2xl border-neutral-200 focus:ring-rose-500/20 focus:border-rose-500 text-center text-lg font-medium"
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter className="sm:justify-center gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-12 px-8 font-bold text-gray-500 hover:bg-neutral-50 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isInvalid || isSubmitting}
            className="h-12 px-8 font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-30"
          >
            {isSubmitting ? <Loader2 className="animate-spin size-5" /> : "Confirmar Purga Total"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
