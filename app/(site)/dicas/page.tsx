"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Shirt, Hotel, Car, Gift, Camera, Heart } from "lucide-react";
import MetaLabel from "@/components/wedding/meta-label";

type Tip = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  text: string;
};

const tips: Tip[] = [
  {
    icon: Shirt,
    title: "Dress Code",
    subtitle: "Black Tie",
    text: "Pedimos trajes de gala. Elas: vestidos longos. Eles: smoking ou terno escuro. Evite branco — reservado à noiva.",
  },
  {
    icon: Hotel,
    title: "Hospedagem",
    subtitle: "Sugestões",
    text: "Reservamos tarifas especiais em três hotéis próximos ao Espaço Luz. Consulte a lista completa enviada por e-mail.",
  },
  {
    icon: Car,
    title: "Como chegar",
    subtitle: "Transporte",
    text: "Haverá valet gratuito no local. Recomendamos Uber/99 para quem prefere brindar sem preocupação.",
  },
  {
    icon: Gift,
    title: "Presentes",
    subtitle: "Lista",
    text: "Sua presença já é o maior presente. Para quem quiser, nossa lista editorial está disponível na área \"Lista de Presentes\".",
  },
  {
    icon: Camera,
    title: "Fotos",
    subtitle: "Momento presença",
    text: "Pedimos celulares guardados durante a cerimônia. Depois, compartilhe suas imagens com #PalomaERodrigo2025.",
  },
  {
    icon: Heart,
    title: "Crianças",
    subtitle: "Crianças bem-vindas",
    text: "Crianças são bem-vindas para celebrar conosco! O espaço conta com área kids e equipe para cuidar dos pequenos.",
  },
];

export default function DicasPage() {
  return (
    <div className="relative pt-32 pb-20">
      <section className="px-[5vw] md:px-[8vw] mb-20 md:mb-28">
        <MetaLabel className="mb-6">07 · Guia do convidado</MetaLabel>
        <h1
          className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)", letterSpacing: "-0.04em" }}
        >
          Dicas
        </h1>
        <p className="mt-10 max-w-xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Tudo o que você precisa para viver conosco o dia inteiro — do traje ao
          transporte, passando por cada pequeno detalhe.
        </p>
      </section>

      <section className="px-[5vw] md:px-[8vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[hsl(var(--border))]">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <motion.article
                key={tip.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: (i % 2) * 0.08 }}
                className="group bg-background p-8 md:p-12 min-h-[320px] flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-8 right-8 md:top-12 md:right-12">
                  <Icon className="w-5 h-5 text-[hsl(var(--accent))] group-hover:text-[hsl(var(--primary))] transition-colors" />
                </div>

                <MetaLabel className="mb-8">
                  {String(i + 1).padStart(2, "0")} · {tip.subtitle}
                </MetaLabel>

                <h3
                  className="font-display italic leading-[0.95] mb-6"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                >
                  {tip.title}
                </h3>

                <p className="text-[hsl(var(--muted-foreground))] leading-[1.7] text-lg max-w-md mt-auto">
                  {tip.text}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
