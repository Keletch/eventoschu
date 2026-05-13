import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse-gentle rounded-xl bg-slate-300/50 dark:bg-muted-foreground/10 relative overflow-hidden", className)}
      {...props}
    >
      {/* Shimmer Effect Global - Contraste reforzado */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/70 dark:via-muted-foreground/15 to-transparent" />
    </div>
  )
}

export { Skeleton }
