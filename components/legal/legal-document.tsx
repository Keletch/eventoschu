import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/header/logo";
import { LEGAL_DOCS, LEGAL_LAST_UPDATE } from "@/lib/legal";

interface LegalDocumentProps {
  title: string;
  intro: React.ReactNode;
  current: (typeof LEGAL_DOCS)[number]["href"];
  children: React.ReactNode;
}

/** Plantilla común de los documentos legales (servidor, sin JS extra). */
export function LegalDocument({ title, intro, current, children }: LegalDocumentProps) {
  return (
    <main className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
      <div className="flex items-center justify-between gap-4 mb-8">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 h-10 text-sm font-bold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Volver al calendario</span>
          <span className="sm:hidden">Volver</span>
        </Link>
      </div>

      <article className="rounded-[32px] border border-border bg-card px-5 py-8 sm:px-10 sm:py-12 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-8 border-b border-border pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Legales</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Última actualización: {LEGAL_LAST_UPDATE}</p>
          <div className="mt-5 text-base leading-relaxed text-muted-foreground">{intro}</div>
        </header>

        <div
          className="space-y-8 text-[15px] leading-relaxed text-muted-foreground
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-3 [&_h2]:scroll-mt-6
            [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-1
            [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
            [&_strong]:text-foreground [&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2"
        >
          {children}
        </div>
      </article>

      <nav aria-label="Documentos legales" className="mt-6 flex flex-wrap justify-center gap-2">
        {LEGAL_DOCS.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            aria-current={doc.href === current ? "page" : undefined}
            className="rounded-full px-4 h-9 inline-flex items-center text-xs font-bold border border-border transition-colors hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground aria-[current=page]:border-primary"
          >
            {doc.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
