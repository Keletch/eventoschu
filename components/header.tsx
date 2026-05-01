"use client";

import { 
  SignInButton, 
  UserButton, 
  useAuth
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <header className="w-full flex justify-center pt-6 md:pt-8 px-4 md:px-8 lg:px-12 relative z-50">
      <div className="w-full max-w-[1440px] flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
            <Image
              src="/cdi-logo.png"
              alt="Club de Inversionistas"
              width={180}
              height={60}
              className="h-10 md:h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation Bar */}
        <nav className="hidden lg:flex bg-neutral-50 rounded-2xl px-4 xl:px-6 py-2 border border-gray-100 shadow-sm items-center gap-1 xl:gap-1.5">
          <Link href="https://elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=sobre_cdi" target="_blank">
            <Button variant="ghost" className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4 cursor-pointer transition-colors">
              Sobre CDI
            </Button>
          </Link>

          {/* Formación */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4 flex items-center gap-1 cursor-pointer outline-none transition-colors">
              Formación <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl p-2 border-gray-100 shadow-xl min-w-[200px] bg-white">
              <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://elclubdeinversionistas.com/membresia-cdi?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=membresia" className="flex items-center justify-between w-full font-medium px-3 py-2">Membresía CDI <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled className="rounded-xl px-3 py-2 font-medium opacity-50 cursor-not-allowed">Entrenamientos Pago (Próximamente)</DropdownMenuSubTrigger>
              </DropdownMenuSub>
              <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://campus.elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=campus_cdi" className="flex items-center justify-between w-full font-medium px-3 py-2">Campus CDI <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
              <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://clubdelecturacdi.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=club_lectura" className="flex items-center justify-between w-full font-medium px-3 py-2">Club de Lectura <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
              <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://elclubdeinversionistas.com/recursos/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=recursos" className="flex items-center justify-between w-full font-medium px-3 py-2">Recursos <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
              <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://elclubdeinversionistas.zendesk.com/hc/es?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=base_conocimientos" className="flex items-center justify-between w-full font-medium px-3 py-2">Base de conocimientos <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Eventos / Talleres */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4 flex items-center gap-1 cursor-pointer outline-none transition-colors whitespace-nowrap">
              Eventos / Talleres <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl p-2 border-gray-100 shadow-xl min-w-[220px] bg-white">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 font-medium">Eventos</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl">
                  <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://eventofire.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=fire" className="flex items-center justify-between w-full px-3 py-2">FIRE <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                  <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://bootcampinvestment.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=bootcamp" className="flex items-center justify-between w-full px-3 py-2">Bootcamp <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                  <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://www.summitfinanzasytrading.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=shift" className="flex items-center justify-between w-full px-3 py-2">SHIFT <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 font-medium">Talleres</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl">
                  <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://chu.mx/daytrading?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=taller_daytrading" className="flex items-center justify-between w-full px-3 py-2">Taller Daytrading <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                  <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://chu.mx/taller-trending?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=taller_trending" className="flex items-center justify-between w-full px-3 py-2">Taller Trending <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                  <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://chu.mx/taller-de-swing-trading?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=taller_swing_trading" className="flex items-center justify-between w-full px-3 py-2">Taller Swing Trading <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://chu.mx/eventos/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=calendario_eventos" className="flex items-center justify-between w-full font-medium px-3 py-2">Calendario de Eventos <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl cursor-pointer p-0 bg-blue-50 text-blue-700 focus:bg-blue-100 focus:text-blue-800">
                <Link href="/" className="flex items-center gap-2 font-bold px-3 py-2 w-full">Calendario Actual</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Retos / Torneos */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4 flex items-center gap-1 cursor-pointer outline-none transition-colors whitespace-nowrap">
              Retos / Torneos <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl p-2 border-gray-100 shadow-xl min-w-[220px] bg-white">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 font-medium">Retos</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl min-w-[180px]">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl px-3 py-2">Finanzas</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl">
                      <DropdownMenuItem className="p-0 rounded-xl"><a href="https://elclubdeinversionistas.com/challenge1k?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_ch1k" className="flex items-center justify-between w-full px-3 py-2">CH1k <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                      <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://elclubdeinversionistas.com/reto-financiero-deudas/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_sin_deudas" className="flex items-center justify-between w-full px-3 py-2">Sin deudas <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl px-3 py-2">Inversiones</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl">
                      <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://elclubdeinversionistas.com/reto-financiero-long-term/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_long" className="flex items-center justify-between w-full px-3 py-2">Long <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl px-3 py-2">Trading</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl">
                      <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://elclubdeinversionistas.com/reto-trend/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_trend" className="flex items-center justify-between w-full px-3 py-2">Trend <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                      <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://elclubdeinversionistas.com/reto-financiero-bootcamp/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_bc" className="flex items-center justify-between w-full px-3 py-2">BC <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 font-medium">Torneos</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl min-w-[180px]">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl px-3 py-2">Trading</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl">
                      <DropdownMenuItem className="p-0 rounded-xl"><a href="https://chu.mx/TorneoTrading2025?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=torneo_trading_2025" className="flex items-center justify-between w-full px-3 py-2">Torneo de Trading 2025 <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Blog / Revista */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4 flex items-center gap-1 cursor-pointer outline-none transition-colors">
              Contenido <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl p-2 border-gray-100 shadow-xl min-w-[200px] bg-white">
              <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://elclubdeinversionistas.com/blog-finanzas/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=blog_cdi" className="flex items-center justify-between w-full font-medium px-3 py-2">CDI <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
              <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://elclubdeinversionistas.com/blog-finanzas/trading/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=blog_trading" className="flex items-center justify-between w-full font-medium px-3 py-2">Trading <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
              <DropdownMenuItem className="p-0 rounded-xl"><a target="_blank" href="https://zentradingmagazine.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=revista_ztm" className="flex items-center justify-between w-full font-medium px-3 py-2">Revista ZTM <ExternalLink className="w-3 h-3 opacity-30" /></a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Campus CDI Integrated Button */}
          <a 
            href="https://campus.elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=header_nav&utm_campaign=ecosistema_cdi&utm_content=campus_cdi" 
            target="_blank"
            className="ml-2"
          >
            <Button className="bg-[#3154DC] hover:bg-[#2845c4] text-white font-bold text-sm h-10 px-5 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 shrink-0">
              Campus CDI <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <Button variant="ghost" className="hidden sm:flex text-gray-500 font-bold hover:text-blue-700 rounded-xl px-4 transition-colors">
                Entrar
              </Button>
            </SignInButton>
          ) : (
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 rounded-xl"
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 flex flex-col gap-6 lg:hidden animate-in fade-in slide-in-from-top-4 duration-200 max-h-[80vh] overflow-y-auto">
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
              <a target="_blank" href="https://www.facebook.com/somoscdi?utm_source=eventos_cdi&utm_medium=mobile_social&utm_campaign=ecosistema_cdi&utm_content=facebook" className="p-2 bg-neutral-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a target="_blank" href="https://www.instagram.com/elclubdeinversionistas?utm_source=eventos_cdi&utm_medium=mobile_social&utm_campaign=ecosistema_cdi&utm_content=instagram" className="p-2 bg-neutral-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a target="_blank" href="https://www.youtube.com/channel/UCIOxD-w2fEkmd-IUCjhn-ZQ?utm_source=eventos_cdi&utm_medium=mobile_social&utm_campaign=ecosistema_cdi&utm_content=youtube" className="p-2 bg-neutral-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 0 0-2.122 2.136C0 8.055 0 12 0 12s0 3.945.501 5.814a3.017 3.017 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a target="_blank" href="https://x.com/somoscdi?utm_source=eventos_cdi&utm_medium=mobile_social&utm_campaign=ecosistema_cdi&utm_content=twitter" className="p-2 bg-neutral-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              </a>
              <a target="_blank" href="https://www.twitch.tv/hyenukchu?utm_source=eventos_cdi&utm_medium=mobile_social&utm_campaign=ecosistema_cdi&utm_content=twitch" className="p-2 bg-neutral-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.571zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
              </a>
            </div>
          </div>

          <a href="https://campus.elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=mobile_button&utm_campaign=ecosistema_cdi&utm_content=campus_cdi" target="_blank" className="w-full pt-2">
            <Button className="w-full bg-[#3154DC] text-white font-bold h-14 rounded-2xl shadow-xl shadow-[#3154DC]/20">Campus CDI</Button>
          </a>
        </div>
      )}
    </header>
  );
}
