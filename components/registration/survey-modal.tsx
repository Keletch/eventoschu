"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveSurveyData } from "@/app/actions/user-registration";
import { SURVEY_QUESTIONS } from "@/lib/constants";

interface SurveyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onSuccess: (data: any) => void;
}

export function SurveyModal({ isOpen, onOpenChange, email, onSuccess }: SurveyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 🛡️ Validación estricta: Todo es obligatorio
    const requiredFields = [...SURVEY_QUESTIONS.map(q => q.id), "question"];
    const allAnswered = requiredFields.every(field => answers[field]?.trim());

    if (!allAnswered) {
      toast.error("Por favor, responde todas las preguntas del formulario.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 🧠 Transformar a formato LITERAL para Supabase (Pregunta + Respuesta Texto)
      const literalPayload: any = {};
      
      SURVEY_QUESTIONS.forEach(q => {
        literalPayload[q.id] = {
          question: q.label,
          answer: q.options.find(o => o.value === answers[q.id])?.label || answers[q.id]
        };
      });

      // Agregar la pregunta abierta
      literalPayload.question = {
        question: "Si pudieras hacerle una sola pregunta directa a Hyenuk en persona, ¿cuál sería?",
        answer: answers.question
      };

      const res = await saveSurveyData(email, literalPayload);
      if (res.success) {
        onSuccess(literalPayload);
        toast.success("¡Formulario enviado correctamente!");
        onOpenChange(false);
      } else {
        toast.error("Error al enviar: " + (res as any).error);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="max-w-[1100px] w-[95vw] p-0 overflow-hidden border-none rounded-[48px] shadow-2xl">
        <div className="bg-background p-8 md:p-16 max-h-[90vh] overflow-y-auto no-scrollbar relative">
          <div className="space-y-4 mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">Formulario general</h2>
            <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Para asegurar que esta experiencia sea de alto nivel, cuéntanos un poco sobre ti (Solo te tomará 1 minuto).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {SURVEY_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-4">
                <label className="text-lg md:text-xl font-bold text-foreground flex gap-2">
                  <span className="text-muted-foreground/40 font-medium">{idx + 1}.</span> {q.label}
                </label>
                <Select 
                  name={q.id} 
                  required 
                  value={answers[q.id] || ""}
                  onValueChange={(val) => setAnswers(prev => ({ ...prev, [q.id]: val ?? "" }))}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-border bg-muted">
                    <SelectValue placeholder="Seleccionar una opción">
                      {/* Base UI no refleja ItemText automáticamente — mapeamos el value a su label */}
                      {answers[q.id]
                        ? q.options.find((o) => o.value === answers[q.id])?.label ?? answers[q.id]
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border shadow-xl">
                    {q.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="rounded-xl">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="space-y-4">
              <label className="text-lg md:text-xl font-bold text-foreground flex gap-2">
                <span className="text-muted-foreground/40 font-medium">5.</span> Si pudieras hacerle una sola pregunta directa a Hyenuk en persona, ¿cuál sería?
              </label>
              <textarea
                name="question"
                required
                value={answers.question || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Escribe aquí tu pregunta..."
                className="w-full min-h-[160px] p-6 rounded-[24px] border border-border bg-muted focus:ring-2 focus:ring-primary outline-none transition-all text-base md:text-lg resize-none text-foreground placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="pt-6 flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 h-16 rounded-full font-bold text-xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3"
              >
                {isSubmitting ? <Loader2 className="size-6 animate-spin" /> : "Enviar formulario"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
