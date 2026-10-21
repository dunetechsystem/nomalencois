import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { getAgency, getLagoons, getPackages, getReviews, getTours } from "@/lib/dunastour/server";
import { getGallery } from "@/lib/dunastour/gallery";
import { agencyInfo } from "@/lib/agency-info";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Services } from "@/components/home/Services";
import { About } from "@/components/home/About";
import { Credentials } from "@/components/home/Credentials";
import { Lagoons } from "@/components/home/Lagoons";
import { InstagramSection } from "@/components/home/InstagramSection";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PackageCardView, TourCard } from "@/components/tour/TourCard";
import { Reveal, SectionTitle } from "@/components/ui/Reveal";
import { EmptyTours } from "@/components/tour/EmptyTours";

export const revalidate = 300;

export default async function Home() {
  const [agency, tours, packages, reviews, lagoons, gallery] = await Promise.all([
    getAgency(),
    getTours(),
    getPackages(),
    getReviews(),
    getLagoons(),
    getGallery(),
  ]);
  const info = agencyInfo(agency);
  const photos = gallery.filter((g) => !g.video).map((g) => g.url);
  const heroImages = [...new Set([agency?.coverImageUrl, ...tours.map((t) => t.coverImageUrl), ...photos])]
    .filter((u): u is string => !!u)
    .slice(0, 6);
  const videos = gallery.filter((g) => g.video).map((g) => ({ src: g.url, title: g.place }));
  const googleRatings = (agency?.checkoutPage?.googleReviews ?? []).map((r) => r.rating);
  const ratingCount = (reviews?.count ?? 0) + googleRatings.length;
  const rating = ratingCount
    ? { average: ((reviews?.average ?? 0) * (reviews?.count ?? 0) + googleRatings.reduce((a, b) => a + b, 0)) / ratingCount, count: ratingCount }
    : null;
  const faqs = agency?.checkoutPage?.faqs.length ? [...agency.checkoutPage.faqs, ...site.faqs] : site.faqs;

  return (
    <>
      <Hero
        images={heroImages}
        tourCount={tours.length + packages.length}
        phone={info.phone}
        lagoonLevel={lagoons?.level ?? null}
        rating={rating}
        cadasturUrl={info.cadasturUrl}
      />
      <Marquee items={site.destinations} />

      <section id="passeios" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Passeios NOMA"
            title={
              <>
                Escolha o seu <em className="text-teal-gradient">Maranhão real</em>
              </>
            }
            text={
              site.onlineBooking
                ? "Selecione a data e quantas pessoas vão. Dá pra juntar vários passeios numa reserva só."
                : "Escolha o passeio e chame a gente no WhatsApp pra verificar a disponibilidade da sua data."
            }
          />
          {tours.length > 3 && (
            <Reveal>
              <Link href="/passeios" className="group flex items-center gap-2 font-semibold text-ink-800">
                Ver todos <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
            </Reveal>
          )}
        </div>
        {packages.length > 0 && (
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {packages.map((p) => (
              <Reveal key={p.id}>
                <PackageCardView pkg={p} />
              </Reveal>
            ))}
          </div>
        )}
        {tours.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.slice(0, 6).map((tour, i) => (
              <Reveal key={tour.id} delay={(i % 3) * 0.1}>
                <TourCard tour={tour} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        ) : (
          packages.length === 0 && <EmptyTours phone={info.phone} />
        )}
      </section>

      <Services />
      <About description={info.description} instagram={info.instagram} />
      <Credentials cadasturUrl={info.cadasturUrl} cnpj={info.cnpj} legalName={info.legalName} rating={rating} />

      {gallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-32">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="Galeria"
              title={
                <>
                  Paisagens que <em className="text-teal-gradient">não parecem reais</em>
                </>
              }
            />
            <Reveal>
              <Link href="/galeria" className="group flex items-center gap-2 font-semibold text-ink-800">
                Ver galeria completa <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
          <GalleryGrid items={gallery} limit={12} filters={false} />
        </section>
      )}

      <InstagramSection instagram={info.instagram} photos={photos.slice(6)} videos={videos} />
      {lagoons && lagoons.monthLevels?.length === 12 && <Lagoons data={lagoons} />}
      <Reviews reviews={reviews} page={agency?.checkoutPage} />
      <Faq items={faqs} />
      <FinalCta images={photos.slice(4)} phone={info.phone} />
    </>
  );
}
