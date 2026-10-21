import Link from "next/link";
import { BadgeCheck, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";
import type { AgencyInfo } from "@/lib/agency-info";
import { whatsappUrl } from "@/lib/format";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { NomaLogo, NomaSymbol } from "@/components/ui/Logo";
import { Wave } from "@/components/ui/Wave";

export function Footer({ info }: { info: AgencyInfo }) {
  return (
    <footer className="relative mt-24 bg-ink-800 text-white/80 grain">
      <Wave className="absolute -top-[59px] left-0 h-[60px] w-full text-ink-800" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <NomaSymbol className="absolute -bottom-40 -right-32 h-[34rem] w-[34rem] text-teal-500/15" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-10 pt-16 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <NomaLogo variant="stacked" className="w-44 text-sun-300" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Bem-vindo ao Maranhão real. Lagoas, rios, farol e céu estrelado nos Lençóis Maranhenses — com calma, conexão e quem é daqui.
          </p>
          <div className="mt-6 flex gap-3">
            <a href={`https://instagram.com/${info.instagram}`} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-sun-500">
              <InstagramIcon />
            </a>
            {site.tiktok && (
              <a href={`https://www.tiktok.com/@${site.tiktok}`} target="_blank" rel="noreferrer" aria-label="TikTok" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-sun-500">
                <TikTokIcon />
              </a>
            )}
            <a href={whatsappUrl(info.phone)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-sun-500">
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        <div>
          <p className="font-display text-xl text-sun-300">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/passeios" className="hover:text-sun-300">Todos os passeios</Link></li>
            <li><Link href="/galeria" className="hover:text-sun-300">Galeria de fotos e vídeos</Link></li>
            <li><Link href="/#lagoas" className="hover:text-sun-300">Como estão as lagoas</Link></li>
            {site.onlineBooking && <li><Link href="/reservar" className="hover:text-sun-300">Meu roteiro</Link></li>}
            <li><Link href="/termos" className="hover:text-sun-300">Termos e privacidade</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-xl text-sun-300">Contato</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-sun-300" />
              <a href={whatsappUrl(info.phone)} target="_blank" rel="noreferrer" className="hover:text-sun-300">{info.phone}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <InstagramIcon size={16} className="mt-0.5 shrink-0 text-sun-300" />
              <a href={`https://instagram.com/${info.instagram}`} target="_blank" rel="noreferrer" className="hover:text-sun-300">@{info.instagram}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-sun-300" />
              <span>{info.city} · Maranhão · Brasil</span>
            </li>
            {info.cadasturUrl && (
              <li className="flex items-start gap-2.5">
                <BadgeCheck size={16} className="mt-0.5 shrink-0 text-sun-300" />
                <a href={info.cadasturUrl} target="_blank" rel="noreferrer" className="hover:text-sun-300">Agência cadastrada no Cadastur</a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {info.legalName ?? site.name}
            {info.cnpj ? ` · CNPJ ${info.cnpj}` : ""}
          </p>
          <p>
            {site.onlineBooking && "Reservas processadas com segurança pela plataforma DunasTour · "}
            Site feito por{" "}
            <a href="https://dunastour.com.br" target="_blank" rel="noreferrer" className="font-semibold text-sun-300 hover:text-cream-50">
              DunasTour
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
