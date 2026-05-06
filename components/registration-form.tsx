"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Edit3 } from "lucide-react";
import Turnstile from "react-turnstile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser, useClerk } from "@clerk/nextjs";
import { checkRegistration } from "@/app/actions/user-registration";
import { Button } from "@/components/ui/button";
import { COUNTRY_CODES } from "@/lib/constants";

// Modular Components
import { FormField } from "./registration/form-field";
import { PhoneInput } from "./registration/phone-input";
import { CountrySelector } from "./registration/country-selector";

interface RegistrationFormProps {
  onSubmit: (data: any, turnstileToken: string) => void;
  onCheckRegistration: (data: any) => void;
  isLoading?: boolean;
}

export function RegistrationForm({ 
  onSubmit, 
  onCheckRegistration,
  isLoading = false 
}: RegistrationFormProps) {
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phoneCode: "+51",
    phone: "",
  });
  const [isOtherCountry, setIsOtherCountry] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  const fetchSupabaseData = useCallback(async (email: string) => {
    try {
      const result = await checkRegistration(email, user?.id);
      if (result.success && result.userData) {
        const dbData = result.userData;
        
        // PRIORIDAD: Si hay sesión iniciada, el nombre/apellido de Clerk MANDA.
        // Si no, usamos Supabase como respaldo.
        const finalFirstName = user?.firstName || dbData.first_name;
        const finalLastName = user?.lastName || dbData.last_name;

        setFormData(prev => ({
          ...prev,
          firstName: finalFirstName || prev.firstName,
          lastName: finalLastName || prev.lastName,
          phone: dbData.phone || prev.phone,
          phoneCode: dbData.phone_code || prev.phoneCode,
          country: dbData.residence_country || prev.country,
        }));
        if (dbData.residence_country && !COUNTRY_CODES.some(c => c.country === dbData.residence_country)) {
          setIsOtherCountry(true);
        }
      }
    } catch (err) {
      console.error("Error fetching user data from Supabase:", err);
    }
  }, [user?.id, user?.firstName, user?.lastName, onCheckRegistration]);

  // 💡 Mantenemos un registro del estado anterior de isSignedIn para detectar cambios reales
  const prevIsSignedInRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    // Si Clerk está cargando (undefined), no hacemos nada
    if (isSignedIn === undefined) return;

    // Detectamos si el usuario acaba de cerrar sesión (Pasó de true a false)
    const justLoggedOut = prevIsSignedInRef.current === true && isSignedIn === false;

    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress || "";
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: email || prev.email,
      }));

      if (email) {
        fetchSupabaseData(email);
      }
    } else if (justLoggedOut) {
      // SOLO reseteamos si realmente el usuario cerró sesión
      // No reseteamos si ya estaba en false y hubo un re-render
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        phoneCode: "+51",
        phone: "",
      });
      setIsOtherCountry(false);
    }

    // Actualizamos el ref para la próxima ejecución
    prevIsSignedInRef.current = isSignedIn;
  }, [isSignedIn, user, fetchSupabaseData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error("Por favor completa la verificación de seguridad.");
      return;
    }

    console.log("🚀 [Form-Submit] Iniciando envío con token:", turnstileToken.substring(0, 10) + "...");
    // Ejecutar el onSubmit del padre (que es asíncrono)
    const result = await (onSubmit as any)(formData, turnstileToken);
    
    console.log("📥 [Form-Submit] Respuesta recibida:", result);

    // Si el registro falló, reseteamos el token de Turnstile cambiando la key
    if (result && !result.success) {
      console.log("🔄 [Turnstile] Registro fallido, reseteando widget para nuevo intento.");
      setTurnstileToken("");
      setTurnstileKey(prev => prev + 1);
    } else if (result && result.success) {
      console.log("✨ [Form-Submit] Registro exitoso.");
    } else if (result === undefined) {
      console.warn("⚠️ [Form-Submit] ADVERTENCIA: La función onSubmit no devolvió ningún resultado. El reseteo de Turnstile podría no funcionar.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (val: string | null) => {
    const value = val || "";
    if (value === "otro") {
      setIsOtherCountry(true);
      setFormData(prev => ({ ...prev, country: "" }));
    } else {
      setIsOtherCountry(false);
      setFormData(prev => ({ ...prev, country: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:gap-12">
      {/* Row 1: Names and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <FormField
          id="firstName"
          name="firstName"
          label="Nombre"
          placeholder="Escribe tu nombre"
          required
          value={formData.firstName}
          onChange={handleChange}
        />
        <FormField
          id="lastName"
          name="lastName"
          label="Apellido"
          placeholder="Escribe tu apellido"
          required
          value={formData.lastName}
          onChange={handleChange}
        />
        <FormField
          id="email"
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          required
          readOnly={isSignedIn}
          value={formData.email}
          onChange={handleChange}
          className="md:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Row 2: Country and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <CountrySelector 
          value={formData.country}
          isOther={isOtherCountry}
          onSelect={handleCountryChange}
          onCustomChange={handleChange}
        />
        <PhoneInput 
          phoneCode={formData.phoneCode}
          phone={formData.phone}
          onPhoneCodeChange={(val) => setFormData(prev => ({ ...prev, phoneCode: val || "" }))}
          onPhoneChange={handleChange}
        />
      </div>

      {/* Security and Submit */}
      <div className="flex flex-col items-center gap-8 pt-4">
        <div 
          key={turnstileKey}
          className="w-full flex justify-center scale-90 md:scale-100 min-h-[65px] animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
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
            "w-full h-16 bg-[#3154DC] hover:opacity-90 text-white font-bold rounded-3xl text-xl md:text-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#3154DC]/20 transition-all active:scale-[0.98] mt-4",
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

        {!isSignedIn && (
          <div className="flex flex-col items-center gap-2 mt-4 relative z-[100]">
            <button
              type="button"
              onClick={() => openSignIn({})}
              className="group flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors p-2 text-center"
            >
              <Edit3 className="w-4 h-4 shrink-0" />
              <span className="hover:underline leading-tight">¡Hazlo más fácil! Inicia sesión para autocompletar tus datos y asegurar tu lugar en segundos</span>
            </button>
            <p className="text-[11px] text-gray-500 font-medium text-center max-w-[400px]">
              <span className="text-gray-600 font-bold">Ahorra tiempo </span>al unirte a nuestra comunidad de inversores.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
