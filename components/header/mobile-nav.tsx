"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  isSignedIn: boolean | undefined;
  onClose: () => void;
}

export function MobileNav({ isOpen, isSignedIn, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute top-4 left-4 right-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header con botón de cierre */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Navegación</p>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      {/* Mobile Auth */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6">
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <Button className="w-full bg-neutral-50 text-gray-700 font-bold h-12 rounded-xl border border-gray-100">
              Iniciar Sesión
            </Button>
          </SignInButton>
        ) : (
          <div className="flex items-center gap-3 px-4">
            <UserButton />
            <span className="font-bold text-gray-700">Mi Perfil</span>
          </div>
        )}
      </div>

      {/* Categoría: Sobre CDI */}
      <div className="flex flex-col gap-2">
        <a href="https://elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=sobre_cdi" target="_blank" className="flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-xl font-bold text-gray-700">
          Sobre el CDI <ExternalLink className="w-4 h-4 opacity-30" />
        </a>
      </div>

      {/* Categoría: Formación */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Formación</p>
        <div className="grid grid-cols-1 gap-1 pl-2">
          <a target="_blank" href="https://elclubdeinversionistas.com/membresia-cdi?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=membresia" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Membresía CDI</a>
          <p className="px-4 py-2 font-medium text-gray-400 opacity-50 italic">Entrenamientos Pago (Próximamente)</p>
          <a target="_blank" href="https://campus.elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=campus_cdi" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Campus CDI</a>
          <a target="_blank" href="https://elclubdeinversionistas.com/recursos/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=recursos" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Recursos</a>
        </div>
      </div>

      {/* Categoría: Eventos / Talleres */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Eventos / Talleres</p>
        <div className="grid grid-cols-1 gap-1 pl-2">
          <a target="_blank" href="https://eventofire.com/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=fire" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">FIRE</a>
          <a target="_blank" href="https://bootcampinvestment.com/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=bootcamp" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Bootcamp</a>
          <a target="_blank" href="https://www.summitfinanzasytrading.com/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=shift" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">SHIFT</a>
          <a target="_blank" href="https://chu.mx/daytrading?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=taller_daytrading" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Taller Daytrading</a>
          <a target="_blank" href="https://chu.mx/taller-trending?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=taller_trending" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Taller Trending</a>
          <a target="_blank" href="https://chu.mx/eventos/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=calendario_oficial" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Calendario Oficial</a>
        </div>
      </div>

      {/* Categoría: Retos / Torneos */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Retos / Torneos</p>
        <div className="grid grid-cols-1 gap-1 pl-2">
          <a target="_blank" href="https://elclubdeinversionistas.com/challenge1k?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=reto_ch1k" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Reto CH1k</a>
          <a target="_blank" href="https://elclubdeinversionistas.com/reto-financiero-deudas/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=reto_sin_deudas" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Reto Sin Deudas</a>
          <a target="_blank" href="https://elclubdeinversionistas.com/reto-trend/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=reto_trend" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Reto Trend</a>
          <a target="_blank" href="https://chu.mx/TorneoTrading2025?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=torneo_trading_2025" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Torneo Trading 2025</a>
        </div>
      </div>

      {/* Categoría: Contenido */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Contenido</p>
        <div className="grid grid-cols-1 gap-1 pl-2">
          <a target="_blank" href="https://elclubdeinversionistas.com/blog-finanzas/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=blog_cdi" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Blog CDI</a>
          <a target="_blank" href="https://zentradingmagazine.com/?utm_source=eventos_cdi&utm_medium=mobile_menu&utm_campaign=ecosistema_cdi&utm_content=revista_ztm" className="px-4 py-2 font-medium text-gray-600 hover:text-blue-600">Revista ZTM</a>
        </div>
      </div>

      {/* Social Links Mobile */}
      <div className="flex flex-col gap-4 px-4 pt-4 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nuestras Redes</p>
        <div className="flex items-center gap-4">
          <a target="_blank" href="https://www.facebook.com/somoscdi" className="p-2 bg-neutral-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
          </a>
          <a target="_blank" href="https://www.instagram.com/elclubdeinversionistas" className="p-2 bg-neutral-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a target="_blank" href="https://www.youtube.com/channel/UCIOxD-w2fEkmd-IUCjhn-ZQ" className="p-2 bg-neutral-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 0 0-2.122 2.136C0 8.055 0 12 0 12s0 3.945.501 5.814a3.017 3.017 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a target="_blank" href="https://x.com/somoscdi" className="p-2 bg-neutral-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
          </a>
        </div>
      </div>

      <a href="https://campus.elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=mobile_button&utm_campaign=ecosistema_cdi&utm_content=campus_cdi" target="_blank" className="w-full pt-2">
        <Button className="w-full bg-[#3154DC] text-white font-bold h-14 rounded-2xl shadow-xl shadow-[#3154DC]/20">Campus CDI</Button>
      </a>
      </div>
    </div>
  );
}
