"use client";

export function EventSoldOutOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
      <div className="bg-red-600 text-white font-black text-2xl md:text-3xl px-8 py-3 rounded-2xl rotate-[-12deg] shadow-2xl border-4 border-white animate-in zoom-in-50 duration-500">
        CUPO LLENO
      </div>
    </div>
  );
}
