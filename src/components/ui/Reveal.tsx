"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Sobe e aparece quando entra na tela. */
export function Reveal({ children, delay = 0, className, y = 32 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  text,
  light = false,
  center = false,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`text-xs font-bold uppercase tracking-[0.3em] ${light ? "text-sun-300" : "text-clay-500"}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-balance font-display text-4xl leading-[1.05] sm:text-5xl ${light ? "text-white" : "text-ink-900"}`}>{title}</h2>
      {text && <p className={`mt-4 text-base leading-relaxed sm:text-lg ${light ? "text-white/70" : "text-ink-900/60"}`}>{text}</p>}
    </Reveal>
  );
}
