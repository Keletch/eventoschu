import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";

export function EventsSkeleton() {
  return (
    <div className="flex gap-8 overflow-hidden py-24 px-20 -mx-20 -my-24 min-h-[450px]">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="min-w-[290px] md:min-w-[360px] bg-card border-2 border-border/50 rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden shadow-sm"
        >
          <div className="space-y-8">
            {/* Header: Flag + Title Area */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Skeleton className="size-12 md:size-14 rounded-[20px] shrink-0" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32 md:w-40 rounded-xl" />
                  <Skeleton className="h-4 w-24 rounded-full opacity-60" />
                </div>
              </div>
              <Skeleton className="size-6 md:size-7 rounded-full shrink-0 border-2 border-border/30" />
            </div>
            
            {/* Body: Detail Items List */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Skeleton className="size-4 rounded-full shrink-0 opacity-40" />
                  <Skeleton className="h-4 w-20 rounded-full opacity-80" />
                  <Skeleton className="h-4 flex-1 rounded-full opacity-40" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer: Progress Bar Area */}
          <div className="mt-8 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-20 rounded-full opacity-60" />
              <Skeleton className="h-3 w-12 rounded-full opacity-60" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
