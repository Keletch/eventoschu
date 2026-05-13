"use client";

export function EventSoldOutOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest animate-in zoom-in-95 duration-500 shadow-sm">
        Cupos Agotados
      </div>
    </div>
  );
}
