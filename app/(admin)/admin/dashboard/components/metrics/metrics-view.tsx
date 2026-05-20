"use client";

import React, { useState } from "react";
import { useMetrics } from "../../hooks/use-metrics";
import { cn } from "@/lib/utils";
import { Users, Ticket, CheckCircle2, MapPin, BarChart3, TrendingUp, PieChart, AlertTriangle, ChevronDown, ChevronUp, Tag } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
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
          hint="Ver lista"
        />
        <MetricKpiCard 
          label="Tasa de Fidelidad" 
          value={`${stats.global.loyaltyRate.toFixed(1)}%`} 
          description="Usuarios con más de un evento"
          icon={<Users className="size-5 text-purple-600" />}
          color="purple"
          onClick={onLoyaltyClick}
          hint="Ver lista"
        />
        <MetricKpiCard 
          label="Nuevos Registros" 
          value={stats.global.registrationsToday.toString()} 
          description="Personas registradas hoy"
          icon={<Users className="size-5 text-amber-600" />}
          color="amber"
          onClick={onTodayClick}
          hint="Ver lista"
        />
      </div>

      {/* 📈 Tendencia de Registros (últimos 7 días) */}
      <MetricBox title="Tendencia de Registros — Últimos 7 Días" icon={<TrendingUp className="size-5" />}>
        <TrendChart 
          data={stats.trendData} 
          weeklyDelta={stats.weeklyDelta}
          thisWeekTotal={stats.thisWeekTotal}
        />
      </MetricBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 🗺️ Distribución Geográfica con Top 5 + Expandir */}
        <MetricBox title="Distribución por País" icon={<MapPin className="size-5" />}>
          <ExpandableCountryList 
            countries={stats.countryDistribution} 
            total={stats.global.totalUsers}
            onCountryClick={onCountryClick}
          />
        </MetricBox>

        {/* 📋 Relación con el Club */}
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

        {/* 🎯 Temas de Mayor Interés */}
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

        {/* 🌱 Nivel de Experiencia */}
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

        {/* 💸 Obstáculos Financieros */}
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

        {/* 🏆 Popularidad de Eventos */}
        <MetricBox title="Popularidad de Eventos" icon={<TrendingUp className="size-5" />}>
          <div className="space-y-4">
            {stats.eventPerformance.slice(0, 5).map((item: any) => (
              <SimpleProgressBar 
                key={item.id} 
                label={`${item.city ? `${item.city} - ` : ""}${item.title}`} 
                value={item.total} 
                total={stats.global.totalInscriptions || 1} 
                colorClass="bg-blue-500"
                onClick={() => onEventClick?.(item.id)}
              />
            ))}
          </div>
        </MetricBox>

        {/* 🏷️ Interés por Categoría */}
        {stats.categoryDistribution.length > 0 && (
          <MetricBox title="Interés por Categoría" icon={<Tag className="size-5" />}>
            <div className="space-y-4">
              {stats.categoryDistribution.map((item: any) => (
                <SimpleProgressBar 
                  key={item.name} 
                  label={item.name} 
                  value={item.value} 
                  total={stats.global.totalInscriptions || 1}
                  colorClass="bg-violet-500"
                />
              ))}
            </div>
          </MetricBox>
        )}
      </div>

      {/* 📊 Tabla de Rendimiento por Evento */}
      <MetricBox title="Rendimiento por Evento" icon={<Ticket className="size-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[10px] font-black uppercase text-muted-foreground tracking-widest">
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
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">{ev.title}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase tracking-wider text-muted-foreground">(Filtrar)</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-muted-foreground font-medium">{ev.city || "—"}</td>
                  <td className="py-4 px-2 min-w-[140px]">
                    {ev.isUnlimited ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-500 text-[10px] font-black uppercase tracking-wider">
                        ∞ Ilimitado
                      </span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              (ev.occupancyRate ?? 0) >= 100 ? "bg-emerald-500" : "bg-primary"
                            )}
                            style={{ width: `${Math.min(ev.occupancyRate ?? 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-black text-foreground/80">{Math.round(ev.occupancyRate ?? 0)}%</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-2 text-right font-black text-emerald-500">{ev.confirmed}</td>
                  <td className="py-4 px-2 text-right font-medium text-muted-foreground/60">{ev.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MetricBox>
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────────

function MetricKpiCard({ label, value, description, icon, color, onClick, hint }: { 
  label: string; value: string; description: string; icon: React.ReactNode; color: string; onClick?: () => void; hint?: string; 
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    green: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500"
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-card p-6 rounded-3xl border border-border shadow-sm space-y-3 transition-all duration-200 group",
        onClick && "cursor-pointer hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
      )}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</span>
        <div className={cn("p-2 rounded-xl", colors[color])}>{icon}</div>
      </div>
      <div className="space-y-1">
        <h4 className="text-3xl font-black text-foreground">{value}</h4>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium text-muted-foreground leading-tight">{description}</p>
          {hint && onClick && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase tracking-wider text-primary whitespace-nowrap ml-2">
              {hint} →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card p-8 rounded-[40px] border border-border shadow-sm space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-muted/50 rounded-xl text-muted-foreground">{icon}</div>
        <h3 className="text-xl font-bold text-foreground tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SimpleProgressBar({ label, value, total, colorClass, onClick }: { 
  label: string; value: number; total: number; colorClass: string; onClick?: () => void; 
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div 
      className={cn(
        "space-y-2 group transition-all duration-200",
        onClick && "cursor-pointer hover:translate-x-1"
      )} 
      onClick={onClick}
    >
      <div className="flex justify-between text-xs font-bold">
        <div className="flex items-center gap-1.5">
          <span className="text-foreground/80 group-hover:text-primary transition-colors">{label}</span>
          {onClick && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase tracking-wider text-muted-foreground">(Filtrar)</span>
          )}
        </div>
        <span className="text-muted-foreground/60 shrink-0">{value} ({Math.round(percentage)}%)</span>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ExpandableCountryList({ countries, total, onCountryClick }: {
  countries: { name: string; value: number }[];
  total: number;
  onCountryClick?: (country: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const TOP_N = 5;
  const visible = expanded ? countries : countries.slice(0, TOP_N);
  const remaining = countries.length - TOP_N;

  return (
    <div className="space-y-4">
      {visible.map((item) => (
        <SimpleProgressBar 
          key={item.name} 
          label={item.name} 
          value={item.value} 
          total={total} 
          colorClass="bg-blue-600"
          onClick={() => onCountryClick?.(item.name === "No especificado" ? "unspecified" : item.name)}
        />
      ))}

      {remaining > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mt-2"
        >
          {expanded ? (
            <><ChevronUp className="size-3.5" /> Ocultar</>
          ) : (
            <><ChevronDown className="size-3.5" /> + Ver otros {remaining} países</>
          )}
        </button>
      )}
    </div>
  );
}

function TrendChart({ data, weeklyDelta, thisWeekTotal }: {
  data: { date: string; label: string; count: number }[];
  weeklyDelta: number;
  thisWeekTotal: number;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Paleta de colores para los segmentos (consistente con el design system)
  const COLORS = [
    "#3154DC", // primary blue
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#06b6d4", // cyan-500
    "#ec4899", // pink-500
  ];

  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  // Calcular arcos del donut
  const CX = 110;
  const CY = 110;
  const R_OUTER = 90;
  const R_INNER = 54; // grosor del anillo

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const slices = (() => {
    let startAngle = -90; // empieza desde arriba
    return data.map((d, i) => {
      const pct = d.count / total;
      const sweep = pct * 360;
      const endAngle = startAngle + sweep;

      const startRad = toRad(startAngle);
      const endRad = toRad(endAngle);
      const largeArc = sweep > 180 ? 1 : 0;

      const x1o = CX + R_OUTER * Math.cos(startRad);
      const y1o = CY + R_OUTER * Math.sin(startRad);
      const x2o = CX + R_OUTER * Math.cos(endRad);
      const y2o = CY + R_OUTER * Math.sin(endRad);

      const x1i = CX + R_INNER * Math.cos(endRad);
      const y1i = CY + R_INNER * Math.sin(endRad);
      const x2i = CX + R_INNER * Math.cos(startRad);
      const y2i = CY + R_INNER * Math.sin(startRad);

      const path = `M ${x1o} ${y1o} A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${x2i} ${y2i} Z`;

      // Punto medio del arco para la leyenda
      const midAngle = toRad(startAngle + sweep / 2);

      const result = { path, color: COLORS[i % COLORS.length], pct, midAngle, ...d };
      startAngle = endAngle;
      return result;
    });
  })();

  const active = activeIdx !== null ? slices[activeIdx] : null;

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">
          Esta semana: <span className="font-black text-foreground">{thisWeekTotal} registros</span>
        </span>
        <span className={cn(
          "text-[11px] font-black px-2.5 py-0.5 rounded-full",
          weeklyDelta > 0 ? "bg-emerald-500/10 text-emerald-500"
          : weeklyDelta < 0 ? "bg-red-500/10 text-red-500"
          : "bg-muted text-muted-foreground"
        )}>
          {weeklyDelta > 0 ? "+" : ""}{weeklyDelta}% vs semana anterior
        </span>
      </div>

      {/* Layout: donut izquierda + lista derecha — 50/50 */}
      <div className="flex flex-col sm:flex-row items-stretch gap-0">

        {/* Donut SVG — mitad izquierda */}
        <div className="relative w-full sm:w-1/2 flex items-center justify-center py-4">
          <svg viewBox="0 0 220 220" className="w-full max-w-[280px] h-auto" aria-label="Distribución de registros por día">
            {slices.map((s, i) => (
              <path
                key={s.date}
                d={s.path}
                fill={s.color}
                opacity={activeIdx === null || activeIdx === i ? 1 : 0.35}
                style={{
                  transition: 'opacity 0.2s, transform 0.2s',
                  transform: activeIdx === i ? `scale(1.04)` : 'scale(1)',
                  transformOrigin: `${CX}px ${CY}px`,
                  cursor: s.count > 0 ? 'pointer' : 'default',
                }}
                onMouseEnter={() => s.count > 0 && setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              />
            ))}

            {/* Círculo interior — centro vacío (transparente) con texto */}
            <circle cx={CX} cy={CY} r={R_INNER - 2} fill="none" />
            {active ? (
              <>
                <text
                  x={CX}
                  y={CY - 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    textAnchor: 'middle',
                    dominantBaseline: 'central',
                    fontSize: '24px',
                    fontWeight: 900,
                    fontFamily: 'inherit',
                    fill: active.color,
                  }}
                >
                  {active.count}
                </text>
                <text
                  x={CX}
                  y={CY + 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    textAnchor: 'middle',
                    dominantBaseline: 'central',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    fill: 'var(--muted-foreground)',
                  }}
                >
                  registro{active.count !== 1 ? 's' : ''}
                </text>
                <text
                  x={CX}
                  y={CY + 22}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    textAnchor: 'middle',
                    dominantBaseline: 'central',
                    fontSize: '9px',
                    fontWeight: 900,
                    fontFamily: 'inherit',
                    fill: 'var(--muted-foreground)',
                    opacity: 0.6,
                  }}
                >
                  {Math.round(active.pct * 100)}% del total
                </text>
              </>
            ) : (
              <>
                <text
                  x={CX}
                  y={CY - 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    textAnchor: 'middle',
                    dominantBaseline: 'central',
                    fontSize: '28px',
                    fontWeight: 900,
                    fontFamily: 'inherit',
                    fill: 'var(--foreground)',
                  }}
                >
                  {thisWeekTotal}
                </text>
                <text
                  x={CX}
                  y={CY + 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    textAnchor: 'middle',
                    dominantBaseline: 'central',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    fill: 'var(--muted-foreground)',
                  }}
                >
                  total semana
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Lista de días — mitad derecha */}
        <div className="w-full sm:w-1/2 space-y-2 border-t sm:border-t-0 sm:border-l border-border py-4 sm:pl-8 sm:pr-2">
          {slices.map((s, i) => {
            const isActive = activeIdx === i;
            return (
              <div
                key={s.date}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2 rounded-2xl transition-all duration-200 cursor-default",
                  isActive ? "bg-muted/60" : "hover:bg-muted/30"
                )}
                onMouseEnter={() => s.count > 0 && setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {/* Color dot + label */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color, opacity: activeIdx === null || isActive ? 1 : 0.4, transition: 'opacity 0.2s' }}
                  />
                  <span
                    className="text-sm font-bold truncate transition-colors duration-150"
                    style={{ color: isActive ? s.color : 'var(--foreground)' }}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Barra mini + número */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.pct * 100}%`, backgroundColor: s.color }}
                    />
                  </div>
                  <span
                    className="text-sm font-black min-w-[28px] text-right transition-colors duration-150"
                    style={{ color: isActive ? s.color : 'var(--foreground)' }}
                  >
                    {s.count}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground/60 min-w-[32px]">
                    {s.count === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
