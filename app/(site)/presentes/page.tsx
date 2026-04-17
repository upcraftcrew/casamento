"use client";

import { motion } from "framer-motion";
import { ExternalLink, Gift } from "lucide-react";
import MetaLabel from "@/components/wedding/meta-label";
import { Button } from "@/components/ui/button";

type Presente = {
  categoria: string;
  titulo: string;
  descricao: string;
  loja: string;
  url: string;
};

const presentes: Presente[] = [
  { categoria: "Cozinha", titulo: "Jogo de panelas", descricao: "Conjunto completo em inox 18/10, 5 peças.", loja: "Amazon", url: "#" },
  { categoria: "Cozinha", titulo: "Cafeteira italiana", descricao: "Moka express 6 xícaras, alumínio.", loja: "Americanas", url: "#" },
  { categoria: "Quarto", titulo: "Jogo de cama Queen", descricao: "Lençol percal 400 fios, tom off-white.", loja: "Tok&Stok", url: "#" },
  { categoria: "Quarto", titulo: "Travesseiros de plumas", descricao: "Par de travesseiros premium, médio.", loja: "Mercado Livre", url: "#" },
  { categoria: "Sala", titulo: "Quadro decorativo", descricao: "Tela canvas 80×60cm, arte abstrata.", loja: "Etsy", url: "#" },
  { categoria: "Sala", titulo: "Porta-retratos", descricao: "Conjunto 3 peças em madeira natural.", loja: "Amazon", url: "#" },
  { categoria: "Viagem", titulo: "Kit mala de viagem", descricao: "Conjunto 2 malas rígidas com rodas 360°.", loja: "Americanas", url: "#" },
  { categoria: "Viagem", titulo: "Noite de hotel", descricao: "Contribuição para lua de mel.", loja: "PIX", url: "#" },
];

const categorias = Array.from(new Set(presentes.map((p) => p.categoria)));

export default function ListaPresentesPage() {
  return (
    <div className="relative pt-32 pb-20">
      <section className="px-[5vw] md:px-[8vw] mb-20 md:mb-28">
        <MetaLabel className="mb-6">08 · Lista</MetaLabel>
        <h1
          className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)", letterSpacing: "-0.04em" }}
        >
          Lista de
          <br />
          Presentes
        </h1>
        <p className="mt-10 max-w-xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Sua presença já é o nosso maior presente. Mas se quiser nos
          presentear, separamos alguns itens que adoraríamos ter em nosso novo
          lar.
        </p>
      </section>

      {categorias.map((cat) => (
        <section key={cat} className="px-[5vw] md:px-[8vw] mb-16">
          <div className="flex items-center gap-4 mb-8">
            <MetaLabel>{cat}</MetaLabel>
            <span className="flex-1 h-px bg-[hsl(var(--border))]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[hsl(var(--border))]">
            {presentes
              .filter((p) => p.categoria === cat)
              .map((item, i) => (
                <motion.article
                  key={item.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="group bg-background/80 backdrop-blur-sm p-8 flex flex-col gap-4 hover:bg-[hsl(var(--secondary))] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <Gift className="w-4 h-4 text-[hsl(var(--accent))] group-hover:text-[hsl(var(--primary))] transition-colors mt-1" />
                    <span className="meta-label">{item.loja}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display italic text-2xl md:text-3xl mb-2 leading-tight group-hover:text-[hsl(var(--primary))] transition-colors">
                      {item.titulo}
                    </h3>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {item.descricao}
                    </p>
                  </div>

                  <Button
                    asChild
                    variant="link"
                    className="self-start h-auto p-0 pt-4 mt-2 border-t border-[hsl(var(--border))] rounded-none w-full justify-start gap-3 text-[hsl(var(--primary))] no-underline hover:no-underline hover:gap-5 transition-all"
                  >
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                      <span className="meta-label text-[hsl(var(--primary))]">
                        Ver presente
                      </span>
                    </a>
                  </Button>
                </motion.article>
              ))}
          </div>
        </section>
      ))}

      <section className="px-[5vw] md:px-[8vw] mt-10">
        <div className="border border-[hsl(var(--primary))]/30 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-6 bg-[hsl(var(--primary))]/5">
          <div className="flex-1">
            <MetaLabel className="mb-3">Contribuição livre</MetaLabel>
            <h3 className="font-display italic text-3xl md:text-4xl mb-2">
              Chave PIX
            </h3>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
              Prefere contribuir para nossa lua de mel? Use a chave abaixo.
            </p>
          </div>
          <div className="border border-[hsl(var(--border))] px-8 py-5 font-mono text-lg text-[hsl(var(--primary))] bg-background/80">
            paloma.rodrigo@casamento.com
          </div>
        </div>
      </section>
    </div>
  );
}
