'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface HeaderAlertsProps {
  isSurveyMissing: boolean;
  onOpenSurvey: () => void;
}

/**
 * HeaderAlerts - Sistema centralizado para recordatorios y anuncios discretos en el header.
 */
export function HeaderAlerts({ isSurveyMissing, onOpenSurvey }: HeaderAlertsProps) {
  if (!isSurveyMissing) return null;

  return (
    <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-500">
      <SurveyReminderNudge onClick={onOpenSurvey} />
      
      {/* 💡 Futuros slots para otros anuncios pueden ir aquí */}
    </div>
  );
}

/**
 * Nudge discreto para la encuesta general
 */
function SurveyReminderNudge({ onClick }: { onClick: () => void }) {
  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger 
          onClick={onClick}
          className="group relative size-10 flex items-center justify-center rounded-xl hover:bg-amber-50 transition-all duration-300 cursor-pointer border-none bg-transparent"
        >
          <HelpCircle className="h-6 w-6 text-amber-500 animate-pulse-gentle" />
          <span className="absolute top-2 right-2 size-2 bg-amber-400 rounded-full animate-ping opacity-75" />
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="p-4 rounded-2xl shadow-2xl bg-white border-neutral-100 z-[150] max-w-[280px]">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-bold text-neutral-800">¡Queremos conocerte mejor!</p>
              <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                Nos encantaría saber más sobre tus intereses para brindarte la mejor experiencia posible.
              </p>
            </div>
            <Button 
              onClick={onClick}
              className="w-full h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-500/20"
            >
              Completar formulario
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
