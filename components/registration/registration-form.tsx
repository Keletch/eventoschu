"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Edit3 } from "lucide-react";
import Turnstile from "react-turnstile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { checkRegistration } from "@/app/actions/user-registration";
import { Button } from "@/components/ui/button";
import { COUNTRY_CODES } from "@/lib/constants";

// Modular Components
import { FormField } from "./form-field";
import { PhoneInput } from "./phone-input";
import { CountrySelector } from "./country-selector";

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


    // Ejecutar el onSubmit del padre (que es asíncrono)
    const result = await (onSubmit as any)(formData, turnstileToken);
    


    // Si el registro falló, reseteamos el token de Turnstile cambiando la key
    if (result && !result.success) {

      setTurnstileToken("");
      setTurnstileKey(prev => prev + 1);
    } else if (result && result.success) {

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

  const { resolvedTheme } = useTheme();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">
      {/* Grid Principal: 2 filas x 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 items-end">
        {/* Fila 1 */}
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
        />

        {/* Fila 2 */}
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
        
        {/* Botón de Registro integrado en la grid */}
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={isLoading || !turnstileToken}
            className={cn(
              "w-full h-[44px] bg-form-btn-bg hover:opacity-90 text-form-btn-text font-bold rounded-xl text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-form-btn-bg/20",
              (isLoading || !turnstileToken) && "opacity-40 cursor-not-allowed active:scale-100"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "¡Registrarme ahora!"
            )}
          </Button>
        </div>
      </div>

      {/* Seguridad y Extras (Centrados abajo) */}
      <div className="flex flex-col items-center gap-6 mt-4">
        <div 
          key={turnstileKey}
          className="w-full flex justify-center scale-90 md:scale-100 min-h-[65px]"
        >
          <Turnstile
            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
            onVerify={(token) => setTurnstileToken(token)}
            theme={(resolvedTheme === "light" || resolvedTheme === "coffee") ? "light" : "dark"}
          />
        </div>
      </div>
    </form>
  );
}
