import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Footprints, ShieldAlert, Star } from "lucide-react";
import { site } from "@/config/site";
import type { PackageCard, TourCard as TourCardType } from "@/lib/dunastour/types";
import { displayTitle, duration, money, perUnit, tourUnitPrice } from "@/lib/format";

export function TourCard({ tour, priority = false }: { tour: TourCardType; priority?: boolean }) {
  const price = tourUnitPrice(tour);
  const discounted = price < tour.basePrice;
  return (
    <Link
      href={`/passeios/${tour.id}`}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-25px_rgba(4,20,42,0.35)] ring-1 ring-ink-900/5 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-25px_rgba(4,20,42,0.5)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
        {tour.coverImageUrl && (
          <Image
            src={tour.coverImageUrl}
            alt={displayTitle(tour.title)}
            fill
            priority={priority}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {tour.durationMinutes > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink-900 backdrop-blur">
              <Clock size={11} /> {duration(tour.durationMinutes)}
            </span>
          )}
          {discounted && (
            <span className="rounded-full bg-clay-500 px-2.5 py-1 text-[11px] font-extrabold text-white">-{tour.discountPercent}%</span>
          )}
          {tour.riskType && (
            <span className="flex items-center gap-1 rounded-full bg-sun-500 px-2.5 py-1 text-[11px] font-bold text-white">
              <ShieldAlert size={11} /> Aventura
            </span>
          )}
          {tour.trekLevel && (
            <span className="flex items-center gap-1 rounded-full bg-teal-500 px-2.5 py-1 text-[11px] font-bold text-white">
              <Footprints size={11} /> Trekking
            </span>
          )}
        </div>
        <span className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-ink-900 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          {tour.tags.length > 0 && (
            <p className="mb-1.5 line-clamp-1 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-200">
              {tour.tags.slice(0, 3).join(" · ")}
            </p>
          )}
          <h3 className="font-display text-2xl leading-tight text-white">{displayTitle(tour.title)}</h3>
          {tour.ratingCount > 0 && (
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/80">
              <Star size={12} className="fill-sun-400 text-sun-400" /> {tour.ratingAvg.toFixed(1)} ({tour.ratingCount})
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          {discounted && <p className="text-xs text-ink-900/40 line-through">{money(tour.basePrice)}</p>}
          <p className="text-xl font-extrabold text-ink-900">
            {money(price)} <span className="text-xs font-semibold text-ink-900/50">{perUnit(tour.saleUnit)}</span>
          </p>
        </div>
        <span className="rounded-full bg-ink-900 px-4 py-2 text-xs font-bold text-white transition group-hover:bg-sun-500">{site.onlineBooking ? "Reservar" : "Ver passeio"}</span>
      </div>
    </Link>
  );
}

export function PackageCardView({ pkg }: { pkg: PackageCard }) {
  return (
    <Link
      href={`/pacotes/${pkg.id}`}
      className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-[2rem] bg-ink-900 p-6 text-white shadow-xl"
    >
      {pkg.coverImageUrl && (
        <Image src={pkg.coverImageUrl} alt="" fill sizes="(max-width: 768px) 90vw, 600px" className="object-cover opacity-70 transition duration-700 group-hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      <span className="absolute left-5 top-5 rounded-full bg-sun-500 px-3 py-1 text-xs font-extrabold">Combo -{pkg.discountPercent}%</span>
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">{pkg.toursCount} passeios</p>
        <h3 className="mt-1 font-display text-3xl">{displayTitle(pkg.title)}</h3>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="text-sm text-white/50 line-through">{money(pkg.originalPrice)}</span>
          <span className="text-2xl font-extrabold">{money(pkg.finalPrice)}</span>
          <span className="text-xs text-white/60">por pessoa</span>
        </p>
      </div>
    </Link>
  );
}
