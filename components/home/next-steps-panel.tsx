"use client";

import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NextStepsPanelProps {
  surveyData: any;
  setIsSurveyOpen: (val: boolean) => void;
}

function isSurveyCompleted(surveyData: any): boolean {
  return (
    surveyData &&
    typeof surveyData === "object" &&
    Object.keys(surveyData).filter((k) => k !== "status").length > 0
  );
}

export function NextStepsPanel({ surveyData, setIsSurveyOpen }: NextStepsPanelProps) {
  const surveyDone = isSurveyCompleted(surveyData);

  return (
    <div className="max-w-[1372px] mx-auto mt-24 px-4 sm:px-0">
      <div className="relative border-[3px] border-border rounded-[32px] p-8 md:p-12 lg:p-16 bg-card shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Decoración sutil de fondo */}


        <div className="relative z-10 space-y-12 md:space-y-20">
          <h3 className="text-2xl md:text-[32px] font-black text-foreground tracking-tight">
            ¿Qué sigue?
          </h3>

          <div className="space-y-12 md:space-y-16">
            {/* Paso 1 — Registro completado */}
            <div className="flex flex-col sm:flex-row gap-6 md:gap-12 items-center sm:items-start group">
              <div className="relative flex flex-col items-center">
                <div className="relative z-10 size-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-transform group-hover:scale-110 duration-500">
                  <Check className="size-7" strokeWidth={3} />
                </div>
                {/* Línea punteada que pasa por detrás */}
                <div className="hidden sm:block absolute top-7 z-0 w-px h-32 md:h-44 border-l-2 border-dashed border-muted-foreground/20" />
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left pt-2">
                <h4 className="text-xl md:text-[24px] font-bold text-foreground">Registro completado</h4>
                <p className="text-lg md:text-[21px] text-muted-foreground font-light leading-relaxed">
                  ¡Ya estás en la lista de espera! Tus datos han sido guardados
                </p>
              </div>
            </div>

            {/* Paso 2 — Formulario / Validación */}
            <div className="flex flex-col sm:flex-row gap-6 md:gap-12 items-center sm:items-start group">
              <div className="relative z-10 flex flex-col items-center">
                {surveyDone ? (
                  <div className="size-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-transform group-hover:scale-110 duration-500">
                    <Check className="size-7" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="size-14 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-amber-500/20 transition-transform group-hover:scale-110 duration-500">
                    <AlertTriangle className="size-7" strokeWidth={2.5} />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-6 text-center sm:text-left pt-2">
                <div className="space-y-2">
                  <h4 className="text-xl md:text-[24px] font-bold text-foreground">
                    {surveyDone ? "Datos capturados" : "Ayúdanos a personalizar tu experiencia"}
                  </h4>
                  <p className="text-lg md:text-[21px] text-muted-foreground font-light leading-relaxed">
                    {surveyDone
                      ? "¡Excelente! Hemos recibido tus datos."
                      : "Completa tu datos y te enviaremos información personalizada según tus intereses."
                    }
                  </p>
                </div>

                {!surveyDone && (
                  <div className="flex flex-col items-center sm:items-start gap-4">
                    <button
                      onClick={() => setIsSurveyOpen(true)}
                      className={cn(
                        "px-10 py-5 bg-brand-accent hover:opacity-90 text-white rounded-[20px] text-lg md:text-xl font-black transition-all duration-300",
                        "shadow-[0_10px_25px_-5px_rgba(4,194,89,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(4,194,89,0.5)]",
                        "hover:scale-[1.03] active:scale-95"
                      )}
                    >
                      Completar datos
                    </button>
                    <p className="text-sm md:text-base text-gray-400 italic">
                      ¡Gracias! Disfruta ser parte de la comunidad CDI!
                    </p>
                  </div>
                )}

                {surveyDone && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-bold border border-green-500/20">
                    <Check className="size-4" />
                    Perfil validado correctamente
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
