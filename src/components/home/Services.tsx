import Link from "next/link";
import { ArrowRight, CarFront, Footprints, Mountain, Route, Sparkles, Stars, type LucideIcon } from "lucide-react";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { toneOf } from "@/lib/tones";
import { NomaSymbol } from "@/components/ui/Logo";
import { Reveal, SectionTitle } from "@/components/ui/Reveal";

const ICONS: Record<string, LucideIcon> = {
  mountain: Mountain,
  car: CarFront,
  route: Route,
  sparkles: Sparkles,
  stars: Stars,
  trekking: Footprints,
};

/** Experiências NOMA em grade, como o feed do Instagram: cada card numa cor da marca. */
export function Services() {
  return (
    <section id="experiencias" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionTitle
          eyebrow="Experiência NOMA"
          title={
            <>
              Conexão, natureza e <em className="text-teal-gradient">exclusividade</em>
            </>
          }
          text="Da busca na pousada ao último raio de sol nas dunas, cuidamos de cada detalhe pra você só viver o momento."
        />
        <Reveal>
          <Link
            href="/#passeios"
            className="group inline-flex items-center gap-2 rounded-full bg-ink-800 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-ink-950"
          >
            Ver passeios <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        {site.services.map((s, i) => {
          const Icon = ICONS[s.icon] ?? Sparkles;
          const tone = toneOf(s.tone);
          return (
            <Reveal key={s.title} delay={(i % 3) * 0.08} className="h-full">
              <div
                className={cn(
                  "group relative isolate flex aspect-[4/5] h-full flex-col overflow-hidden p-5 grain transition duration-500 hover:-translate-y-1 sm:p-8",
                  tone.card,
                )}
              >
                <NomaSymbol
                  className={cn(
                    "absolute -bottom-[22%] -right-[22%] -z-10 aspect-square w-[85%] opacity-15 transition duration-[1.5s] group-hover:rotate-45",
                    tone.accent,
                  )}
                 
                />
                <div className={cn("flex items-center justify-between", tone.accent)}>
                  <NomaSymbol className="h-8 w-8 sm:h-10 sm:w-10" />
                  <Icon size={20} className="opacity-80" />
                </div>
                <div className="mt-auto">
                  <h3 className={cn("text-balance font-display text-2xl leading-[1.05] sm:text-4xl", tone.accent)}>{s.title}</h3>
                  <p className={cn("mt-3 hidden text-sm leading-relaxed sm:block sm:text-base", tone.text)}>{s.text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
