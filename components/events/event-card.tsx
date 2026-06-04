"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Check, Calendar, Clock, MapPin, CircleDollarSign, Hourglass, ExternalLink, Plus, Minus, Info, Mail, Loader2, Lock, Unlock, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackPaidEventClick } from "@/app/actions/user-registration";
import { getContactTagsByEmail } from "@/app/actions/keap";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

// Modular Components
import { EventProgressBar } from "@/components/events/event-progress-bar";
import { EventSoldOutOverlay } from "@/components/events/event-sold-out-overlay";
import { EventFlag } from "@/components/ui/event-flag";

import { getEventUIConfig } from "@/lib/event-config";

interface PaidLink {
  url: string;
  button_text?: string;
  keap_tag_id?: string;
  price?: string;
}

interface EventCardProps {
  id: string;
  title: string;
  city: string;
  country: string;
  flag: string;
  imageUrl?: string | null;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: string;
  selected: boolean;
  onSelect: (id: string) => void;
  bgClass?: string;
  confirmedCount?: number;
  capacity?: number;
  initialStatus?: string;
  // Propiedades para eventos en línea
  isVirtual?: boolean;
  linkTitle?: string | null;
  linkUrl?: string | null;
  linkEnabled?: boolean;
  isPaid?: boolean;
  externalUrl?: string | null;
  externalButtonText?: string | null;
  description?: string | null;
  infoUrl?: string | null;
  // Nuevos: acceso por tags de Keap
  paidLinks?: PaidLink[];
  userKeapTags?: string[];
  isSignedIn?: boolean;
  onVerifySuccess?: (tags: string[]) => void;
  onOpenSSOOnboarding?: () => void;
}

export function EventCard({
  id,
  title,
  city,
  country,
  flag,
  imageUrl,
  date,
  time,
  duration,
  location,
  price,
  selected,
  onSelect,
  bgClass = "bg-primary/10",
  confirmedCount = 0,
  capacity = 25,
  initialStatus = 'confirmed',
  isVirtual = false,
  linkTitle,
  linkUrl,
  linkEnabled = false,
  isPaid = false,
  externalUrl,
  externalButtonText,
  description,
  infoUrl,
  paidLinks = [],
  userKeapTags = [],
  isSignedIn = false,
  onVerifySuccess,
  onOpenSSOOnboarding,
}: EventCardProps) {
  const { openSignIn } = useClerk();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modal de validación manual por correo (para invitados)
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // 🔑 Lógica de cascada: el ÚLTIMO paid_link cuyo tag coincida con los del usuario gana.
  const unlockedLink = React.useMemo(() => {
    if (!isPaid || paidLinks.length === 0) return null;
    // Recorremos en orden: el último que matchea tiene prioridad (cascada)
    let matched: PaidLink | null = null;
    for (const link of paidLinks) {
      if (!link.keap_tag_id) {
        // Sin restricción de tag → siempre disponible (fallback público)
        matched = link;
      } else if (userKeapTags.includes(link.keap_tag_id)) {
        matched = link;
      }
    }
    return matched;
  }, [isPaid, paidLinks, userKeapTags]);

  // Si tiene paid_links configurados, usarlos; si no, usar el externalUrl legacy
  const hasPaidLinksConfig = isPaid && paidLinks.length > 0;
  const effectiveUrl = hasPaidLinksConfig ? (unlockedLink?.url || externalUrl) : externalUrl;
  const effectiveButtonText = hasPaidLinksConfig
    ? (unlockedLink?.button_text || externalButtonText || "Adquirir entrada")
    : (externalButtonText || "Adquirir entrada");
  const isUnlocked = hasPaidLinksConfig ? !!unlockedLink : !!externalUrl;

  const handleVerifyAccess = async () => {
    if (!verifyEmail.trim()) return;
    setIsVerifying(true);
    try {
      const res = await getContactTagsByEmail(verifyEmail.trim().toLowerCase());
      const tags = res.tags || [];
      
      // Llamar al callback para actualizar de forma invisible el estado de tags en el front
      if (onVerifySuccess) {
        onVerifySuccess(tags);
      }

      // Buscamos cascada igual que en unlockedLink para determinar si hay un enlace exclusivo que le corresponda
      let foundExclusive = false;
      for (const link of paidLinks) {
        if (link.keap_tag_id && tags.includes(link.keap_tag_id)) {
          foundExclusive = true;
          break;
        }
      }

      setIsVerifyOpen(false);
      setVerifyEmail("");

      if (tags.length > 0) {
        if (foundExclusive) {
          toast.success("Membresía vinculada temporalmente con éxito. Enlaces actualizados", {
            duration: 8000,
          });
        } else {
          toast.success("Membresía vinculada temporalmente con éxito. No se encontraron eventos con promoción", {
            duration: 8000,
          });
        }
      } else {
        toast.error("No encontramos ninguna membresía del campus vinculada a este correo electrónico", {
          duration: 8000,
        });
      }
    } catch {
      toast.error("Error al verificar. Intenta de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (isInfoOpen) {
      setIframeLoading(true);
      setLoadingProgress(0);
      
      let currentProgress = 0;
      progressIntervalRef.current = setInterval(() => {
        if (currentProgress < 30) {
          currentProgress += Math.random() * 15;
        } else if (currentProgress < 60) {
          currentProgress += Math.random() * 5;
        } else if (currentProgress < 85) {
          currentProgress += Math.random() * 2;
        } else if (currentProgress < 95) {
          currentProgress += 0.2;
        }
        setLoadingProgress(Math.min(currentProgress, 95));
      }, 100);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [isInfoOpen]);

  const handleIframeLoad = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setLoadingProgress(100);
    setTimeout(() => {
      setIframeLoading(false);
    }, 400);
  };

  const hasDescription = !!description && description.trim().length > 0;
  const hasInfoUrl = !!infoUrl && infoUrl.trim().length > 0;
  const showInfoIcon = hasDescription || hasInfoUrl;

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInfoOpen(true);
  };

  const eventConfig = getEventUIConfig({ initial_status: initialStatus });
  const isUnlimited = capacity >= 9999;
  // Los eventos en línea nunca se marcan como llenos
  const isFull = !isVirtual && !isUnlimited && confirmedCount >= capacity;
  const isSoldOut = eventConfig.showFullCapacityOverlay && isFull;

  // Detectar si el título se trunca
  useEffect(() => {
    const checkTruncation = () => {
      if (titleRef.current) {
        const isTruncated = titleRef.current.scrollWidth > titleRef.current.clientWidth;
        setCanExpand(isTruncated);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [title]);

  return (
    <Card 
      className={cn(
        "relative h-full p-5 md:p-6 transition-all duration-300 border-2 rounded-[32px] overflow-hidden",
        "transform backface-visibility-hidden antialiased", // 🛠️ Solución global contra artifacts
        isSoldOut 
          ? "border-border bg-muted grayscale cursor-not-allowed" 
          : cn(
              "bg-card transition-all duration-300",
              isPaid
                ? "cursor-default border-card-border shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                : "cursor-pointer border-card-border shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
              selected && !isPaid && "border-primary ring-4 ring-primary/5 shadow-md shadow-primary/20 -translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            )
      )}
      onClick={() => {
        if (!isPaid && !isSoldOut) {
          onSelect(id);
        }
      }}
    >
      {isSoldOut && <EventSoldOutOverlay />}

      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-start gap-3 md:gap-4 overflow-hidden w-full">
            <EventFlag 
              flag={flag} 
              imageUrl={imageUrl}
              bgClass={bgClass}
              largeIcon
              className={cn(
                "size-12 md:size-14 rounded-[16px] md:rounded-[20px] shrink-0",
                imageUrl ? "p-0" : "p-2.5 md:p-3"
              )} 
            />
            <div className="flex flex-col gap-0.5 overflow-hidden w-full">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-card-badge-text">
                Evento Disponible
              </span>
              <div className="relative group/title mt-1">
                <div className={cn(
                  "overflow-hidden transition-[max-height] duration-300 ease-in-out relative",
                  isExpanded ? "max-h-[120px]" : "max-h-[22px] md:max-h-[28px]"
                )}>
                  <h3 
                    ref={titleRef}
                    className={cn(
                      "text-xl md:text-2xl font-bold text-card-title leading-[1.1] text-left w-full",
                      (!isExpanded && !isTransitioning) && "truncate"
                    )}
                  >
                    {title}
                  </h3>
                </div>
              </div>
              
              <div className="text-sm md:text-base font-medium text-card-text flex items-center gap-1.5 truncate text-left w-full mt-1">
                <span>{city}</span>
                <span className="w-1 h-1 rounded-full bg-border mx-1" />
                <span>{country}</span>
                
                {canExpand && (
                  <span 
                    className={cn(
                      "ml-2 transition-all duration-300 inline-flex items-center",
                      "opacity-100",
                      isTransitioning && "opacity-50 pointer-events-none"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTransitioning) return;
                      setIsTransitioning(true);
                      setIsExpanded(!isExpanded);
                      setTimeout(() => setIsTransitioning(false), 300);
                    }}
                  >
                    <div className="size-4 md:size-5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm transition-all hover:bg-primary/20 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 shadow-sm">
                      {isExpanded ? (
                        <Minus className="size-2 md:size-2.5 text-primary" strokeWidth={3} />
                      ) : (
                        <Plus className="size-2 md:size-2.5 text-primary" strokeWidth={3} />
                      )}
                    </div>
                  </span>
                )}
              </div>
            </div>
          </div>
        
          <div className="flex items-center gap-2 shrink-0">
            {showInfoIcon && (
              <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                  <DialogContent 
                    className={cn(
                      "border-none shadow-2xl bg-card text-foreground transition-all duration-300",
                      hasInfoUrl 
                        ? "max-w-[1400px] w-[96vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-[32px]" 
                        : "max-w-md rounded-[32px] p-6 gap-4"
                    )}
                  >
                    {hasInfoUrl ? (
                      <>
                        <DialogHeader className="px-6 py-2 md:py-2.5 shrink-0 pr-20 flex flex-col justify-end gap-0 relative">
                          <DialogTitle className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                            Información del Evento
                          </DialogTitle>
                          <DialogDescription className="text-sm md:text-base font-bold text-foreground line-clamp-1 leading-tight">
                            {title}
                          </DialogDescription>
                          <style dangerouslySetInnerHTML={{__html: `
                            [data-slot="dialog-content"]:has(iframe) [data-slot="dialog-close"] {
                              top: 10px !important;
                              right: 24px !important;
                            }
                            @media (max-width: 768px) {
                              [data-slot="dialog-content"]:has(iframe) [data-slot="dialog-close"] {
                                top: 6px !important;
                                  right: 12px !important;
                                  transform: scale(0.8) !important;
                              }
                            }
                            .no-scrollbar::-webkit-scrollbar {
                              display: none !important;
                            }
                            .no-scrollbar {
                              -ms-overflow-style: none !important;
                              scrollbar-width: none !important;
                            }
                          `}} />
                        </DialogHeader>

                        {/* Progress Bar physically between Header and Iframe */}
                        <div 
                          className={cn(
                            "w-full bg-primary/10 shrink-0 overflow-hidden relative transition-all duration-500 ease-in-out",
                            iframeLoading ? "h-[3px] opacity-100" : "h-0 opacity-0 pointer-events-none"
                          )}
                        >
                          <div 
                            className="h-full bg-primary transition-all duration-300 ease-out" 
                            style={{ width: `${loadingProgress}%` }}
                          />
                        </div>

                        {isInfoOpen && (
                          <div className="flex-1 w-full bg-background rounded-b-[32px] overflow-y-auto relative no-scrollbar">
                            <iframe 
                              src={infoUrl!} 
                              loading="lazy" 
                              scrolling="no"
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-top-navigation-by-user-activation" 
                              className="w-full h-[3500px] border-none"
                              onLoad={handleIframeLoad}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <DialogHeader className="space-y-2">
                          <DialogTitle className="text-2xl font-black text-left flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                              <Info className="size-5" />
                            </span>
                            <span className="line-clamp-2 leading-tight">{title}</span>
                          </DialogTitle>
                          <DialogDescription className="text-left text-sm font-medium text-muted-foreground">
                            Detalles e información adicional del evento.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="py-2 text-left text-sm leading-relaxed text-foreground whitespace-pre-wrap max-h-[40vh] overflow-y-auto pr-1">
                          {description}
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setIsInfoOpen(false)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border bg-transparent hover:bg-muted text-foreground text-xs font-bold transition-all"
                          >
                            Cerrar
                          </button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
            )}

            {!isSoldOut && !isPaid && (
              <div className={cn(
                "w-6 h-6 md:w-7 md:h-7 rounded-[20px] border-2 flex items-center justify-center transition-all shrink-0",
                selected ? "bg-primary border-primary" : "border-primary"
              )}>
                {selected && <Check className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" strokeWidth={3} />}
              </div>
            )}
            {isPaid && (
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider shrink-0 select-none">
                Pago
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 text-sm md:text-[16px] leading-relaxed text-card-text">
          <div className="space-y-3">
            <EventDetailItem icon={<Calendar className="w-4 h-4 text-card-icon shrink-0" />} label="Fecha" value={date} />
            <EventDetailItem icon={<Clock className="w-4 h-4 text-card-icon shrink-0" />} label="Hora" value={time} />
            <EventDetailItem icon={<Hourglass className="w-4 h-4 text-card-icon shrink-0" />} label="Duración" value={duration} />
            {isVirtual ? (
              <div className="flex gap-3 items-center">
                <ExternalLink className="w-4 h-4 text-card-icon shrink-0" />
                <span className="font-bold shrink-0">Plataforma:</span>
                {linkEnabled && linkUrl ? (
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:text-primary/80 underline underline-offset-2 truncate font-medium transition-colors"
                  >
                    {linkTitle || "Acceder al evento"}
                  </a>
                ) : (
                  <span className="truncate">
                    {linkTitle || "Por confirmar"}
                  </span>
                )}
              </div>
            ) : (
              <EventDetailItem icon={<MapPin className="w-4 h-4 text-card-icon shrink-0" />} label="Sitio" value={location} />
            )}
            {unlockedLink && unlockedLink.price ? (
              <div className="flex gap-3 items-center">
                <CircleDollarSign className="w-4 h-4 text-card-icon shrink-0" />
                <span className="font-bold shrink-0">Precio:</span>
                <div className="flex items-center gap-2 truncate">
                  <span className="line-through text-muted-foreground/75 text-xs md:text-sm">{price}</span>
                  <span className="font-bold text-primary animate-in fade-in zoom-in-95 duration-500">{unlockedLink.price}</span>
                </div>
              </div>
            ) : (
              <EventDetailItem icon={<CircleDollarSign className="w-4 h-4 text-card-icon shrink-0" />} label="Precio" value={price} />
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-card-border h-[60px] flex flex-col justify-center">
          {isPaid ? (
            <>
              {/* === USUARIO LOGUEADO + TAG CORRECTO → Enlace desbloqueado === */}
              {isSignedIn && isUnlocked ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackPaidEventClick(id).catch((err) => console.error("Failed to track:", err));
                    window.open(effectiveUrl!, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Unlock className="size-3.5" strokeWidth={2.5} />
                  {effectiveButtonText}
                </button>
              ) : isSignedIn && !isUnlocked && hasPaidLinksConfig ? (
                /* === LOGUEADO PERO SIN TAG → Bloqueado (no tiene membresía) === */
                <button
                  type="button"
                  disabled
                  className="w-full rounded-full bg-muted border border-border text-muted-foreground font-bold h-11 text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Lock className="size-3.5" strokeWidth={2.5} />
                  Requiere membresía activa
                </button>
              ) : !hasPaidLinksConfig ? (
                /* === Sin paid_links config → comportamiento legacy === */
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (externalUrl) {
                      trackPaidEventClick(id).catch((err) => console.error("Failed to track:", err));
                      window.open(externalUrl, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {externalButtonText || "Adquirir entrada"}
                  <ExternalLink className="size-3.5" strokeWidth={2.5} />
                </button>
              ) : (
                /* === INVITADO (no logueado) → Botón para enlace predeterminado + Botón para verificar membresía/correo === */
                <div className="flex gap-2.5 w-full">
                  {showInfoIcon && (
                    <button
                      type="button"
                      onClick={handleInfoClick}
                      className="size-11 shrink-0 rounded-full bg-muted hover:bg-muted-hover border border-border text-foreground hover:text-foreground font-bold flex items-center justify-center transition-all hover:scale-[1.05] active:scale-[0.95]"
                      title="Más información"
                    >
                      <Info className="size-4.5" strokeWidth={2} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (effectiveUrl) {
                        trackPaidEventClick(id).catch((err) => console.error("Failed to track:", err));
                        window.open(effectiveUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {effectiveButtonText}
                    <ExternalLink className="size-3.5" strokeWidth={2.5} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsVerifyOpen(true); }}
                    className="size-11 shrink-0 rounded-full bg-muted hover:bg-muted-hover border border-border text-foreground hover:text-foreground font-bold flex items-center justify-center transition-all hover:scale-[1.05] active:scale-[0.95]"
                    title="Verificar acceso / membresía"
                  >
                    <ShieldCheck className="size-4.5" strokeWidth={2} />
                  </button>
                </div>
              )}

              {/* Modal de verificación manual por correo */}
              <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
                <DialogContent className="max-w-sm rounded-[32px] p-6 md:p-8 bg-card border-border shadow-2xl z-[250]">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-black text-left">¿Tienes membresía activa?</DialogTitle>
                    <DialogDescription className="text-left text-sm text-muted-foreground font-medium leading-relaxed">
                      Ingresa el correo con el que te registraste en el campus para verificar si tienes acceso a este evento.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4 space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="tu@correo.com"
                        value={verifyEmail}
                        onChange={(e) => setVerifyEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleVerifyAccess(); }}
                        className="pl-10 rounded-xl border-border bg-muted/30 h-11 text-sm"
                        disabled={isVerifying}
                      />
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed flex flex-col items-center justify-center text-center gap-1">
                      <p>
                        💡 <span className="font-bold">Ahorra tiempo:</span> Inicia sesión/Regístrate con este correo.
                      </p>
                      {onOpenSSOOnboarding && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsVerifyOpen(false);
                            onOpenSSOOnboarding();
                          }}
                          className="text-primary hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          Ver más detalles
                        </button>
                      )}
                    </div>
                  </div>

                   <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                    <Button
                      onClick={handleVerifyAccess}
                      disabled={isVerifying || !verifyEmail.trim()}
                      className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 gap-2 cursor-pointer"
                    >
                      {isVerifying ? <Loader2 className="size-4 animate-spin" /> : null}
                      {isVerifying ? "Verificando..." : "Verificar acceso"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setIsVerifyOpen(false); setVerifyEmail(""); }}
                      className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-medium transition-colors py-1 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <EventProgressBar 
              confirmedCount={confirmedCount}
              capacity={capacity}
              isSoldOut={isSoldOut}
              isOpenMode={eventConfig.type === 'OPEN'}
            />
          )}
        </div>
      </div>
    </Card>
  );
}

function EventDetailItem({ icon, label, value, isMultiLine }: { icon: React.ReactNode, label: string, value: string, isMultiLine?: boolean }) {
  return (
    <p className={cn("flex gap-3", isMultiLine ? "items-start" : "items-center")}>
      {icon}
      <span className="font-bold shrink-0">{label}:</span> 
      <span className={cn(isMultiLine ? "leading-tight" : "truncate")}>{value}</span>
    </p>
  );
}
