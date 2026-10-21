"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, ChevronDown, Compass, Droplets, Star } from "lucide-react";
import { site } from "@/config/site";
import { whatsappUrl } from "@/lib/format";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { NomaSymbol, NomaTagline, NomaWordmark } from "@/components/ui/Logo";
import { Wave } from "@/components/ui/Wave";

/**
 * Abertura igual ao post "Hoje nasce a NOMA": a marca em creme-dourado no centro, sobre as fotos dos
 * passeios (ou o vídeo do config). Sem fotos ainda no DunasTour, fica o bloco verde-petróleo do perfil
 * com o sol-mandala girando ao fundo.
 */
export function Hero({
  images,
  tourCount,
  phone,
  lagoonLevel,
  rating,
  cadasturUrl,
}: {
  images: string[];
  tourCount: number;
  phone: string;
  lagoonLevel: number | null;
  rating: { average: number; count: number } | null;
  cadasturUrl: string | null;
}) {
  const [index, setIndex] = useState(0);
  const hasMedia = !!site.heroVideo || images.length > 0;

  useEffect(() => {
    if (images.length < 2 || site.heroVideo) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 6500);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink-800 grain">
      {site.heroVideo ? (
        <video className="absolute inset-0 h-full w-full object-cover" src={site.heroVideo} autoPlay muted loop playsInline poster={images[0]} />
      ) : (
        <AnimatePresence mode="sync">
          {images[index] && (
            <motion.div
              key={images[index]}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6 }}
            >
              <Image src={images[index]} alt="" fill priority={index === 0} sizes="100vw" className="animate-kenburns object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {hasMedia ? (
        <>
          <div className="absolute inset-0 bg-ink-950/45" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,26,31,0.35),transparent_65%)]" />
        </>
      ) : (
        <>
          <motion.div
            className="pointer-events-none absolute -right-[20vmax] -top-[12vmax] h-[70vmax] w-[70vmax] text-teal-500/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 160, repeat: Infinity, ease: "linear" }}
          >
            <NomaSymbol className="h-full w-full" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute -bottom-[18vmax] -left-[16vmax] h-[46vmax] w-[46vmax] text-sun-300/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          >
            <NomaSymbol className="h-full w-full" />
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(94,159,170,0.35),transparent_60%)]" />
        </>
      )}

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-32 pt-32 text-center sm:px-6 sm:pb-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -40 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-28 text-sun-300 sm:w-36"
        >
          <NomaSymbol className="aspect-square w-full" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24, letterSpacing: "0.3em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 w-[min(78vw,30rem)] text-sun-300"
        >
          <NomaWordmark className="w-full" />
          <span className="sr-only">NOMA — agência de turismo nos Lençóis Maranhenses</span>
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-4 w-[min(56vw,20rem)] text-sun-300/90">
          <NomaTagline className="w-full" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-10 font-serif text-3xl italic text-white sm:text-4xl"
        >
          {site.tagline}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-3 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
        >
          Lagoas, rios, farol e céu estrelado nos Lençóis Maranhenses — com calma, conexão e quem é daqui.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35 }}
          className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link
            href="/#passeios"
            className="flex items-center justify-center rounded-full bg-sun-300 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-ink-950 shadow-2xl shadow-ink-950/30 transition hover:bg-cream-50"
          >
            {site.onlineBooking ? "Ver passeios e reservar" : "Ver passeios"}
          </Link>
          <a
            href={whatsappUrl(phone, "Olá, NOMA! Quero montar meu roteiro nos Lençóis 😊")}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-center gap-3 rounded-full py-2 pl-2 pr-7 text-sm font-semibold text-white ring-1 ring-white/35 backdrop-blur-md transition hover:bg-white/10"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]">
              <WhatsAppIcon size={20} />
            </span>
            <span className="text-left leading-tight">
              Montar meu roteiro
              <span className="block text-[11px] text-white/65">Fale com a gente no WhatsApp</span>
            </span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-12 inline-flex max-w-full flex-wrap justify-center divide-white/15 overflow-hidden rounded-3xl bg-ink-950/30 text-left text-sm text-white ring-1 ring-white/15 backdrop-blur-md sm:flex-nowrap sm:divide-x"
        >
          {rating && (
            <Link href="/#avaliacoes" className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/10">
              <span className="font-display text-3xl leading-none">{rating.average.toFixed(1).replace(".", ",")}</span>
              <span className="leading-tight">
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={13} className={i < Math.round(rating.average) ? "fill-sun-400 text-sun-400" : "text-white/30"} />
                  ))}
                </span>
                <span className="text-xs text-white/70">{rating.count} avaliações</span>
              </span>
            </Link>
          )}
          {cadasturUrl ? (
            <a href={cadasturUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-5 py-3.5 transition hover:bg-white/10">
              <BadgeCheck size={22} className="text-sun-300" />
              <span className="leading-tight">
                <strong className="block">Cadastur</strong>
                <span className="text-xs text-white/70">Registro no Min. do Turismo</span>
              </span>
            </a>
          ) : (
            <span className="flex items-center gap-2.5 px-5 py-3.5">
              <BadgeCheck size={22} className="text-sun-300" />
              <span className="leading-tight">
                <strong className="block">Agência local</strong>
                <span className="text-xs text-white/70">Gente daqui, roteiro de verdade</span>
              </span>
            </span>
          )}
          {lagoonLevel != null && (
            <Link href="/#lagoas" className="flex items-center gap-2.5 px-5 py-3.5 transition hover:bg-white/10">
              <Droplets size={22} className="text-teal-200" />
              <span className="leading-tight">
                <strong className="block">{lagoonLevel}% cheias</strong>
                <span className="text-xs text-white/70">Lagoas hoje</span>
              </span>
            </Link>
          )}
          {tourCount > 0 && (
            <Link href="/#passeios" className="flex items-center gap-2.5 px-5 py-3.5 transition hover:bg-white/10">
              <Compass size={22} className="text-sun-300" />
              <span className="leading-tight">
                <strong className="block">{tourCount} passeios</strong>
                <span className="text-xs text-white/70">{site.onlineBooking ? "Reserva online" : "Reserva pelo WhatsApp"}</span>
              </span>
            </Link>
          )}
        </motion.div>
      </div>

      {images.length > 1 && !site.heroVideo && (
        <div className="absolute bottom-24 right-6 hidden gap-1.5 sm:flex">
          {images.map((s, i) => (
            <button
              key={s}
              onClick={() => setIndex(i)}
              aria-label={`Foto ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-sun-300" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      )}

      <Link href="/#passeios" aria-label="Rolar" className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 text-white/60 sm:block">
        <ChevronDown className="animate-bounce" />
      </Link>
      <Wave className="absolute -bottom-px left-0 h-[60px] w-full text-cream-50" />
    </section>
  );
}
