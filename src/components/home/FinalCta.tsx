import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CarFront, Wallet } from "lucide-react";
import { whatsappUrl } from "@/lib/format";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { NomaSymbol } from "@/components/ui/Logo";

const PERKS = [
  { icon: Wallet, text: "Sem pagamento agora" },
  { icon: CalendarCheck, text: "Confirmação pelo WhatsApp" },
  { icon: CarFront, text: "Busca na pousada" },
];

// Colagem à direita: fotos inclinadas, a do meio por cima.
const TILES = [
  "left-0 top-10 w-[46%] -rotate-6",
  "right-0 top-0 w-[46%] rotate-6",
  "left-1/2 top-1/3 z-10 w-[52%] -translate-x-1/2 rotate-1",
];

export function FinalCta({ images, phone }: { images: string[]; phone: string }) {
  const tiles = images.slice(0, 3);
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-clay-500 text-white grain">
        <NomaSymbol className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 text-sun-400/20" />
        <NomaSymbol className="pointer-events-none absolute -bottom-40 right-[8%] h-[28rem] w-[28rem] text-sun-400/15" />

        <div className={`relative grid items-center gap-12 px-6 py-16 sm:px-14 sm:py-20 ${tiles.length === 3 ? "lg:grid-cols-[1.1fr_1fr]" : "text-center"}`}>
          <div className={tiles.length === 3 ? "" : "mx-auto max-w-2xl"}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-sun-300">Bora viver o Maranhão real?</p>
            <h2 className="mt-4 text-balance font-display text-4xl leading-[1.05] sm:text-6xl">
              Sua próxima memória favorita está <em className="pr-1 text-sun-300">a uma conversa</em> de distância
            </h2>
            <div className={`mt-10 flex flex-col gap-3 sm:flex-row ${tiles.length === 3 ? "" : "justify-center"}`}>
              <Link
                href="/passeios"
                className="group flex items-center justify-center gap-2 rounded-full bg-sun-300 px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-ink-950 shadow-2xl shadow-clay-600/40 transition hover:bg-cream-50"
              >
                Escolher meus passeios <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a
                href={whatsappUrl(phone, "Olá, NOMA! Quero ajuda pra montar meu roteiro nos Lençóis 😊")}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-center gap-3 rounded-full bg-white/10 py-2 pl-2 pr-7 text-sm font-bold ring-1 ring-white/30 backdrop-blur transition hover:bg-[#25D366] hover:ring-[#25D366]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] transition group-hover:bg-white/20">
                  <WhatsAppIcon size={20} />
                </span>
                Tirar dúvidas
              </a>
            </div>
            <ul className={`mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85 ${tiles.length === 3 ? "" : "justify-center"}`}>
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon size={16} className="text-sun-300" /> {text}
                </li>
              ))}
            </ul>
          </div>

          {tiles.length === 3 && (
            <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
              {tiles.map((src, i) => (
                <div
                  key={src}
                  className={`absolute aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-ink-950/50 ring-4 ring-white/90 transition duration-500 hover:z-20 hover:rotate-0 hover:scale-105 ${TILES[i]}`}
                >
                  <Image src={src} alt="" fill sizes="240px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
