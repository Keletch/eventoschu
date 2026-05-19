"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCategory, deleteCategory } from "@/app/actions/admin-categories";
import { Loader2, Plus, Trash2, FolderTree, Calendar, Laptop, MapPin, Users, Video, Globe, BookOpen, Presentation, Coffee, Building, Mic, Music, Camera, Zap, Award, NotebookPen, Monitor } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AVAILABLE_ICONS = [
  { name: "Calendar", icon: Calendar },
  { name: "Laptop", icon: Laptop },
  { name: "MapPin", icon: MapPin },
  { name: "Users", icon: Users },
  { name: "Video", icon: Video },
  { name: "Globe", icon: Globe },
  { name: "BookOpen", icon: BookOpen },
  { name: "Presentation", icon: Presentation },
  { name: "Coffee", icon: Coffee },
  { name: "Building", icon: Building },
  { name: "Mic", icon: Mic },
  { name: "Music", icon: Music },
  { name: "Camera", icon: Camera },
  { name: "Zap", icon: Zap },
  { name: "NotebookPen", icon: NotebookPen },
  { name: "Monitor", icon: Monitor },
  { name: "Award", icon: Award },
];
import { cn } from "@/lib/utils";

interface ManageCategoriesDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: any[];
  onCategoryAdded?: () => void;
}

export function ManageCategoriesDialog({ isOpen, setIsOpen, categories, onCategoryAdded }: ManageCategoriesDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("none");
  const [icon, setIcon] = useState<string>("Calendar");

  // Filtrar solo las categorías principales para ser padres
  const parentCategories = categories.filter(c => !c.parent_category_id);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("El nombre de la categoría es requerido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parent = parentId === "none" ? null : parentId;
      const selectedIcon = parentId === "none" ? icon : null;
      const result = await createCategory(name, parent, selectedIcon);
      
      if (result.success) {
        toast.success("Categoría creada con éxito.");
        setName("");
        setParentId("none");
        setIcon("Calendar");
        if (onCategoryAdded) onCategoryAdded();
      } else {
        toast.error(result.error || "Error al crear la categoría.");
      }
    } catch (error) {
      toast.error("Error inesperado al crear.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta categoría? Si tiene eventos asociados, podrían quedar sin categoría.")) return;
    
    setIsSubmitting(true);
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Categoría eliminada.");
        if (onCategoryAdded) onCategoryAdded();
      } else {
        toast.error(result.error || "Error al eliminar.");
      }
    } catch (error) {
      toast.error("Error inesperado al eliminar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-card border-border rounded-[32px] p-0 shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="p-8 sm:p-10">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FolderTree className="size-7 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-foreground">Gestionar Categorías</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground mt-1">
                  Crea y organiza la estructura jerárquica de eventos.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* Formulario de creación */}
            <div className="bg-muted/30 border border-border p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-foreground">Crear nueva categoría</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Nombre</Label>
                  <Input 
                    placeholder="Ej. Club de Lectura"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-background border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Categoría Padre (Opcional)</Label>
                  <Select value={parentId} onValueChange={(val) => setParentId(val || "none")}>
                    <SelectTrigger className="h-12 rounded-xl bg-background border-border truncate pr-2">
                      <SelectValue placeholder="Ninguna (Categoría Principal)">
                        {parentId === "none" 
                          ? "Ninguna (Categoría Principal)" 
                          : parentCategories.find(c => c.id === parentId)?.name || parentId}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover">
                      <SelectItem value="none" className="font-bold">Ninguna (Categoría Principal)</SelectItem>
                      {parentCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selector de Icono (Solo para Categorías Principales) */}
              {parentId === "none" && (
                <div className="space-y-3 pt-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Ícono de la Categoría</Label>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                    {AVAILABLE_ICONS.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = icon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setIcon(item.name)}
                          className={cn(
                            "flex items-center justify-center p-3 rounded-xl border transition-all duration-200",
                            isActive 
                              ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                              : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                          )}
                          title={item.name}
                        >
                          <IconComponent className="size-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCreate} 
                disabled={isSubmitting || !name.trim()}
                className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? <Loader2 className="size-5 animate-spin mr-2" /> : <Plus className="size-5 mr-2" />}
                Crear Categoría
              </Button>
            </div>

            {/* Lista actual */}
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">Estructura Actual</h3>
              
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 hide-scrollbar">
                {parentCategories.map(parent => {
                  const children = categories.filter(c => c.parent_category_id === parent.id);
                  return (
                    <div key={parent.id} className="bg-muted/10 border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background border border-border rounded-lg">
                            {(() => {
                              const FoundIcon = AVAILABLE_ICONS.find(i => i.name === parent.icon)?.icon || Calendar;
                              return <FoundIcon className="size-4 text-primary" />;
                            })()}
                          </div>
                          <span className="font-bold text-foreground">{parent.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(parent.id)}
                          disabled={isSubmitting}
                          className="text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer size-8"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      
                      {children.length > 0 && (
                        <div className="pl-6 border-l-2 border-border/50 space-y-2">
                          {children.map(child => (
                            <div key={child.id} className="flex items-center justify-between bg-background border border-border/50 rounded-lg p-2 px-3">
                              <span className="text-sm font-medium text-muted-foreground">{child.name}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(child.id)}
                                disabled={isSubmitting}
                                className="text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer size-6"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
