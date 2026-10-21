import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/format";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { NomaSymbol } from "@/components/ui/Logo";

/**
 * Agência ainda sem passeios no DunasTour (ou API fora): mostra os destinos e leva pro WhatsApp.
 * Assim que os passeios forem cadastrados, a grade de cards aparece no lugar sozinha.
 */
export function EmptyTours({ phone }: { phone: string }) {
  return (
    <div className="relative isolate mt-12 overflow-hidden rounded-[2rem] bg-teal-500 px-6 py-16 text-center grain sm:px-12">
      <NomaSymbol className="absolute -right-24 -top-24 -z-10 h-80 w-80 text-ink-800/15" />
      <NomaSymbol className="absolute -bottom-28 -left-20 -z-10 h-72 w-72 text-cream-50/15" />
      <NomaSymbol className="mx-auto h-14 w-14 text-ink-800" />
      <p className="mt-5 font-display text-3xl text-ink-900 sm:text-4xl">
        Nossos passeios estão <em className="text-cream-50">chegando</em>
      </p>
      <p className="mx-auto mt-3 max-w-lg text-ink-950/70">
        Enquanto montamos tudo por aqui, chama a gente no WhatsApp: a gente monta seu roteiro na hora, do jeito que você sonhou.
      </p>
      <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
        {site.destinations.map((d) => (
          <li key={d} className="rounded-full bg-cream-50/85 px-4 py-1.5 text-sm text-ink-900">
            {d}
          </li>
        ))}
      </ul>
      <a
        href={whatsappUrl(phone, "Olá, NOMA! Quero saber dos passeios e montar meu roteiro 😊")}
        target="_blank"
        rel="noreferrer"
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-ink-800 px-7 py-3.5 font-semibold text-cream-50 transition hover:bg-ink-950"
      >
        <WhatsAppIcon size={18} /> Montar meu roteiro
      </a>
    </div>
  );
}
