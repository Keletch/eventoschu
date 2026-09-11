'use client';

import { AlertCircle, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface HeaderAlertsProps {
  isSurveyMissing: boolean;
  onOpenSurvey: () => void;
}

/**
 * HeaderAlerts - Solo la alerta de encuesta (el librito se ubica junto al login).
 */
export function HeaderAlerts({ isSurveyMissing, onOpenSurvey }: HeaderAlertsProps) {
  return (
    <>
      {isSurveyMissing && <SurveyReminderNudge onClick={onOpenSurvey} />}
    </>
  );
}

/**
 * Nudge del campus Thinkific — exportado para usarlo junto al botón de login.
 */
export { CampusSSOAlertNudge };

/**
 * Nudge discreto para la encuesta general
 */
function SurveyReminderNudge({ onClick }: { onClick: () => void }) {
  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger
          onClick={onClick}
          className="group relative size-10 flex items-center justify-center rounded-xl hover:bg-amber-500/10 transition-all duration-300 cursor-pointer border-none bg-transparent"
        >
          <AlertCircle className="h-5.5 w-5.5 text-amber-500 animate-pulse-gentle" />
          <span className="absolute top-1 right-1 size-2 bg-amber-400 rounded-full animate-ping opacity-75" />
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="p-4 rounded-2xl shadow-2xl bg-card border-border z-[200] max-w-[280px]">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">¡Queremos conocerte mejor!</p>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
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

/**
 * Nudge discreto para anunciar la vinculación con el campus de Thinkific (SSO/Membresías)
 */
function CampusSSOAlertNudge({ onClick }: { onClick: () => void }) {
  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger
          onClick={onClick}
          className="group relative size-10 flex items-center justify-center rounded-xl hover:bg-primary/10 transition-all duration-300 cursor-pointer border-none bg-transparent"
        >
          <BookOpen className="h-5.5 w-5.5 text-primary animate-pulse-gentle" />
          <span className="absolute top-1 right-1 size-2 bg-primary rounded-full animate-ping opacity-75" />
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="p-4 rounded-2xl shadow-2xl bg-card border-border z-[200] max-w-[280px]">
          <div className="space-y-3">
            <div className="space-y-1 text-left">
              <p className="text-sm font-bold text-foreground">Beneficios de Miembro</p>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                Asocia tu correo del campus para desbloquear precios especiales y descuentos exclusivos en eventos seleccionados.
              </p>
            </div>
            <Button
              onClick={onClick}
              className="w-full h-9 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20"
            >
              Ver instrucciones
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
