"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveSurveyData } from "@/app/actions/registrations";

interface SurveyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onSuccess: (data: any) => void;
}

const QUESTIONS = [
  {
    id: "relationship",
    label: "¿Cuál es tu relación actual con el Club de Inversionistas?",
    options: [
      { value: "nuevo", label: "Es mi primera vez con Hyenuk / El Club (Soy nuevo)." },
      { value: "seguidor", label: "Sigo el contenido pero aún no soy alumno." },
      { value: "alumno", label: "Ya soy (o he sido) alumno de un taller o membresía." },
    ]
  },
  {
    id: "topic",
    label: "Si tuvieras que elegir UN solo tema para profundizar en el Meetup, ¿cuál sería?",
    options: [
      { value: "crecimiento", label: "Crecimiento personal: Mentalidad y hábitos para el éxito." },
      { value: "inversiones", label: "Inversiones: Cómo poner a trabajar mi dinero a largo plazo." },
      { value: "finanzas", label: "Finanzas: Cómo organizar mis cuentas y salir de deudas." },
      { value: "trading", label: "Trading: Cómo entender los mercados." },
    ]
  },
  {
    id: "experience",
    label: "¿Cuál es tu nivel de experiencia en el mundo de las inversiones?",
    options: [
      { value: "nivel0", label: "Nivel 0: Solo tengo curiosidad, no he empezado." },
      { value: "nivel1", label: "Nivel 1: He estudiado pero aún no he puesto mi capital en marcha." },
      { value: "nivel2", label: "Nivel 2: Ya invierto de forma activa por mi cuenta." },
    ]
  },
  {
    id: "hurdle",
    label: "¿Qué es lo que más te detiene hoy para alcanzar tus objetivos financieros?",
    options: [
      { value: "dinero", label: "No tengo suficiente dinero para empezar" },
      { value: "guia", label: "No sé por dónde empezar" },
      { value: "miedo", label: "Me da miedo perder dinero" },
      { value: "constancia", label: "Me cuesta ser constante" },
      { value: "tiempo", label: "Tiempo" },
    ]
  }
];

export function SurveyModal({ isOpen, onOpenChange, email, onSuccess }: SurveyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await saveSurveyData(email, answers);
      if (res.success) {
        onSuccess(answers);
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
        <div className="bg-white p-8 md:p-16 max-h-[90vh] overflow-y-auto no-scrollbar relative">
          <div className="space-y-4 mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter">Formulario general</h2>
            <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Para asegurar que esta experiencia sea de alto nivel, cuéntanos un poco sobre ti (Solo te tomará 1 minuto).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-4">
                <label className="text-lg md:text-xl font-bold text-black flex gap-2">
                  <span className="text-gray-400 font-medium">{idx + 1}.</span> {q.label}
                </label>
                <Select 
                  name={q.id} 
                  required 
                  items={q.options}
                  value={answers[q.id] || ""}
                  onValueChange={(val) => setAnswers(prev => ({ ...prev, [q.id]: val ?? "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {q.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="space-y-4">
              <label className="text-lg md:text-xl font-bold text-black flex gap-2">
                <span className="text-gray-400 font-medium">5.</span> Si pudieras hacerle una sola pregunta directa a Hyenuk en persona, ¿cuál sería?
              </label>
              <textarea
                name="question"
                required
                value={answers.question || ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Escribe aquí tu pregunta..."
                className="w-full min-h-[160px] p-6 rounded-[24px] border border-neutral-200 bg-neutral-50/50 focus:ring-2 focus:ring-[#3154DC] outline-none transition-all text-base md:text-lg resize-none"
              />
            </div>

            <div className="pt-6 flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#3154DC] hover:bg-[#2845c4] text-white px-12 h-16 rounded-full font-bold text-xl shadow-xl shadow-[#3154DC]/20 transition-all active:scale-95 flex items-center gap-3"
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
