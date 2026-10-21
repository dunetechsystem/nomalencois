/** As combinações de cor dos posts da NOMA (fundo · marca · texto), usadas nos blocos do site. */
export const TONES = {
  lagoa: { card: "bg-teal-500", accent: "text-ink-800", text: "text-ink-950/75" },
  buriti: { card: "bg-olive-400", accent: "text-olive-700", text: "text-ink-950/75" },
  areia: { card: "bg-cream-100", accent: "text-teal-600", text: "text-ink-900/70" },
  mata: { card: "bg-forest-800", accent: "text-sun-400", text: "text-white/75" },
  "por-do-sol": { card: "bg-clay-500", accent: "text-sun-400", text: "text-white/80" },
  noite: { card: "bg-ink-950", accent: "text-sun-300", text: "text-white/70" },
} as const;

export type Tone = keyof typeof TONES;

export const toneOf = (name: string) => TONES[name as Tone] ?? TONES.lagoa;
