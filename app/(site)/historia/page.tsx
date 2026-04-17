"use client";

import { motion } from "framer-motion";
import MetaLabel from "@/components/wedding/meta-label";

type Chapter = { year: string; title: string; text: string };

const chapters: Chapter[] = [
  {
    year: "2018",
    title: "O primeiro olhar",
    text: "Uma festa cheia, um instante impossível de explicar. Nos vimos no meio da multidão — e o resto do mundo silenciou por alguns segundos.",
  },
  {
    year: "2019",
    title: "O primeiro \"sim\"",
    text: "Um café, uma conversa que virou jantar, que virou caminhada, que virou madrugada. Quando percebemos, já tínhamos começado algo.",
  },
  {
    year: "2022",
    title: "O primeiro lar",
    text: "Caixas de papelão, uma planta carente e um sofá que nunca coube na porta. Construímos um espaço que, finalmente, parecia nosso.",
  },
  {
    year: "2024",
    title: "O pedido",
    text: "Sem plateia, sem ensaio. Só nós dois, num fim de tarde comum que virou o mais extraordinário de todos.",
  },
  {
    year: "2025",
    title: "O agora",
    text: "E aqui estamos — prestes a transformar tudo isso em um só nome, uma só casa, uma só história sendo contada por duas vozes.",
  },
];

export default function NossaHistoriaPage() {
  return (
    <div className="relative pt-32 pb-20">
      <section className="px-[5vw] md:px-[8vw] mb-20 md:mb-32">
        <MetaLabel className="mb-6">02 · O Arquivo</MetaLabel>
        <h1
          className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)", letterSpacing: "-0.04em" }}
        >
          Nossa História
        </h1>
        <p className="mt-10 max-w-xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Cada amor tem seu próprio tempo. O nosso demorou o tempo exato para se
          tornar verdadeiro.
        </p>
      </section>

      <section className="px-[5vw] md:px-[8vw]">
        <div className="relative">
          <div
            className="absolute left-0 md:left-[25%] top-0 bottom-0 w-px bg-[hsl(var(--border))]"
            aria-hidden
          />

          <div className="space-y-24 md:space-y-32">
            {chapters.map((c, i) => (
              <motion.article
                key={c.year}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="relative grid md:grid-cols-12 gap-6 md:gap-10"
              >
                <div className="md:col-span-3 pl-6 md:pl-0 md:pr-8">
                  <span
                    className="absolute left-[-5px] md:left-[calc(25%-5px)] top-2 w-[9px] h-[9px] rounded-full bg-[hsl(var(--primary))]"
                    aria-hidden
                  />
                  <MetaLabel className="mb-2">Capítulo 0{i + 1}</MetaLabel>
                  <span className="font-mono text-lg text-[hsl(var(--primary))]">
                    {c.year}
                  </span>
                </div>

                <div className="md:col-span-8 md:col-start-5 pl-6 md:pl-0">
                  <h2 className="font-display italic text-3xl md:text-5xl mb-5 leading-tight">
                    {c.title}
                  </h2>
                  <p className="text-[hsl(var(--muted-foreground))] text-lg leading-[1.7] max-w-xl">
                    {c.text}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
