"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Turnstile from "react-turnstile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegistrationFormProps {
  onSubmit: (data: any, turnstileToken: string) => void;
  isLoading?: boolean;
}

const COUNTRY_CODES = [
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+34", country: "España", flag: "🇪🇸" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+507", country: "Panamá", flag: "🇵🇦" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+502", country: "Guatemala", flag: "🇬🇹" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+595", country: "Paraguay", flag: "🇵🇾" },
  { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  { code: "+503", country: "El Salvador", flag: "🇸🇻" },
  { code: "+504", country: "Honduras", flag: "🇭🇳" },
  { code: "+505", country: "Nicaragua", flag: "🇳🇮" },
  { code: "+1", country: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "+1", country: "Puerto Rico", flag: "🇵🇷" },
];

export function RegistrationForm({ onSubmit, isLoading }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phoneCode: "+51",
    phone: "",
  });
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error("Por favor completa la verificación de seguridad.");
      return;
    }
    onSubmit(formData, turnstileToken);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:gap-12">
      {/* Row 1: Names and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="flex flex-col gap-3">
          <Label htmlFor="firstName" className="text-gray-900 font-bold px-1">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="firstName" 
            name="firstName" 
            placeholder="Escribe tu nombre" 
            className="h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50" 
            required 
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="lastName" className="text-gray-900 font-bold px-1">
            Apellido <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="lastName" 
            name="lastName" 
            placeholder="Escribe tu apellido" 
            className="h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50" 
            required 
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-1">
          <Label htmlFor="email" className="text-gray-900 font-bold px-1">
            Correo electrónico <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="tucorreo@ejemplo.com" 
            className="h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50" 
            required 
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Row 2: Country and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="flex flex-col gap-3">
          <Label htmlFor="country" className="text-gray-900 font-bold px-1">
            País de residencia <span className="text-neutral-400 font-normal">(opcional)</span>
          </Label>
          <Input 
            id="country" 
            name="country" 
            placeholder="Escribe tu país" 
            className="h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50" 
            value={formData.country}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-3 md:col-span-2">
          <Label htmlFor="phone" className="text-gray-900 font-bold px-1">
            Teléfono (WhatsApp) <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-3">
            <Select 
              value={formData.phoneCode} 
              onValueChange={(val: string | null) => setFormData(prev => ({ ...prev, phoneCode: val || "" }))}
            >
              <SelectTrigger className="w-[110px] md:w-[140px] h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50 flex items-center justify-between px-4">
                <SelectValue placeholder="+51" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((item, idx) => (
                  <SelectItem key={idx} value={item.code}>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{item.flag}</span>
                      <span className="font-bold">{item.code}</span>
                      <span className="hidden md:inline text-xs text-neutral-400">({item.country})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              id="phone" 
              name="phone" 
              placeholder="987 654 321" 
              className="flex-1 h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50" 
              required
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Security and Submit */}
      <div className="flex flex-col items-center gap-8 pt-4">
        <div className="w-full flex justify-center scale-90 md:scale-100">
          <Turnstile 
            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
            onVerify={(token) => setTurnstileToken(token)}
            theme="light"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !turnstileToken}
          className={cn(
            "w-full h-16 bg-[#3154DC] hover:opacity-90 text-white font-bold rounded-3xl text-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#3154DC]/20 transition-all active:scale-[0.98] mt-4",
            (isLoading || !turnstileToken) && "opacity-70 cursor-not-allowed grayscale"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Procesando...</span>
            </div>
          ) : (
            "¡Registrarme ahora!"
          )}
        </Button>
      </div>
    </form>
  );
}
