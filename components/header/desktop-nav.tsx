"use client";

import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function DesktopNav() {
  return (
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
          <DropdownMenuItem className="p-0 rounded-xl">
            <a target="_blank" href="https://elclubdeinversionistas.com/membresia-cdi?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=membresia" className="flex items-center justify-between w-full font-medium px-3 py-2">
              Membresía CDI <ExternalLink className="w-3 h-3 opacity-30" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled className="rounded-xl px-3 py-2 font-medium opacity-50 cursor-not-allowed">
              Entrenamientos Pago (Próximamente)
            </DropdownMenuSubTrigger>
          </DropdownMenuSub>
          <DropdownMenuItem className="p-0 rounded-xl">
            <a target="_blank" href="https://campus.elclubdeinversionistas.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=campus_cdi" className="flex items-center justify-between w-full font-medium px-3 py-2">
              Campus CDI <ExternalLink className="w-3 h-3 opacity-30" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 rounded-xl">
            <a target="_blank" href="https://clubdelecturacdi.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=club_lectura" className="flex items-center justify-between w-full font-medium px-3 py-2">
              Club de Lectura <ExternalLink className="w-3 h-3 opacity-30" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 rounded-xl">
            <a target="_blank" href="https://elclubdeinversionistas.com/recursos/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=recursos" className="flex items-center justify-between w-full font-medium px-3 py-2">
              Recursos <ExternalLink className="w-3 h-3 opacity-30" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 rounded-xl">
            <a target="_blank" href="https://elclubdeinversionistas.zendesk.com/hc/es?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=base_conocimientos" className="flex items-center justify-between w-full font-medium px-3 py-2">
              Base de conocimientos <ExternalLink className="w-3 h-3 opacity-30" />
            </a>
          </DropdownMenuItem>
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
              <DropdownMenuItem className="p-0 rounded-xl">
                <a target="_blank" href="https://eventofire.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=fire" className="flex items-center justify-between w-full px-3 py-2">
                  FIRE <ExternalLink className="w-3 h-3 opacity-30" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 rounded-xl">
                <a target="_blank" href="https://bootcampinvestment.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=bootcamp" className="flex items-center justify-between w-full px-3 py-2">
                  Bootcamp <ExternalLink className="w-3 h-3 opacity-30" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 rounded-xl">
                <a target="_blank" href="https://www.summitfinanzasytrading.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=shift" className="flex items-center justify-between w-full px-3 py-2">
                  SHIFT <ExternalLink className="w-3 h-3 opacity-30" />
                </a>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 font-medium">Talleres</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl">
              <DropdownMenuItem className="p-0 rounded-xl">
                <a target="_blank" href="https://chu.mx/daytrading?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=taller_daytrading" className="flex items-center justify-between w-full px-3 py-2">
                  Taller Daytrading <ExternalLink className="w-3 h-3 opacity-30" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 rounded-xl">
                <a target="_blank" href="https://chu.mx/taller-trending?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=taller_trending" className="flex items-center justify-between w-full px-3 py-2">
                  Taller Trending <ExternalLink className="w-3 h-3 opacity-30" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 rounded-xl">
                <a target="_blank" href="https://chu.mx/taller-de-swing-trading?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=taller_swing_trading" className="flex items-center justify-between w-full px-3 py-2">
                  Taller Swing Trading <ExternalLink className="w-3 h-3 opacity-30" />
                </a>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem className="p-0 rounded-xl">
            <a target="_blank" href="https://chu.mx/eventos/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=calendario_eventos" className="flex items-center justify-between w-full font-medium px-3 py-2">
              Calendario de Eventos <ExternalLink className="w-3 h-3 opacity-30" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="rounded-xl cursor-pointer p-0 bg-blue-50 text-blue-700 focus:bg-blue-100 focus:text-blue-800">
            <Link href="/" className="flex items-center gap-2 font-bold px-3 py-2 w-full">
              Calendario Actual
            </Link>
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
                  <DropdownMenuItem className="p-0 rounded-xl">
                    <a href="https://elclubdeinversionistas.com/challenge1k?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_ch1k" className="flex items-center justify-between w-full px-3 py-2">
                      CH1k <ExternalLink className="w-3 h-3 opacity-30" />
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 rounded-xl">
                    <a target="_blank" href="https://elclubdeinversionistas.com/reto-financiero-deudas/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_sin_deudas" className="flex items-center justify-between w-full px-3 py-2">
                      Sin deudas <ExternalLink className="w-3 h-3 opacity-30" />
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl px-3 py-2">Inversiones</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl">
                  <DropdownMenuItem className="p-0 rounded-xl">
                    <a target="_blank" href="https://elclubdeinversionistas.com/reto-financiero-long-term/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_long" className="flex items-center justify-between w-full px-3 py-2">
                      Long <ExternalLink className="w-3 h-3 opacity-30" />
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl px-3 py-2">Trading</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-2xl p-2 bg-white shadow-xl">
                  <DropdownMenuItem className="p-0 rounded-xl">
                    <a target="_blank" href="https://elclubdeinversionistas.com/reto-trend/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_trend" className="flex items-center justify-between w-full px-3 py-2">
                      Trend <ExternalLink className="w-3 h-3 opacity-30" />
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 rounded-xl">
                    <a target="_blank" href="https://elclubdeinversionistas.com/reto-financiero-bootcamp/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=reto_bc" className="flex items-center justify-between w-full px-3 py-2">
                      BC <ExternalLink className="w-3 h-3 opacity-30" />
                    </a>
                  </DropdownMenuItem>
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
                  <DropdownMenuItem className="p-0 rounded-xl">
                    <a href="https://chu.mx/TorneoTrading2025?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=torneo_trading_2025" className="flex items-center justify-between w-full px-3 py-2">
                      Torneo de Trading 2025 <ExternalLink className="w-3 h-3 opacity-30" />
                    </a>
                  </DropdownMenuItem>
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
          <DropdownMenuItem className="p-0 rounded-xl">
            <a target="_blank" href="https://elclubdeinversionistas.com/blog-finanzas/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=blog_cdi" className="flex items-center justify-between w-full font-medium px-3 py-2">
              CDI <ExternalLink className="w-3 h-3 opacity-30" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 rounded-xl">
            <a target="_blank" href="https://elclubdeinversionistas.com/blog-finanzas/trading/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=blog_trading" className="flex items-center justify-between w-full font-medium px-3 py-2">
              Trading <ExternalLink className="w-3 h-3 opacity-30" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 rounded-xl">
            <a target="_blank" href="https://zentradingmagazine.com/?utm_source=eventos_cdi&utm_medium=header_menu&utm_campaign=ecosistema_cdi&utm_content=revista_ztm" className="flex items-center justify-between w-full font-medium px-3 py-2">
              Revista ZTM <ExternalLink className="w-3 h-3 opacity-30" />
            </a>
          </DropdownMenuItem>
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
  );
}
