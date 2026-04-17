"use client";

import { motion } from "framer-motion";
import Countdown from "@/components/wedding/countdown";
import MetaLabel from "@/components/wedding/meta-label";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <section className="relative min-h-screen w-full flex flex-col justify-between px-[5vw] md:px-[8vw] pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 -z-0 bg-gradient-to-b from-white/20 via-transparent to-white/40" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative z-10 mt-16"
        >
          <MetaLabel className="mb-4">Ela</MetaLabel>
          <h1
            className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
            style={{ fontSize: "clamp(4rem, 13vw, 11rem)", letterSpacing: "-0.05em" }}
          >
            Paloma
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.5 }}
          className="relative z-10 self-center text-center my-6"
        >
          <span
            className="font-display italic text-[hsl(var(--primary))] block leading-none"
            style={{ fontSize: "clamp(5rem, 16vw, 14rem)" }}
          >
            &amp;
          </span>
          <div className="flex items-center gap-4 mt-4 justify-center">
            <span className="h-px w-10 bg-[hsl(var(--accent))]" />
            <span className="font-mono text-xs tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
              15 · 11 · 2025
            </span>
            <span className="h-px w-10 bg-[hsl(var(--accent))]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="relative z-10 self-end text-right"
        >
          <MetaLabel className="mb-4 justify-end">Ele</MetaLabel>
          <h1
            className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
            style={{ fontSize: "clamp(4rem, 13vw, 11rem)", letterSpacing: "-0.05em" }}
          >
            Rodrigo
          </h1>
        </motion.div>
      </section>

      <section className="relative px-[5vw] md:px-[8vw] py-20 border-y border-[hsl(var(--border))]">
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div className="max-w-md">
            <MetaLabel className="mb-5">Contagem regressiva</MetaLabel>
            <h2 className="font-display italic text-4xl md:text-5xl leading-tight">
              Até o dia em que tudo se tornará um só.
            </h2>
          </div>
          <Countdown />
        </div>
      </section>

      <section className="relative px-[5vw] md:px-[8vw] py-28 md:py-40">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
            <MetaLabel>Prólogo</MetaLabel>
          </div>
          <div className="md:col-span-8 md:col-start-5">
            <p className="font-display text-3xl md:text-5xl leading-[1.15] text-[hsl(var(--foreground))]">
              Dois caminhos que se encontraram,
              <em className="text-[hsl(var(--primary))]"> um só destino</em>, e
              uma eternidade inteira por vir.
            </p>
            <p className="mt-10 text-[hsl(var(--muted-foreground))] max-w-xl leading-relaxed">
              Neste arquivo, reunimos cada capítulo da nossa história — do acaso
              ao altar. Navegue, explore, e guarde esta data: queremos você
              conosco.
            </p>
          </div>
        </div>
      </section>

      <section className="relative px-[5vw] md:px-[8vw] py-10 border-t border-[hsl(var(--border))]">
        <div className="flex flex-wrap gap-6 md:gap-12 items-center justify-between">
          <span className="meta-label">23.5505° S · 46.6333° W</span>
          <span className="meta-label">Duração estimada: 8h</span>
          <span className="meta-label">Dress code: Black Tie</span>
        </div>
      </section>
    </div>
  );
}
