import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * HeaderSkeleton: Evita que el sitio "brinque" al cargar
 */
export function HeaderSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 border-b border-border bg-background/80 backdrop-blur-md z-[100] px-4 md:px-8 lg:px-12">
      <div className="max-w-[1512px] h-full mx-auto flex items-center justify-between">
        {/* Header bar space reserved, no skeletons as requested */}
      </div>
    </header>
  );
}

/**
 * HeroSkeleton: Réplica exacta del HeroSection
 */
export function HeroSkeleton() {
  return (
    <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in duration-500">
      {/* Badge Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-[42px] w-[280px] rounded-full border border-primary/10 bg-primary/5" />
      </div>

      {/* Title Skeleton (WordRotator + Name) */}
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-[70px] sm:h-[100px] lg:h-[150px] w-[300px] sm:w-[500px] lg:w-[700px] rounded-3xl" />
        <Skeleton className="h-[40px] sm:h-[60px] lg:h-[88px] w-[250px] sm:w-[400px] lg:w-[550px] rounded-2xl" />
      </div>

      {/* Description Skeleton */}
      <div className="max-w-3xl mx-auto space-y-3 px-4">
        <Skeleton className="h-6 w-full rounded-full" />
        <Skeleton className="h-6 w-2/3 mx-auto rounded-full" />
      </div>

      {/* CTAs Skeleton */}
      <div className="flex flex-col items-center gap-6 pt-6">
        <Skeleton className="h-14 w-[240px] rounded-2xl shadow-sm" />
        <Skeleton className="h-6 w-[300px] rounded-full" />
      </div>
    </div>
  );
}

/**
 * CategoryTabsSkeleton: Réplica exacta de CategoryTabs
 */
export function CategoryTabsSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-4 items-center px-1">
      <Skeleton className="h-[38px] w-32 rounded-xl shrink-0" />
      <Skeleton className="h-[38px] w-36 rounded-xl shrink-0" />
      <Skeleton className="h-[38px] w-40 rounded-xl shrink-0" />
      <Skeleton className="h-[38px] w-32 rounded-xl shrink-0" />
    </div>
  );
}

/**
 * MonthTabsSkeleton: Réplica exacta de MonthTabs
 */
export function MonthTabsSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden pb-0 px-1">
      <Skeleton className="h-[46px] w-32 rounded-t-xl shrink-0" />
      <Skeleton className="h-[46px] w-32 rounded-t-xl shrink-0" />
      <Skeleton className="h-[46px] w-32 rounded-t-xl shrink-0" />
    </div>
  );
}
