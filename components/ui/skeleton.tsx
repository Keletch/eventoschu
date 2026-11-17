import { cn } from "@/lib/utils"

/**
 * Bloque de carga. Pulso suave sincronizado: todas las barras laten juntas.
 * (Antes cada barra tenía su propio brillo, que corría a distinta velocidad según su ancho y se veía desordenado.)
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("motion-safe:animate-pulse rounded-xl bg-foreground/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
