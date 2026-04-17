"use client";

import { motion } from "framer-motion";
import MetaLabel from "@/components/wedding/meta-label";

type Person = { name: string; role: string; side: string };

const groomsmen: Person[] = [
  { name: "Rafael Costa", role: "Padrinho", side: "Ele" },
  { name: "Ana Beatriz", role: "Madrinha", side: "Ela" },
  { name: "Gustavo Lima", role: "Padrinho", side: "Ele" },
  { name: "Carolina Reis", role: "Madrinha", side: "Ela" },
  { name: "Thiago Moreira", role: "Padrinho", side: "Ele" },
  { name: "Juliana Alves", role: "Madrinha", side: "Ela" },
  { name: "Pedro Henrique", role: "Padrinho", side: "Ele" },
  { name: "Letícia Souza", role: "Madrinha", side: "Ela" },
];

export default function PadrinhosPage() {
  return (
    <div className="relative pt-32 pb-20">
      <section className="px-[5vw] md:px-[8vw] mb-20 md:mb-28">
        <MetaLabel className="mb-6">03 · Círculo íntimo</MetaLabel>
        <h1
          className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)", letterSpacing: "-0.04em" }}
        >
          Padrinhos
        </h1>
        <p className="mt-10 max-w-xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Os que caminharam conosco antes — e que escolhemos para estar ao nosso
          lado no momento em que tudo se transforma.
        </p>
      </section>

      <section className="px-[5vw] md:px-[8vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[hsl(var(--border))]">
          {groomsmen.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.08 }}
              className="group relative bg-background p-8 md:p-10 min-h-[280px] flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute inset-0 bg-[hsl(var(--primary))]/0 group-hover:bg-[hsl(var(--primary))]/5 transition-colors duration-500" />
              <div className="relative flex items-start justify-between">
                <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="meta-label">{p.side}</span>
              </div>
              <div className="relative">
                <h3 className="font-display italic text-2xl md:text-3xl leading-tight mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                  {p.name}
                </h3>
                <p className="meta-label">{p.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
