"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, TriangleAlert } from "lucide-react";
import { useDayRules } from "@/lib/availability";
import { itemKey, useCart, type CartItem } from "@/lib/cart";
import { isFullDayTour, longDate, money, todayISO, unitCount, unitLabel, whatsappUrl } from "@/lib/format";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Calendar } from "./Calendar";
import { NumberStepper } from "@/components/ui/Stepper";
import { cn } from "@/lib/cn";

export type BookingBase = Omit<CartItem, "date" | "seats" | "infants">;

/**
 * Data + quantidade de um passeio/pacote. Na página do passeio adiciona ao roteiro; no carrinho
 * (mode "edit") altera o item já escolhido; com a compra pelo site desligada (mode "ask") manda a
 * escolha pro WhatsApp da agência pra ela confirmar a vaga.
 */
export function BookingForm({
  base,
  mode = "add",
  onDone,
  compact = false,
  phone = "",
}: {
  base: BookingBase;
  mode?: "add" | "edit" | "ask";
  onDone?: () => void;
  compact?: boolean;
  /** WhatsApp da agência — usado no mode "ask". */
  phone?: string;
}) {
  const router = useRouter();
  const { items, upsert, remove, setOpen } = useCart();
  const current = items.find((i) => itemKey(i) === itemKey(base));
  const [date, setDate] = useState(current?.date ?? "");
  const [seats, setSeats] = useState(current?.seats ?? 1);
  const [infants, setInfants] = useState(current?.infants ?? 0);
  const rules = useDayRules({ kind: base.kind, id: base.id, trek: base.trek });
  const today = todayISO();

  const error = rules.dateError(date, seats);
  const fullDayClash =
    date &&
    mode !== "ask" &&
    base.kind === "tour" &&
    isFullDayTour(base) &&
    items.some((i) => itemKey(i) !== itemKey(base) && i.kind === "tour" && i.date === date && isFullDayTour(i));
  const canSave = !!date && !error && seats > 0;
  const total = base.unitPrice * seats;
  const vehicle = base.saleUnit && base.saleUnit !== "PESSOA";

  function save(goToCheckout: boolean) {
    if (!canSave) return;
    upsert({ ...base, date, seats, infants: base.allowInfants ? infants : 0 });
    onDone?.();
    if (goToCheckout) router.push("/reservar");
    else if (mode === "add") setOpen(true);
  }

  const askMessage = [
    `Olá! Quero verificar a disponibilidade do passeio *${base.title}*.`,
    "",
    `*Data:* ${date ? longDate(date) : ""}`,
    `*${vehicle ? "Quantidade" : "Pessoas"}:* ${vehicle ? unitCount(base.saleUnit, seats) : seats}`,
    ...(base.allowInfants && infants > 0 ? [`*Crianças de colo:* ${infants}`] : []),
    `*Total:* ${money(total)}`,
  ].join("\n");

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("rounded-3xl border border-ink-900/10 bg-white p-4", compact && "p-3")}>
        {rules.loading ? (
          <div className="flex h-72 items-center justify-center text-ink-900/40">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <Calendar
            key={rules.firstOpenDate ?? "cal"}
            value={date}
            onChange={setDate}
            minDate={today}
            dayInfo={rules.dayInfo}
            initialMonth={rules.firstOpenDate}
          />
        )}
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl px-4 py-3 text-sm",
          error ? "bg-clay-500/10 text-clay-500" : date ? "bg-teal-50 text-teal-700" : "bg-cream-100 text-ink-900/60"
        )}
      >
        <CalendarDays size={16} className="shrink-0" />
        <span className="font-semibold">{error ?? (date ? longDate(date) : "Escolha a data no calendário")}</span>
      </div>

      {fullDayClash && (
        <div className="flex gap-2 rounded-2xl border border-sun-400/40 bg-sun-400/10 p-3 text-xs text-sun-600">
          <TriangleAlert size={15} className="mt-0.5 shrink-0" />
          <p>Você já tem um passeio de dia inteiro nessa data. Os dois provavelmente não cabem no mesmo dia.</p>
        </div>
      )}

      <div className="divide-y divide-ink-900/10 rounded-3xl border border-ink-900/10 bg-white px-4">
        <NumberStepper
          label={vehicle ? `${unitLabel(base.saleUnit, 2)[0].toUpperCase()}${unitLabel(base.saleUnit, 2).slice(1)}` : "Pessoas"}
          hint={
            vehicle
              ? base.vehicleMaxOccupancy
                ? `Até ${base.vehicleMaxOccupancy} pessoas por ${unitLabel(base.saleUnit, 1)}`
                : `Preço por ${unitLabel(base.saleUnit, 1)}`
              : "A partir de 2 anos"
          }
          value={seats}
          onChange={setSeats}
          min={1}
          max={30}
        />
        {base.allowInfants && (
          <NumberStepper label="Crianças de colo" hint="Menores de 2 anos · não pagam" value={infants} onChange={setInfants} max={6} />
        )}
      </div>

      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-900/50">Total</p>
          <p className="text-sm text-ink-900/60">
            {unitCount(base.saleUnit, seats)} × {money(base.unitPrice)}
          </p>
        </div>
        <p className="font-display text-3xl text-ink-900">{money(total)}</p>
      </div>

      {mode === "ask" ? (
        <a
          href={canSave ? whatsappUrl(phone, askMessage) : undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!canSave}
          className={cn(
            "flex items-center justify-center gap-3 rounded-full bg-[#25D366] py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-xl shadow-[#25D366]/30 transition hover:bg-[#1ebe5b]",
            !canSave && "pointer-events-none opacity-40 shadow-none"
          )}
        >
          <WhatsAppIcon size={22} /> Verificar disponibilidade
        </a>
      ) : mode === "add" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!canSave}
            onClick={() => save(true)}
            className="order-first rounded-full bg-gradient-to-r from-sun-500 to-sun-400 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-sun-500/30 transition hover:brightness-105 disabled:opacity-40 disabled:shadow-none sm:order-last"
          >
            Reservar agora
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => save(false)}
            className="rounded-full border-2 border-ink-900 py-3 text-sm font-extrabold text-ink-900 transition hover:bg-ink-900 hover:text-white disabled:opacity-30"
          >
            {current ? "Atualizar roteiro" : "+ Adicionar ao roteiro"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              remove(itemKey(base));
              onDone?.();
            }}
            className="rounded-full border border-clay-500/40 py-3 text-sm font-bold text-clay-500 transition hover:bg-clay-500/10"
          >
            Remover
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => save(false)}
            className="rounded-full bg-ink-900 py-3 text-sm font-extrabold text-white transition hover:bg-ink-800 disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}
