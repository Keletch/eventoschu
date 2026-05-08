"use client";

import React from "react";
import { useMetrics } from "../../hooks/use-metrics";
import { cn } from "@/lib/utils";
import { Users, Ticket, CheckCircle2, MapPin, BarChart3, TrendingUp, PieChart, AlertTriangle } from "lucide-react";

interface MetricsViewProps {
  registrations: any[];
  events: any[];
  onCountryClick?: (country: string) => void;
  onEventClick?: (eventId: string) => void;
  onSurveyClick?: (questionId: string, answer: string) => void;
  onLoyaltyClick?: () => void;
  onSurveyCompleteClick?: () => void;
  onTodayClick?: () => void;
}

export function MetricsView({ 
  registrations, events, onCountryClick, onEventClick, onSurveyClick,
  onLoyaltyClick, onSurveyCompleteClick, onTodayClick
}: MetricsViewProps) {
  const stats = useMetrics(registrations, events);

  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
      <BarChart3 className="size-12 mb-4 opacity-20" />
      <p className="font-medium">No hay suficientes datos para generar métricas.</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* 🚀 Top KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricKpiCard 
          label="Tasa de Conversión" 
          value={`${stats.global.globalConversionRate.toFixed(1)}%`} 
          description="Inscripciones aprobadas vs totales"
          icon={<TrendingUp className="size-5 text-blue-600" />}
          color="blue"
        />
        <MetricKpiCard 
          label="Inscripciones Reales" 
          value={stats.global.confirmedInscriptions.toString()} 
          description="Total de cupos aprobados a la fecha"
          icon={<CheckCircle2 className="size-5 text-green-600" />}
          color="green"
        />
        <MetricKpiCard 
          label="Perfil Completo" 
          value={stats.global.surveyCompletionCount.toString()} 
          description="Usuarios que contestaron el formulario"
          icon={<BarChart3 className="size-5 text-indigo-600" />}
          color="blue"
          onClick={onSurveyCompleteClick}
        />
        <MetricKpiCard 
          label="Tasa de Fidelidad" 
          value={`${stats.global.loyaltyRate.toFixed(1)}%`} 
          description="Usuarios con más de un evento"
          icon={<Users className="size-5 text-purple-600" />}
          color="purple"
          onClick={onLoyaltyClick}
        />
        <MetricKpiCard 
          label="Nuevos Registros" 
          value={stats.global.registrationsToday.toString()} 
          description="Personas registradas hoy"
          icon={<Users className="size-5 text-amber-600" />}
          color="amber"
          onClick={onTodayClick}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 🗺️ Distribución Geográfica */}
        <MetricBox title="Distribución por País" icon={<MapPin className="size-5" />}>
          <div className="space-y-4">
            {stats.countryDistribution.map((item, idx) => (
              <SimpleProgressBar 
                key={item.name} 
                label={item.name} 
                value={item.value} 
                total={stats.global.totalUsers} 
                colorClass="bg-blue-600"
                onClick={() => onCountryClick?.(item.name === "No especificado" ? "unspecified" : item.name)}
              />
            ))}
          </div>
        </MetricBox>

        {/* 📋 Análisis de Interés (Survey) */}
        <MetricBox title="Relación con el Club" icon={<PieChart className="size-5" />}>
          <div className="space-y-4">
            {stats.surveyInsights.relationship.data.map((item: any) => (
              <SimpleProgressBar 
                key={item.name} 
                label={item.name} 
                value={item.value} 
                total={stats.global.totalUsers} 
                colorClass="bg-purple-600"
                onClick={() => onSurveyClick?.('relationship', item.name)}
              />
            ))}
          </div>
        </MetricBox>

        <MetricBox title="Temas de Mayor Interés" icon={<BarChart3 className="size-5" />}>
          <div className="space-y-4">
            {stats.surveyInsights.topic.data.map((item: any) => (
              <SimpleProgressBar 
                key={item.name} 
                label={item.name} 
                value={item.value} 
                total={stats.global.totalUsers} 
                colorClass="bg-amber-600"
                onClick={() => onSurveyClick?.('topic', item.name)}
              />
            ))}
          </div>
        </MetricBox>

        <MetricBox title="Nivel de Experiencia" icon={<TrendingUp className="size-5" />}>
          <div className="space-y-4">
            {stats.surveyInsights.experience.data.map((item: any) => (
              <SimpleProgressBar 
                key={item.name} 
                label={item.name} 
                value={item.value} 
                total={stats.global.totalUsers} 
                colorClass="bg-green-600"
                onClick={() => onSurveyClick?.('experience', item.name)}
              />
            ))}
          </div>
        </MetricBox>

        <MetricBox title="Obstáculos Financieros" icon={<AlertTriangle className="size-5" />}>
          <div className="space-y-4">
            {stats.surveyInsights.hurdle.data.map((item: any) => (
              <SimpleProgressBar 
                key={item.name} 
                label={item.name} 
                value={item.value} 
                total={stats.global.totalUsers} 
                colorClass="bg-red-500"
                onClick={() => onSurveyClick?.('hurdle', item.name)}
              />
            ))}
          </div>
        </MetricBox>

        <MetricBox title="Popularidad de Eventos" icon={<TrendingUp className="size-5" />}>
          <div className="space-y-4">
            {stats.eventPerformance.slice(0, 5).map((item: any) => (
              <SimpleProgressBar 
                key={item.id} 
                label={`${item.city} - ${item.title}`} 
                value={item.total} 
                total={stats.global.totalInscriptions || 1} 
                colorClass="bg-blue-500"
                onClick={() => onEventClick?.(item.id)}
              />
            ))}
          </div>
        </MetricBox>
      </div>

      {/* 🏆 Tabla de Rendimiento de Eventos */}
      <MetricBox title="Rendimiento por Evento" icon={<Ticket className="size-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                <th className="py-4 px-2">Evento</th>
                <th className="py-4 px-2">Ciudad</th>
                <th className="py-4 px-2">Ocupación</th>
                <th className="py-4 px-2 text-right">Confirmados</th>
                <th className="py-4 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {stats.eventPerformance.map((ev) => (
                <tr 
                  key={ev.id} 
                  onClick={() => onEventClick?.(ev.id)}
                  className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-2 font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">{ev.title}</td>
                  <td className="py-4 px-2 text-neutral-500 font-medium">{ev.city}</td>
                  <td className="py-4 px-2 min-w-[120px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            ev.occupancyRate >= 100 ? "bg-green-500" : "bg-blue-600"
                          )}
                          style={{ width: `${Math.min(ev.occupancyRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-neutral-700">{Math.round(ev.occupancyRate)}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right font-black text-green-600">{ev.confirmed}</td>
                  <td className="py-4 px-2 text-right font-medium text-neutral-400">{ev.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MetricBox>
    </div>
  );
}

// Helper Components
function MetricKpiCard({ label, value, description, icon, color, onClick }: { label: string, value: string, description: string, icon: React.ReactNode, color: string, onClick?: () => void }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700"
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm space-y-3 transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
      )}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</span>
        <div className={cn("p-2 rounded-xl", colors[color])}>{icon}</div>
      </div>
      <div className="space-y-1">
        <h4 className="text-3xl font-black text-neutral-900">{value}</h4>
        <p className="text-[11px] font-medium text-neutral-500 leading-tight">{description}</p>
      </div>
    </div>
  );
}

function MetricBox({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-neutral-200/60 shadow-sm space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-neutral-50 rounded-xl text-neutral-600">{icon}</div>
        <h3 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SimpleProgressBar({ label, value, total, colorClass, onClick }: { label: string, value: number, total: number, colorClass: string, onClick?: () => void }) {
  const percentage = (value / total) * 100;
  return (
    <div 
      className={cn(
        "space-y-2 group transition-all duration-200",
        onClick && "cursor-pointer hover:translate-x-1"
      )} 
      onClick={onClick}
    >
      <div className="flex justify-between text-xs font-bold">
        <span className="text-neutral-700 group-hover:text-blue-600 transition-colors">{label}</span>
        <span className="text-neutral-400">{value} ({Math.round(percentage)}%)</span>
      </div>
      <div className="h-2 bg-neutral-50 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
