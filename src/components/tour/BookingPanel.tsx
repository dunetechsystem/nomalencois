"use client";

import { ShieldCheck } from "lucide-react";
import { site } from "@/config/site";
import { BookingForm, type BookingBase } from "@/components/checkout/BookingForm";
import { money, perUnit } from "@/lib/format";

/** Caixa de reserva da página do passeio: lateral fixa no computador, seção #reservar no celular + barra no rodapé. */
export function BookingPanel({ base, phone }: { base: BookingBase; phone: string }) {
  const discounted = base.unitPrice < base.fullPrice;
  if (!site.onlineBooking) return <AvailabilityPanel base={base} phone={phone} />;
  return (
    <>
      <div id="reservar" className="scroll-mt-24 rounded-[2rem] bg-cream-100/70 p-5 ring-1 ring-ink-900/5 sm:p-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            {discounted && <p className="text-sm text-ink-900/40 line-through">{money(base.fullPrice)}</p>}
            <p className="font-display text-4xl text-ink-900">{money(base.unitPrice)}</p>
            <p className="text-sm text-ink-900/50">{perUnit(base.saleUnit)}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
            <ShieldCheck size={14} /> Sem pagar agora
          </span>
        </div>
        <BookingForm base={base} />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-ink-900/10 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div>
          <p className="text-lg font-extrabold leading-tight text-ink-900">{money(base.unitPrice)}</p>
          <p className="text-xs text-ink-900/50">{perUnit(base.saleUnit)}</p>
        </div>
        <a href="#reservar" className="mr-16 rounded-full bg-gradient-to-r from-sun-500 to-sun-400 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-sun-500/30">
          Escolher data
        </a>
      </div>
    </>
  );
}

/** Com a compra pelo site desligada: escolhe data e pessoas e pergunta a disponibilidade no WhatsApp. */
function AvailabilityPanel({ base, phone }: { base: BookingBase; phone: string }) {
  const discounted = base.unitPrice < base.fullPrice;
  return (
    <>
      <div id="reservar" className="scroll-mt-24 rounded-[2rem] bg-cream-100/70 p-5 ring-1 ring-ink-900/5 sm:p-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            {discounted && <p className="text-sm text-ink-900/40 line-through">{money(base.fullPrice)}</p>}
            <p className="font-display text-4xl text-ink-900">{money(base.unitPrice)}</p>
            <p className="text-sm text-ink-900/50">{perUnit(base.saleUnit)}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
            <ShieldCheck size={14} /> Sem pagar agora
          </span>
        </div>
        <BookingForm base={base} mode="ask" phone={phone} />
        <p className="mt-3 text-center text-xs text-ink-900/50">A conversa abre no WhatsApp com tudo preenchido. O guia confirma a vaga por lá.</p>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-ink-900/10 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div>
          <p className="text-lg font-extrabold leading-tight text-ink-900">{money(base.unitPrice)}</p>
          <p className="text-xs text-ink-900/50">{perUnit(base.saleUnit)}</p>
        </div>
        <a href="#reservar" className="mr-16 rounded-full bg-gradient-to-r from-sun-500 to-sun-400 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-sun-500/30">
          Escolher data
        </a>
      </div>
    </>
  );
}
