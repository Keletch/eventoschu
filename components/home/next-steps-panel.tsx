"use client";

import { Check, Info } from "lucide-react";

interface NextStepsPanelProps {
  surveyData: any;
  setIsSurveyOpen: (val: boolean) => void;
}

/** Devuelve true si el survey fue completado (tiene al menos una clave que no sea 'status'). */
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
    <div className="max-w-[1372px] mx-auto mt-24">
      <div className="relative border border-gray-200 rounded-[32px] p-8 md:p-12 lg:p-20 space-y-10 md:space-y-16 bg-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
          <h3 className="text-xl md:text-[24px] font-extrabold text-black tracking-tight">¿Qué sigue?</h3>
        </div>

        {/* Paso 1 — Registro completado (siempre marcado) */}
        <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-12 text-center sm:text-left items-center sm:items-start">
          <div className="relative z-10 flex flex-col items-center">
            <div className="size-11 bg-[#3154DC] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#3154DC]/20">
              <Check className="size-6" strokeWidth={3} />
            </div>
            {/* Línea vertical punteada */}
            <div className="hidden sm:block absolute top-11 w-0 h-40 border-l border-dashed border-[#3154DC]/40" />
          </div>
          <div className="space-y-2 pt-1.5">
            <h4 className="text-lg md:text-[22px] font-bold text-black">Registro completado</h4>
            <p className="text-base md:text-[20px] text-gray-500 font-light leading-snug">
              Ya estás en la lista de espera. Guardamos tu nombre, correo, teléfono y país
            </p>
          </div>
        </div>

        {/* Paso 2 — Formulario general */}
        <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-12 text-center sm:text-left items-center sm:items-start">
          <div className="relative z-10 flex flex-col items-center">
            {surveyDone ? (
              <div className="size-11 bg-[#3154DC] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#3154DC]/20">
                <Check className="size-6" strokeWidth={3} />
              </div>
            ) : (
              <div className="size-11 rounded-full border-2 border-[#3154DC] bg-white" />
            )}
          </div>
          <div className="space-y-2 pt-1.5">
            <h4 className="text-lg md:text-[22px] font-bold text-black">Responde el formulario general</h4>
            <div className="text-base md:text-[20px] text-gray-500 font-light leading-snug">
              {surveyDone ? (
                <span className="text-green-600 font-medium">¡Formulario completado!</span>
              ) : (
                <>
                  <button
                    onClick={() => setIsSurveyOpen(true)}
                    className="text-[#3154DC] font-bold underline hover:opacity-80 transition-opacity"
                  >
                    Ingresa aquí
                  </button>
                  <span className="text-gray-500"> para completarlo</span>
                  <div className="mt-2 ml-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-[10px] font-bold uppercase tracking-tight">
                    <Info className="size-3" />
                    Requisito obligatorio para confirmación
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
