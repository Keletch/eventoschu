import { cn } from "@/lib/utils";

export function EventsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="h-6 w-3/4 md:w-1/2 bg-neutral-200/50 rounded-lg animate-pulse pl-2 md:pl-6" />

      {/* Grid horizontal de Cards simulando el Carrusel */}
      <div className="flex gap-8 overflow-hidden pb-4 min-h-[350px] md:min-h-[350px]">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="min-w-[290px] md:min-w-[360px] h-[420px] bg-white border border-neutral-100 rounded-[32px] p-8 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="h-6 w-3/4 bg-neutral-100 rounded-lg animate-pulse" />
              <div className="h-4 w-1/2 bg-neutral-50 rounded-lg animate-pulse" />
            </div>
            <div className="h-12 w-full bg-neutral-100 rounded-2xl animate-pulse mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
