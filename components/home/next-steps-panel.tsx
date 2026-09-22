"use client";

import React, { useRef, useState, useEffect } from "react";
import { Check, AlertTriangle, MessageCircle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NextStepsPanelProps {
  surveyData: any;
  setIsSurveyOpen: (val: boolean) => void;
  currentEvent?: any;
}

function isSurveyCompleted(surveyData: any): boolean {
  return (
    surveyData &&
    typeof surveyData === "object" &&
    Object.keys(surveyData).filter((k) => k !== "status").length > 0
  );
}

export function NextStepsPanel({ surveyData, setIsSurveyOpen, currentEvent }: NextStepsPanelProps) {
  const surveyDone = isSurveyCompleted(surveyData);

  // Extraer configuración de Paso 3: Comunidad / WhatsApp
  const waConfig = (currentEvent?.paid_links || []).find((l: any) => l.type === "whatsapp_config");
  const whatsappUrl = currentEvent?.whatsapp_url || waConfig?.whatsapp_url || "";
  const whatsappButtonText = currentEvent?.whatsapp_button_text || waConfig?.whatsapp_button_text || "Unirme a la comunidad de WhatsApp";
  const whatsappDescription = currentEvent?.whatsapp_description || waConfig?.whatsapp_description || "Únete a nuestro grupo oficial para recibir información, novedades y contenido exclusivo del evento.";
  const hasStep3 = !!whatsappUrl && whatsappUrl.trim().length > 0;

  // Medición dinámica y precisa de distancias entre nodos
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const [line1Height, setLine1Height] = useState<number>(0);
  const [line2Height, setLine2Height] = useState<number>(0);

  useEffect(() => {
    const updateLines = () => {
      if (step1Ref.current && step2Ref.current) {
        const rect1 = step1Ref.current.getBoundingClientRect();
        const rect2 = step2Ref.current.getBoundingClientRect();
        // Distancia exacta desde el fondo del icono 1 hasta el tope del icono 2
        const dist1 = rect2.top - rect1.bottom;
        setLine1Height(Math.max(0, dist1));
      }

      if (step2Ref.current && step3Ref.current && hasStep3) {
        const rect2 = step2Ref.current.getBoundingClientRect();
        const rect3 = step3Ref.current.getBoundingClientRect();
        // Distancia exacta desde el fondo del icono 2 hasta el tope del icono 3
        const dist2 = rect3.top - rect2.bottom;
        setLine2Height(Math.max(0, dist2));
      }
    };

    updateLines();

    // ResizeObserver para recalcular si el contenido cambia de altura (ej: expandir/colapsar)
    const ro = new ResizeObserver(() => {
      updateLines();
    });

    if (step1Ref.current?.parentElement?.parentElement) {
      ro.observe(step1Ref.current.parentElement.parentElement);
    }
    window.addEventListener("resize", updateLines);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateLines);
    };
  }, [surveyDone, hasStep3, whatsappDescription]);

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
              <div className="relative flex flex-col items-center shrink-0">
                <div 
                  ref={step1Ref}
                  className="relative z-10 size-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-transform group-hover:scale-110 duration-500 opacity-100"
                >
                  <Check className="size-7" strokeWidth={3} />
                </div>
                {/* Línea punteada que viaja exactamente del fondo del paso 1 al tope del paso 2 */}
                {line1Height > 0 && (
                  <div 
                    style={{ height: `${line1Height}px` }} 
                    className="hidden sm:block absolute top-14 left-1/2 -translate-x-1/2 w-px border-l-2 border-dashed border-muted-foreground/30 pointer-events-none" 
                  />
                )}
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
              <div className="relative flex flex-col items-center shrink-0">
                <div ref={step2Ref} className="relative z-10">
                  {surveyDone ? (
                    <div className="size-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-transform group-hover:scale-110 duration-500 opacity-100">
                      <Check className="size-7" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="size-14 bg-[#FF9500] rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500 opacity-100">
                      <AlertTriangle className="size-7 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Línea punteada que viaja exactamente del fondo del paso 2 al tope del paso 3 */}
                {hasStep3 && line2Height > 0 && (
                  <div 
                    style={{ height: `${line2Height}px` }} 
                    className="hidden sm:block absolute top-14 left-1/2 -translate-x-1/2 w-px border-l-2 border-dashed border-muted-foreground/30 pointer-events-none" 
                  />
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
                    <p className="text-sm md:text-base text-muted-foreground italic">
                      ¡Gracias! Disfruta ser parte de la comunidad CDI!
                    </p>
                  </div>
                )}

                {surveyDone && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/20">
                    <Check className="size-4" />
                    Perfil validado correctamente
                  </div>
                )}
              </div>
            </div>

            {/* Paso 3 — Comunidad / WhatsApp (Dinámico) */}
            {hasStep3 && (
              <div className="flex flex-col sm:flex-row gap-6 md:gap-12 items-center sm:items-start group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative z-10 flex flex-col items-center shrink-0">
                  <div 
                    ref={step3Ref}
                    className="size-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#25D366]/25 transition-transform group-hover:scale-110 duration-500 opacity-100"
                  >
                    <MessageCircle className="size-7" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="flex-1 space-y-6 text-center sm:text-left pt-2">
                  <div className="space-y-2">
                    <h4 className="text-xl md:text-[24px] font-bold text-foreground">
                      Únete a nuestra comunidad
                    </h4>
                    <p className="text-lg md:text-[21px] text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                      {whatsappDescription}
                    </p>
                  </div>

                  <div className="flex flex-col items-center sm:items-start gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-3 px-10 py-5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-[20px] text-lg md:text-xl font-black transition-all duration-300",
                        "shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,211,102,0.5)]",
                        "hover:scale-[1.03] active:scale-95 cursor-pointer"
                      )}
                    >
                      <MessageCircle className="size-6 shrink-0" />
                      <span>{whatsappButtonText}</span>
                      <ArrowUpRight className="size-5 shrink-0 opacity-80" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
