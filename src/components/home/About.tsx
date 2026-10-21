import { Heart, Leaf, Sparkles } from "lucide-react";
import { site } from "@/config/site";
import { InstagramIcon } from "@/components/ui/BrandIcons";
import { NomaLogo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";

/** "Hoje nasce a NOMA": a marca no círculo do perfil + o manifesto (ou a descrição cadastrada no DunasTour). */
export function About({ description, instagram }: { description: string | null; instagram: string }) {
  const lines = (description ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <section id="sobre" className="relative scroll-mt-20 overflow-hidden bg-cream-100 grain">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2">
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="relative flex aspect-square items-center justify-center rounded-full bg-teal-500 text-ink-800 shadow-2xl shadow-ink-900/20 ring-[10px] ring-cream-50 grain">
            <NomaLogo variant="stacked" className="w-[56%]" />
          </div>
          <a
            href={`https://instagram.com/${instagram}`}
            target="_blank"
            rel="noreferrer"
            className="absolute -left-2 top-8 flex items-center gap-2 rounded-full bg-ink-800 px-4 py-2 text-xs font-semibold text-cream-50 shadow-lg transition hover:bg-ink-950 sm:-left-6"
          >
            <InstagramIcon size={16} /> @{instagram}
          </a>
          <div className="absolute -bottom-2 -right-2 animate-float rounded-3xl bg-cream-50 px-5 py-4 shadow-xl sm:-right-6">
            <p className="font-display text-lg text-ink-900">Hoje nasce a NOMA</p>
            <p className="text-xs text-ink-900/55">Agência de turismo · Lençóis Maranhenses</p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-clay-500">Quem somos</p>
            <h2 className="mt-3 text-balance font-display text-4xl leading-[1.05] text-ink-900 sm:text-5xl">
              Mais do que vender viagens, queremos <em className="text-teal-gradient">realizar sonhos</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            {lines.length > 0 ? (
              <ul className="mt-8 space-y-2.5 text-lg text-ink-900/75">
                {lines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-8 text-lg leading-relaxed text-ink-900/75">{site.manifesto}</p>
            )}
            <p className="mt-6 font-serif text-2xl italic text-ink-800">“Gosto de lembrar que a vida pode ser mais.”</p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 grid grid-cols-3 gap-3">
            {[
              { icon: Heart, title: "Conexão", text: "Grupos cuidados de perto" },
              { icon: Leaf, title: "Natureza", text: "Lagoas, rios e céu aberto" },
              { icon: Sparkles, title: "Exclusividade", text: "Roteiros do seu jeito" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl bg-cream-50 p-4 text-center ring-1 ring-ink-900/5">
                <Icon size={22} className="mx-auto text-teal-600" />
                <p className="mt-2 font-display text-lg text-ink-900">{title}</p>
                <p className="text-xs text-ink-900/55">{text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
