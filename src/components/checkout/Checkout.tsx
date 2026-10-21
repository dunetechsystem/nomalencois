"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Compass, Loader2, Plus, ShieldCheck, TriangleAlert } from "lucide-react";
import { itemKey, itemTotal, useCart, useHydrated, type CartItem } from "@/lib/cart";
import { useDayRules } from "@/lib/availability";
import { fetchRiskTerm, lookupReturningCustomer, submitCheckout } from "@/lib/dunastour/client";
import type { CheckoutSubmissionResponse, RiskTerm, TourCard } from "@/lib/dunastour/types";
import { displayTitle, formatCpf, isFullDayTour, isValidCpf, longDate, money, normalizeName, shortDate, unitCount } from "@/lib/format";
import { buildPhone, formatNational, isCompletePhone, PHONE_COUNTRIES } from "@/lib/phone";
import { clearProfile, loadProfile, saveProfile } from "@/lib/checkout-profile";
import { Sheet } from "@/components/ui/Sheet";
import { CartLine } from "./CartLine";
import { BookingForm } from "./BookingForm";
import { RiskTermStep } from "./RiskTermStep";
import { DoneStep } from "./DoneStep";
import { TourCard as TourCardView } from "@/components/tour/TourCard";
import { cn } from "@/lib/cn";

type StepId = "tours" | "details" | "risk" | "confirm";
const STEP_LABELS: Record<StepId, string> = { tours: "Seu roteiro", details: "Seus dados", risk: "Termo de risco", confirm: "Confirmar" };

/** Revalida data/vagas de um item do roteiro e avisa o pai (o "Continuar" trava com erro). */
function ValidatedLine({ item, onEdit, onError }: { item: CartItem; onEdit: () => void; onError: (key: string, error?: string) => void }) {
  const rules = useDayRules({ kind: item.kind, id: item.id, trek: item.trek });
  const error = !item.date ? "Escolha a data" : rules.loading ? undefined : rules.dateError(item.date, item.seats);
  const key = itemKey(item);
  useEffect(() => {
    onError(key, error);
    return () => onError(key, undefined);
  }, [key, error, onError]);
  return <CartLine item={item} onEdit={onEdit} error={error} />;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink-900">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-clay-500">{error}</span> : hint && <span className="mt-1 block text-xs text-ink-900/50">{hint}</span>}
    </label>
  );
}

const INPUT =
  "w-full rounded-2xl border border-ink-900/15 bg-white px-4 py-3.5 text-ink-900 outline-none transition placeholder:text-ink-900/30 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15";

export function Checkout({ phone: agencyPhone, agencyName, suggestions }: { phone: string; agencyName: string; suggestions: TourCard[] }) {
  const hydrated = useHydrated();
  const allItems = useCart((s) => s.items);
  const items = useMemo(() => (hydrated ? allItems : []), [hydrated, allItems]);
  const clear = useCart((s) => s.clear);

  const [step, setStep] = useState<StepId>("tours");
  const [editing, setEditing] = useState<CartItem | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const onItemError = useCallback((key: string, error?: string) => {
    setErrors((prev) => {
      if (prev[key] === error) return prev;
      const next = { ...prev };
      if (error) next[key] = error;
      else delete next[key];
      return next;
    });
  }, []);

  // --- dados do cliente ---
  // Dados lembrados neste aparelho. No servidor vem null; a tela só aparece depois de hidratar (spinner antes).
  const [saved] = useState(() => (typeof window === "undefined" ? null : loadProfile()));
  const [name, setName] = useState(saved?.name ?? "");
  const [email, setEmail] = useState(saved?.email ?? "");
  const [countryIso, setCountryIso] = useState(saved?.phoneIso || "BR");
  const [phone, setPhone] = useState(saved?.phone ?? "");
  const [cpf, setCpf] = useState(saved?.cpf ?? "");
  const [address, setAddress] = useState(saved?.address ?? "");
  const [notes, setNotes] = useState("");
  const [remember, setRemember] = useState(true);
  const [remembered, setRemembered] = useState(!!saved);
  const [returningName, setReturningName] = useState<string | null>(null);
  const country = PHONE_COUNTRIES.find((c) => c.iso === countryIso) ?? PHONE_COUNTRIES[0];

  function forgetMe() {
    clearProfile();
    setRemembered(false);
    setReturningName(null);
    setName("");
    setEmail("");
    setPhone("");
    setCpf("");
    setAddress("");
  }

  // "Já reservou antes": telefone + CPF batendo com reserva anterior nessa agência preenchem o que falta.
  const lastLookup = useRef("");
  useEffect(() => {
    if (!isCompletePhone(country, phone) || !isValidCpf(cpf)) return;
    const full = buildPhone(country, phone);
    const key = `${full}|${cpf}`;
    if (key === lastLookup.current) return;
    lastLookup.current = key;
    lookupReturningCustomer(full, cpf)
      .then((data) => {
        if (!data) return;
        setReturningName(data.name.split(" ")[0]);
        setName((v) => v || data.name);
        setEmail((v) => v || data.email || "");
        setAddress((v) => v || data.pickupAddress || "");
      })
      .catch(() => {});
  }, [country, phone, cpf]);

  // --- termo de risco: montado no servidor pra seleção atual (204 = nenhum risco) ---
  const tourIds = items.filter((i) => i.kind === "tour").map((i) => i.id).sort().join(",");
  const packageIds = items.filter((i) => i.kind === "package").map((i) => i.id).sort().join(",");
  const selectionKey = `${tourIds}|${packageIds}`;
  const [riskState, setRiskState] = useState<{ key: string; term: RiskTerm | null } | null>(null);
  const hasSelection = !!(tourIds || packageIds);
  const riskLoading = hasSelection && riskState?.key !== selectionKey;
  const riskTerm = hasSelection && !riskLoading ? riskState!.term : null;
  useEffect(() => {
    if (!tourIds && !packageIds) return;
    let alive = true;
    fetchRiskTerm(tourIds ? tourIds.split(",") : [], packageIds ? packageIds.split(",") : [])
      .catch(() => null)
      .then((term) => alive && setRiskState({ key: `${tourIds}|${packageIds}`, term }));
    return () => {
      alive = false;
    };
  }, [tourIds, packageIds]);
  const needsRisk = !!riskTerm;
  const riskKey = riskTerm ? `${riskTerm.version}|${riskTerm.activities.join()}|${riskTerm.tourTitles.join()}` : "";
  const [risk, setRisk] = useState<{ key: string; answers: Record<string, boolean>; signature: string }>({ key: "", answers: {}, signature: "" });
  const answers = risk.key === riskKey ? risk.answers : {};
  const signature = risk.key === riskKey ? risk.signature : "";
  const riskDone =
    !!riskTerm &&
    riskTerm.sections.every((s) => s.declarations.every((d) => answers[d.id] === true)) &&
    signature.trim().length > 0 &&
    normalizeName(signature) === normalizeName(name);

  // --- envio ---
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ items: CheckoutSubmissionResponse[]; infants: number; risk: boolean; name: string } | null>(null);

  const flow: StepId[] = ["tours", "details", ...(needsRisk ? (["risk"] as StepId[]) : []), "confirm"];
  const stepIndex = flow.indexOf(step);
  const total = items.reduce((s, i) => s + itemTotal(i), 0);
  const savings = items.reduce((s, i) => s + (i.fullPrice - i.unitPrice) * i.seats, 0);
  const hasErrors = Object.keys(errors).length > 0;
  const fullDayClash = Object.entries(
    items.filter((i) => i.kind === "tour" && i.date && isFullDayTour(i)).reduce<Record<string, string[]>>((acc, i) => ({ ...acc, [i.date]: [...(acc[i.date] ?? []), i.title] }), {})
  ).filter(([, titles]) => titles.length > 1);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const cpfOk = needsRisk ? isValidCpf(cpf) : cpf === "" || isValidCpf(cpf);
  const detailsOk = name.trim().split(/\s+/).length >= 2 && emailOk && isCompletePhone(country, phone) && cpfOk && !!address.trim();
  const [touched, setTouched] = useState(false);

  // Se o roteiro mudar e o termo deixar de existir, sai da etapa de risco.
  if (step === "risk" && !needsRisk && !riskLoading) setStep("confirm");

  function go(offset: 1 | -1) {
    if (offset === 1 && step === "details" && !detailsOk) {
      setTouched(true);
      return;
    }
    setStep(flow[stepIndex + offset] ?? step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fullPhone = buildPhone(country, phone);
      const data = await submitCheckout({
        items: items.map((i) => ({
          ...(i.kind === "tour" ? { tourId: i.id } : { packageId: i.id }),
          scheduledDate: i.date,
          seats: i.seats,
          infants: i.infants || undefined,
        })),
        pickupAddress: address.trim() || undefined,
        clientName: name.trim(),
        clientEmail: email.trim(),
        clientPhone: fullPhone,
        clientCpf: cpf || undefined,
        notes: notes.trim() || undefined,
        // Chegou aqui = passou pelo aviso "Ao continuar, você concorda…" da etapa "Seus dados".
        termsAccepted: true,
        privacyAccepted: true,
        riskTerms: riskTerm
          ? {
              version: riskTerm.version,
              acceptedDeclarationIds: Object.entries(answers)
                .filter(([, yes]) => yes)
                .map(([id]) => id),
              signatureName: signature.trim(),
            }
          : undefined,
      });
      if (remember) saveProfile({ name, email, phoneIso: countryIso, phone, cpf, address });
      else clearProfile();
      setResult({ items: data ?? [], infants: Math.max(0, ...items.map((i) => i.infants)), risk: needsRisk, name: name.trim() });
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Não foi possível enviar a reserva.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) return <DoneStep result={result} agencyName={agencyName} agencyPhone={agencyPhone} />;

  if (!hydrated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center pt-24 text-ink-900/40">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-32 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-500">
            <Compass size={36} />
          </span>
          <h1 className="mt-6 font-display text-4xl text-ink-900">Seu roteiro está vazio</h1>
          <p className="mt-2 text-ink-900/60">Escolha um passeio pra começar sua reserva.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.slice(0, 6).map((t) => (
            <TourCardView key={t.id} tour={t} />
          ))}
        </div>
      </div>
    );
  }

  const notInCart = suggestions.filter((t) => !items.some((i) => i.kind === "tour" && i.id === t.id));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-28 sm:px-6">
      {/* etapas */}
      <div className="mb-10 flex items-center gap-2">
        {flow.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition",
                stepIndex > i ? "bg-teal-500 text-white" : stepIndex === i ? "bg-ink-900 text-white ring-4 ring-ink-900/10" : "bg-ink-900/5 text-ink-900/40"
              )}
            >
              {stepIndex > i ? <Check size={16} /> : i + 1}
            </span>
            <span className={cn("hidden text-sm font-bold md:block", stepIndex === i ? "text-ink-900" : "text-ink-900/40")}>{STEP_LABELS[s]}</span>
            {i < flow.length - 1 && <div className={cn("h-0.5 flex-1 rounded-full", stepIndex > i ? "bg-teal-500" : "bg-ink-900/10")} />}
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              {step === "tours" && (
                <div>
                  <h1 className="font-display text-4xl text-ink-900">Seu roteiro</h1>
                  <p className="mt-1 text-ink-900/60">Confira datas e quantidades. Cada passeio pode ser num dia diferente.</p>
                  <div className="mt-6 space-y-3">
                    {items.map((item) => (
                      <ValidatedLine key={itemKey(item)} item={item} onEdit={() => setEditing(item)} onError={onItemError} />
                    ))}
                  </div>
                  {fullDayClash.map(([date, titles]) => (
                    <div key={date} className="mt-4 flex gap-2 rounded-2xl border border-sun-400/40 bg-sun-400/10 p-4 text-sm text-sun-600">
                      <TriangleAlert size={18} className="shrink-0" />
                      <p>
                        <strong>Atenção:</strong> {titles.map((t) => `"${t}"`).join(" e ")} são de dia inteiro e estão no mesmo dia ({longDate(date)}).
                      </p>
                    </div>
                  ))}
                  {notInCart.length > 0 && (
                    <div className="mt-10">
                      <p className="mb-4 font-display text-2xl text-ink-900">Aproveite e adicione</p>
                      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
                        {notInCart.map((t) => (
                          <Link
                            key={t.id}
                            href={`/passeios/${t.id}`}
                            className="flex w-60 shrink-0 items-center gap-3 rounded-3xl bg-white p-2.5 ring-1 ring-ink-900/5 transition hover:ring-ink-900/20"
                          >
                            <span
                              className="h-14 w-14 shrink-0 rounded-2xl bg-cream-100 bg-cover bg-center"
                              style={t.coverImageUrl ? { backgroundImage: `url(${t.coverImageUrl})` } : undefined}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2 text-sm font-bold leading-tight text-ink-900">{displayTitle(t.title)}</span>
                              <span className="text-xs text-ink-900/50">{money(t.basePrice)}</span>
                            </span>
                            <Plus size={18} className="shrink-0 text-teal-600" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === "details" && (
                <div>
                  <h1 className="font-display text-4xl text-ink-900">{returningName ? `Que bom te ver de novo, ${returningName}!` : "Seus dados"}</h1>
                  <p className="mt-1 text-ink-900/60">Pra agência confirmar sua reserva e te buscar no hotel.</p>
                  {remembered && (
                    <p className="mt-3 text-sm text-ink-900/60">
                      Preenchemos com os dados salvos neste aparelho.{" "}
                      <button onClick={forgetMe} className="font-bold text-teal-700 underline">
                        Não é você?
                      </button>
                    </p>
                  )}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Nome completo" error={touched && name.trim().split(/\s+/).length < 2 ? "Informe nome e sobrenome" : undefined}>
                        <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Como no documento" />
                      </Field>
                    </div>
                    <Field label="WhatsApp" error={touched && !isCompletePhone(country, phone) ? "Número incompleto" : undefined}>
                      <div className="flex gap-2">
                        <select
                          className={cn(INPUT, "w-[92px] shrink-0 px-2")}
                          value={countryIso}
                          onChange={(e) => setCountryIso(e.target.value)}
                          aria-label="País"
                        >
                          {PHONE_COUNTRIES.map((c) => (
                            <option key={c.iso} value={c.iso}>
                              {c.flag} +{c.dial}
                            </option>
                          ))}
                        </select>
                        <input
                          className={INPUT}
                          value={formatNational(country, phone)}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, country.maxDigits))}
                          inputMode="tel"
                          autoComplete="tel-national"
                          placeholder={country.iso === "BR" ? "(98) 99999-9999" : "Número"}
                        />
                      </div>
                    </Field>
                    <Field label="E-mail" error={touched && !emailOk ? "E-mail inválido" : undefined} hint="Você recebe o voucher por aqui">
                      <input className={INPUT} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="voce@email.com" />
                    </Field>
                    <Field
                      label={needsRisk ? "CPF (obrigatório)" : "CPF (opcional)"}
                      error={(touched || cpf.replace(/\D/g, "").length === 11) && !cpfOk ? (cpf ? "CPF inválido" : "Obrigatório para atividade de aventura") : undefined}
                      hint={needsRisk ? "Identifica quem assina o termo de risco" : "Agiliza suas próximas reservas"}
                    >
                      <input className={INPUT} value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" />
                    </Field>
                    <Field label="Onde vamos te buscar?" error={touched && !address.trim() ? "Informe o hotel/pousada" : undefined} hint="Hotel, pousada ou endereço em Barreirinhas">
                      <input className={INPUT} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" placeholder="Ex.: Pousada Sol, Rua X, 123" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Observações (opcional)">
                        <textarea
                          className={cn(INPUT, "min-h-24 resize-y")}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Ex.: horário do voo, alguém com mobilidade reduzida, aniversário…"
                        />
                      </Field>
                    </div>
                  </div>
                  <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-ink-900/70">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-5 w-5 accent-teal-600" />
                    Lembrar meus dados neste aparelho
                  </label>
                  <p className="mt-5 text-xs leading-relaxed text-ink-900/50">
                    Ao continuar, você concorda com os{" "}
                    <Link href="/termos" target="_blank" className="font-bold underline">
                      Termos de uso
                    </Link>{" "}
                    e a{" "}
                    <Link href="/termos#privacidade" target="_blank" className="font-bold underline">
                      Política de privacidade
                    </Link>
                    .
                  </p>
                </div>
              )}

              {step === "risk" && riskTerm && (
                <RiskTermStep
                  term={riskTerm}
                  answers={answers}
                  signature={signature}
                  clientName={name}
                  onAnswer={(id, value) =>
                    setRisk((prev) => ({
                      key: riskKey,
                      answers: { ...(prev.key === riskKey ? prev.answers : {}), [id]: value },
                      signature: prev.key === riskKey ? prev.signature : "",
                    }))
                  }
                  onSign={(value) => setRisk((prev) => ({ key: riskKey, answers: prev.key === riskKey ? prev.answers : {}, signature: value }))}
                />
              )}

              {step === "confirm" && (
                <div>
                  <h1 className="font-display text-4xl text-ink-900">Confira e envie</h1>
                  <p className="mt-1 text-ink-900/60">Nenhum pagamento é feito agora. A agência confirma a disponibilidade e combina o pagamento com você.</p>
                  <div className="mt-6 divide-y divide-ink-900/10 rounded-[2rem] bg-white p-6 ring-1 ring-ink-900/5">
                    {items.map((i) => (
                      <div key={itemKey(i)} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                        <div>
                          <p className="font-bold text-ink-900">{i.title}</p>
                          <p className="text-sm capitalize text-ink-900/60">
                            {longDate(i.date)} · {unitCount(i.saleUnit, i.seats)}
                            {i.infants > 0 && ` + ${i.infants} de colo`}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold text-ink-900">{money(itemTotal(i))}</p>
                      </div>
                    ))}
                    <div className="grid gap-1 py-4 text-sm text-ink-900/70 sm:grid-cols-2">
                      <p><strong className="text-ink-900">Nome:</strong> {name}</p>
                      <p><strong className="text-ink-900">WhatsApp:</strong> {buildPhone(country, phone)}</p>
                      <p><strong className="text-ink-900">E-mail:</strong> {email}</p>
                      <p><strong className="text-ink-900">Embarque:</strong> {address}</p>
                    </div>
                    {needsRisk && (
                      <p className="flex items-center gap-2 pt-4 text-sm font-semibold text-teal-700">
                        <ShieldCheck size={16} /> Termo de risco assinado por {signature}
                      </p>
                    )}
                  </div>
                  {submitError && (
                    <div className="mt-4 flex gap-2 rounded-2xl bg-clay-500/10 p-4 text-sm font-semibold text-clay-500">
                      <TriangleAlert size={18} className="shrink-0" /> {submitError}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* navegação */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-900/10 bg-white/90 p-4 backdrop-blur-xl lg:static lg:mt-10 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <div className="flex-1 lg:hidden">
                <p className="text-xs text-ink-900/50">Total</p>
                <p className="text-lg font-extrabold text-ink-900">{money(total)}</p>
              </div>
              {stepIndex > 0 && (
                <button
                  onClick={() => go(-1)}
                  className="flex items-center gap-1 rounded-full border border-ink-900/15 px-5 py-3.5 text-sm font-bold text-ink-900 transition hover:border-ink-900"
                >
                  <ArrowLeft size={16} /> <span className="hidden sm:inline">Voltar</span>
                </button>
              )}
              {step !== "confirm" ? (
                <button
                  onClick={() => go(1)}
                  disabled={(step === "tours" && (hasErrors || riskLoading)) || (step === "risk" && !riskDone)}
                  className="flex items-center justify-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-extrabold text-white transition hover:bg-ink-800 disabled:opacity-40 lg:ml-auto lg:min-w-56"
                >
                  {riskLoading && step === "tours" ? <Loader2 size={16} className="animate-spin" /> : null}
                  Continuar <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sun-500 to-sun-400 px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-sun-500/30 transition hover:brightness-105 disabled:opacity-60 lg:ml-auto lg:min-w-64"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Enviar reserva
                </button>
              )}
            </div>
          </div>
        </div>

        {/* resumo */}
        <aside className="hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5 lg:sticky lg:top-28 lg:block">
          <p className="font-display text-2xl text-ink-900">Resumo</p>
          <div className="mt-4 space-y-3">
            {items.map((i) => (
              <div key={itemKey(i)} className="flex items-start gap-3">
                <span
                  className="h-11 w-11 shrink-0 rounded-xl bg-cream-100 bg-cover bg-center"
                  style={i.image ? { backgroundImage: `url(${i.image})` } : undefined}
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-ink-900">{i.title}</p>
                  <p className="text-xs text-ink-900/50">
                    {unitCount(i.saleUnit, i.seats)} · {i.date ? shortDate(i.date) : "sem data"}
                  </p>
                </div>
                <span className="text-sm font-bold text-ink-900">{money(itemTotal(i))}</span>
              </div>
            ))}
          </div>
          {savings > 0.004 && (
            <div className="mt-4 flex justify-between text-sm font-bold text-clay-500">
              <span>Descontos</span>
              <span>− {money(savings)}</span>
            </div>
          )}
          <div className="mt-4 flex items-end justify-between border-t border-ink-900/10 pt-4">
            <span className="font-bold text-ink-900">Total</span>
            <span className="font-display text-3xl text-ink-900">{money(total)}</span>
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-teal-50 p-3 text-xs text-teal-700">
            <ShieldCheck size={16} className="shrink-0" /> Sem pagamento agora. Reserva registrada com segurança pela plataforma DunasTour.
          </p>
        </aside>
      </div>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.title}>
        {editing && (
          <div className="p-5">
            <BookingForm base={editing} mode="edit" onDone={() => setEditing(null)} compact />
          </div>
        )}
      </Sheet>
    </div>
  );
}
