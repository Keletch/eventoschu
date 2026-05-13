"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import gsap from "gsap";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsReady(true);
  }, []);
 
  useEffect(() => {
    if (isReady && cardRef.current) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
 
      tl.to(containerRef.current, { opacity: 1, duration: 0.5 })
        .fromTo(cardRef.current,
          { y: 30, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2 },
          "-=0.2"
        )
        .fromTo(".animate-item",
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.8 },
          "-=0.8"
        );
    }
  }, [isReady]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 🛡️ VERIFICACIÓN DE LISTA BLANCA (NUEVO)
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error("No tienes permisos de administrador. Contacta al propietario.");
      }

      toast.success("Bienvenido al panel de control");

      gsap.to(cardRef.current, {
        y: -15,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => router.push("/admin/dashboard")
      });
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans">
        <div className="w-full max-w-md space-y-8">
          <div className="h-6 w-32 bg-muted rounded-lg animate-pulse mx-auto sm:mx-0" />
          <div className="bg-card border-border shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[48px] p-12 space-y-8">
            <div className="size-24 bg-muted/50 rounded-3xl animate-pulse mx-auto" />
            <div className="space-y-3">
              <div className="h-8 w-48 bg-muted/50 rounded-lg animate-pulse mx-auto" />
              <div className="h-4 w-64 bg-muted/30 rounded-lg animate-pulse mx-auto" />
            </div>
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <div className="h-3 w-24 bg-muted/50 rounded animate-pulse" />
                <div className="h-14 w-full bg-muted/30 rounded-2xl animate-pulse" />
              </div>
              <div className="h-14 w-full bg-muted/30 rounded-2xl animate-pulse" />
              <div className="h-14 w-full bg-muted/50 rounded-2xl animate-pulse pt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 selection:bg-primary/30 font-sans opacity-0">
      {/* Subtle Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-200/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-[120px]" />
      </div>


      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <div className="animate-item mb-8 text-center sm:text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-semibold group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Volver al portal principal
          </Link>
        </div>

        <Card ref={cardRef} className="bg-card border-border shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[48px] overflow-hidden">
          <CardHeader className="space-y-4 pt-12 px-8 text-center">
            <div className="animate-item flex justify-center mb-4">
              <div className="relative size-24 p-2">
                <Image
                  src="/cdi-logo.png"
                  alt="CDI Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="animate-item">
              <CardTitle className="text-3xl font-black text-foreground tracking-tight">Acceso Moderador</CardTitle>
              <CardDescription className="text-muted-foreground text-base mt-2 font-medium">
                Gestiona eventos y registros de HyenUk Chu
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-10 pb-14">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="animate-item space-y-2.5">
                <Label htmlFor="email" className="text-muted-foreground/60 font-bold ml-1 text-[11px] uppercase tracking-[0.2em]">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@tuemail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50 border-border text-foreground rounded-2xl h-14 px-6 focus:bg-card focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                  required
                />
              </div>

              <div className="animate-item space-y-2.5">
                <Label htmlFor="password" className="text-muted-foreground/60 font-bold ml-1 text-[11px] uppercase tracking-[0.2em]">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/50 border-border text-foreground rounded-2xl h-14 px-6 pr-14 focus:bg-card focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div className="animate-item pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 text-lg flex items-center justify-center gap-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : <ShieldCheck className="size-6" />}
                  {isLoading ? "Autenticando..." : "Ingresar al Panel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="animate-item text-center mt-10 text-muted-foreground/40 text-xs font-semibold tracking-wider">
          &copy; {new Date().getFullYear()}&nbsp; &bull; @elclubdeinversionistas &bull;
        </p>
      </div>
    </div>
  );
}

