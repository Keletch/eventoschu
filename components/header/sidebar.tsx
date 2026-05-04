"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Info, 
  GraduationCap, 
  Calendar, 
  Trophy, 
  BookOpen, 
  LayoutDashboard,
  ExternalLink,
  Sparkles,
  Zap,
  Target
} from "lucide-react";
import { SidebarScrollbar } from "@/components/ui/sidebar-scrollbar";

interface SidebarProps {
  isOpen: boolean;
}

const SIDEBAR_LINKS = [
  {
    category: "Ecosistema",
    links: [
      { name: "Sobre CDI", href: "https://elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Info, isExternal: true },
      { name: "Campus CDI", href: "https://campus.elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: LayoutDashboard, isExternal: true, highlight: true },
    ]
  },
  {
    category: "Formación",
    links: [
      { name: "Membresía CDI", href: "https://elclubdeinversionistas.com/membresia-cdi?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: GraduationCap, isExternal: true },
      { name: "Club de Lectura", href: "https://clubdelecturacdi.com/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: BookOpen, isExternal: true },
      { name: "Recursos", href: "https://elclubdeinversionistas.com/recursos/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Sparkles, isExternal: true },
      { name: "Base de conocimientos", href: "https://elclubdeinversionistas.zendesk.com/hc/es?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Info, isExternal: true },
    ]
  },
  {
    category: "Eventos y Talleres",
    links: [
      { name: "Calendario Actual", href: "/", icon: Calendar, isExternal: false, highlight: true },
      { name: "Calendario Oficial", href: "https://chu.mx/eventos/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Calendar, isExternal: true },
      { name: "Evento FIRE", href: "https://eventofire.com/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Sparkles, isExternal: true },
      { name: "Bootcamp", href: "https://bootcampinvestment.com/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: GraduationCap, isExternal: true },
      { name: "SHIFT", href: "https://www.summitfinanzasytrading.com/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Zap, isExternal: true },
      { name: "Taller Daytrading", href: "https://chu.mx/daytrading?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Target, isExternal: true },
      { name: "Taller Trending", href: "https://chu.mx/taller-trending?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Target, isExternal: true },
    ]
  },
  {
    category: "Retos y Torneos",
    links: [
      { name: "Reto CH1k", href: "https://elclubdeinversionistas.com/challenge1k?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Trophy, isExternal: true },
      { name: "Sin Deudas", href: "https://elclubdeinversionistas.com/reto-financiero-deudas/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Zap, isExternal: true },
      { name: "Reto Long", href: "https://elclubdeinversionistas.com/reto-financiero-long-term/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Target, isExternal: true },
      { name: "Reto Trend", href: "https://elclubdeinversionistas.com/reto-trend/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Zap, isExternal: true },
      { name: "Torneo Trading 2025", href: "https://chu.mx/TorneoTrading2025?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Trophy, isExternal: true },
    ]
  },
  {
    category: "Contenido",
    links: [
      { name: "Blog CDI", href: "https://elclubdeinversionistas.com/blog-finanzas/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: BookOpen, isExternal: true },
      { name: "Blog Trading", href: "https://elclubdeinversionistas.com/blog-finanzas/trading/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: BookOpen, isExternal: true },
      { name: "Revista ZTM", href: "https://zentradingmagazine.com/?utm_source=eventos_cdi&utm_medium=sidebar&utm_campaign=ecosistema_cdi", icon: Sparkles, isExternal: true },
    ]
  }
];

export function Sidebar({ isOpen }: SidebarProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-20 h-[calc(100vh-80px)] w-72 bg-[#3154dc] transition-all duration-300 z-50 overflow-hidden shadow-2xl shadow-black/20",
        isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
      )}
    >
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto p-4 pb-24 space-y-6 scrollbar-none relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {SIDEBAR_LINKS.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <h3 className="px-4 py-1 text-[10px] font-bold text-white/50 uppercase tracking-[0.15em]">
              {group.category}
            </h3>
            <div className="space-y-0.5">
              {group.links.map((link, lIdx) => (
                <a
                  key={lIdx}
                  href={link.href}
                  target={link.isExternal ? "_blank" : undefined}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group",
                    link.highlight 
                      ? "bg-white text-[#3154dc] hover:bg-white/90 shadow-lg shadow-black/10" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className={cn("size-5 transition-colors", link.highlight ? "text-[#3154dc]" : "text-white/60 group-hover:text-white")} />
                    <span className="font-bold text-sm tracking-tight">{link.name}</span>
                  </div>
                  {link.isExternal && <ExternalLink className="size-3 opacity-0 group-hover:opacity-30 transition-opacity" />}
                </a>
              ))}
            </div>
          </div>
        ))}

      </div>
      
      <SidebarScrollbar scrollContainerRef={scrollContainerRef} />

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </aside>
  );
}
