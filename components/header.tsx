"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full flex justify-center pt-6 md:pt-8 px-4 md:px-8 lg:px-12 relative z-50">
      <div className="w-full max-w-[1440px] flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-sky-950 font-black text-2xl md:text-3xl tracking-tighter">
            CDI
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <nav className="hidden lg:flex bg-neutral-50 rounded-2xl px-4 xl:px-6 py-2 border border-gray-100 shadow-sm items-center gap-1 xl:gap-1.5 overflow-x-auto whitespace-nowrap">
          <Button variant="ghost" className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4">
            Sobre el CDI
          </Button>
          <Button variant="ghost" className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4 flex items-center gap-1">
            Formación <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4 flex items-center gap-1">
            Recursos gratuitos <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4 flex items-center gap-1">
            Eventos <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="text-gray-500 font-bold text-base xl:text-lg hover:text-blue-700 rounded-xl px-3 xl:px-4 flex items-center gap-1">
            Más <ChevronDown className="w-4 h-4" />
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Action Button */}
        <Button className="hidden sm:flex bg-[#3154DC] hover:opacity-90 text-neutral-50 font-bold text-base md:text-lg rounded-2xl px-6 md:px-8 h-11 md:h-12 shadow-md shadow-[#3154DC]/10 border border-neutral-50/20 shrink-0">
          Campus CDI
        </Button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col gap-2 lg:hidden">
          <Button variant="ghost" className="justify-start text-gray-600 font-bold h-12">Sobre el CDI</Button>
          <Button variant="ghost" className="justify-start text-gray-600 font-bold h-12">Formación</Button>
          <Button variant="ghost" className="justify-start text-gray-600 font-bold h-12">Recursos gratuitos</Button>
          <Button variant="ghost" className="justify-start text-gray-600 font-bold h-12">Eventos</Button>
          <Button variant="ghost" className="justify-start text-gray-600 font-bold h-12">Más</Button>
          <Button className="bg-[#3154DC] text-white font-bold h-12 rounded-xl mt-2">Campus CDI</Button>
        </div>
      )}
    </header>
  );
}
