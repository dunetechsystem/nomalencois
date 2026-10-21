"use client";

import { Check, PenLine, ShieldAlert } from "lucide-react";
import type { RiskTerm } from "@/lib/dunastour/types";
import { displayTitle, normalizeName } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Termo de Responsabilidade e Ciência de Riscos — texto montado pelo servidor do DunasTour. Todas as
 * declarações precisam do "sim" e a assinatura tem que ser o nome da reserva (mesma regra do backend).
 */
export function RiskTermStep({
  term,
  answers,
  signature,
  clientName,
  onAnswer,
  onSign,
}: {
  term: RiskTerm;
  answers: Record<string, boolean>;
  signature: string;
  clientName: string;
  onAnswer: (id: string, value: boolean) => void;
  onSign: (value: string) => void;
}) {
  const signatureOk = signature.trim().length > 0 && normalizeName(signature) === normalizeName(clientName);
  const total = term.sections.reduce((s, x) => s + x.declarations.length, 0) + 1;
  const done = term.sections.reduce((s, x) => s + x.declarations.filter((d) => answers[d.id]).length, 0) + (signatureOk ? 1 : 0);

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun-400/15 text-sun-600">
          <ShieldAlert />
        </span>
        <div>
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{term.title}</h1>
          <p className="mt-1 text-sm text-ink-900/60">
            {term.activities.join(", ")} · {term.tourTitles.map(displayTitle).join(", ")}
          </p>
        </div>
      </div>

      <div className="sticky top-20 z-10 mt-6 rounded-full bg-white/90 p-1 shadow-sm ring-1 ring-ink-900/5 backdrop-blur">
        <div className="h-2 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      <div className="mt-6 space-y-5">
        {term.sections.map((section) => (
          <section key={section.id} className="rounded-[2rem] bg-white p-6 ring-1 ring-ink-900/5">
            <h2 className="font-display text-xl text-ink-900">{section.title}</h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-ink-900/70">
                {p}
              </p>
            ))}
            {section.items.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-900/70">
                {section.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            )}
            {section.declarations.length > 0 && (
              <div className="mt-4 space-y-2">
                {section.declarations.map((d) => {
                  const yes = answers[d.id] === true;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onAnswer(d.id, !yes)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-sm transition",
                        yes ? "border-teal-500 bg-teal-50 text-ink-900" : "border-ink-900/10 text-ink-900/80 hover:border-ink-900/30"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition",
                          yes ? "border-teal-500 bg-teal-500 text-white" : "border-ink-900/25"
                        )}
                      >
                        {yes && <Check size={13} strokeWidth={3} />}
                      </span>
                      {d.text}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ))}

        <section className="rounded-[2rem] bg-ink-900 p-6 text-white">
          <p className="flex items-center gap-2 font-display text-xl">
            <PenLine size={20} className="text-sun-400" /> Assinatura
          </p>
          <p className="mt-1 text-sm text-white/60">Digite seu nome completo, igual ao da reserva: <strong className="text-white">{clientName}</strong></p>
          <input
            value={signature}
            onChange={(e) => onSign(e.target.value)}
            placeholder="Seu nome completo"
            className="mt-4 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 font-display text-2xl italic text-white outline-none placeholder:text-white/30 focus:border-sun-400"
          />
          <p className={cn("mt-2 text-xs font-semibold", signatureOk ? "text-teal-300" : signature.trim() ? "text-clay-500" : "text-white/40")}>
            {signatureOk ? "✓ Assinatura confere" : signature.trim() ? "O nome não confere com o da reserva" : "Obrigatório"}
          </p>
        </section>
      </div>
    </div>
  );
}
