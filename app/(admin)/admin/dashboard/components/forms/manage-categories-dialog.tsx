"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCategory, deleteCategory, updateCategory } from "@/app/actions/admin-categories";
import { Loader2, Plus, Trash2, Edit, FolderTree, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadImage } from "@/app/actions/upload-image";
import { convertToWebP } from "@/lib/image-utils";
import { AVAILABLE_ICONS } from "@/lib/icons";
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
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Filtrar solo las categorías principales para ser padres
  const parentCategories = categories.filter(c => !c.parent_category_id);

  const handleEditClick = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setParentId(category.parent_category_id || "none");
    if (category.icon && category.icon.startsWith("http")) {
      setImageUrl(category.icon);
      setIcon("Custom");
    } else {
      setIcon(category.icon || "Calendar");
      setImageUrl("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName("");
    setParentId("none");
    setIcon("Calendar");
    setImageUrl("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("El nombre de la categoría es requerido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parent = parentId === "none" ? null : parentId;
      const selectedIcon = parentId === "none" ? (imageUrl ? imageUrl : icon) : null;

      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, name, parent, selectedIcon);
        
        if (result.success) {
          toast.success("Categoría actualizada con éxito.");
          handleCancelEdit();
          if (onCategoryAdded) onCategoryAdded();
        } else {
          toast.error(result.error || "Error al actualizar la categoría.");
        }
      } else {
        const result = await createCategory(name, parent, selectedIcon);
        
        if (result.success) {
          toast.success("Categoría creada con éxito.");
          setName("");
          setParentId("none");
          setIcon("Calendar");
          setImageUrl("");
          if (onCategoryAdded) onCategoryAdded();
        } else {
          toast.error(result.error || "Error al crear la categoría.");
        }
      }
    } catch (_error) {
      toast.error("Error inesperado al procesar.");
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
    } catch (_error) {
      toast.error("Error inesperado al eliminar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (Máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen original es demasiado gigante. Máximo 10MB permitido.");
      return;
    }
    
    setIsUploading(true);
    try {
      toast.info("Optimizando imagen...");
      const optimizedFile = await convertToWebP(file, 800, 0.8);

      const formData = new FormData();
      formData.append("file", optimizedFile);
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setImageUrl(res.url);
        setIcon("Custom");
        toast.success("Imagen subida con éxito.");
      } else {
        toast.error(res.error || "Error al subir imagen.");
      }
    } catch (_error) {
      toast.error("Error al subir la imagen.");
    } finally {
      setIsUploading(false);
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
            {/* Formulario de creación/edición */}
            <div className="bg-muted/30 border border-border p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-foreground">
                {editingCategory ? "Editar categoría" : "Crear nueva categoría"}
              </h3>
              
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
                  <Label className="text-xs font-black uppercase text-muted-foreground">Categoría Padre</Label>
                  <Select value={parentId} onValueChange={(val) => setParentId(val || "none")}>
                    <SelectTrigger className="h-12 rounded-xl bg-background border-border truncate pr-2">
                      <SelectValue placeholder="Ninguna">
                        {parentId === "none" 
                          ? "Ninguna" 
                          : parentCategories.find(c => c.id === parentId)?.name || parentId}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover">
                      <SelectItem value="none" className="font-bold">Ninguna</SelectItem>
                      {parentCategories
                        .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selector de Icono (Solo para Categorías Principales) */}
              {parentId === "none" && (
                <div className="space-y-3 pt-2 relative">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs font-black uppercase text-muted-foreground whitespace-nowrap">Ícono de la Categoría</Label>
                    <span className="text-[10px] text-muted-foreground/70 hidden sm:inline-block">Recomendado: Cuadrada 1:1, max 2MB</span>
                  </div>
                  {imageUrl ? (
                    <div className="p-4 border border-border rounded-xl flex flex-col items-center justify-center bg-muted/20 gap-3">
                      <img src={imageUrl} alt="Icono personalizado" className="size-16 object-cover rounded-xl shadow-sm border border-border" />
                      <span className="text-xs text-muted-foreground font-medium">Usando imagen personalizada</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                      {AVAILABLE_ICONS.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = icon === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => { setIcon(item.name); setImageUrl(""); }}
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
                  )}

                  <div className="flex items-center justify-end gap-2 mt-1">
                    <Label htmlFor="category-icon-upload" className="cursor-pointer text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5">
                      {isUploading ? "Subiendo..." : "Subir Imagen Personalizada"}
                    </Label>
                    <Input 
                      id="category-icon-upload" 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={isUploading || isSubmitting}
                    />
                    {imageUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-destructive hover:bg-destructive/10 text-[10px] rounded-full"
                        onClick={() => { setImageUrl(""); setIcon("Calendar"); }}
                      >
                        Quitar
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {editingCategory ? (
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !name.trim()}
                    className="flex-1 h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="size-5 animate-spin mr-2" /> : <Edit className="size-5 mr-2" />}
                    Guardar Cambios
                  </Button>
                  <Button 
                    onClick={handleCancelEdit} 
                    variant="outline"
                    disabled={isSubmitting}
                    className="h-12 px-6 rounded-xl font-bold border-border text-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !name.trim()}
                  className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="size-5 animate-spin mr-2" /> : <Plus className="size-5 mr-2" />}
                  Crear Categoría
                </Button>
              )}
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
                              if (parent.icon && parent.icon.startsWith("http")) {
                                return <img src={parent.icon} alt={parent.name} className="size-4 object-cover rounded-sm" />;
                              }
                              const FoundIcon = AVAILABLE_ICONS.find(i => i.name === parent.icon)?.icon || Calendar;
                              return <FoundIcon className="size-4 text-primary" />;
                            })()}
                          </div>
                          <span className="font-bold text-foreground">{parent.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(parent)}
                            disabled={isSubmitting}
                            className="text-primary hover:bg-primary/10 rounded-xl cursor-pointer size-8"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(parent.id)}
                            disabled={isSubmitting}
                            className="text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer size-8"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      
                      {children.length > 0 && (
                        <div className="pl-6 border-l-2 border-border/50 space-y-2">
                          {children.map(child => (
                            <div key={child.id} className="flex items-center justify-between bg-background border border-border/50 rounded-lg p-2 px-3">
                              <span className="text-sm font-medium text-muted-foreground">{child.name}</span>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditClick(child)}
                                  disabled={isSubmitting}
                                  className="text-primary hover:bg-primary/10 rounded-xl cursor-pointer size-6"
                                  title="Editar"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDelete(child.id)}
                                  disabled={isSubmitting}
                                  className="text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer size-6"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                              </div>
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
