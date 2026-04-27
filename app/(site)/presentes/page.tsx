"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import {
  CheckCircle2,
  ExternalLink,
  Gift,
  Loader2,
  Plus,
  ShoppingBag,
  Check,
  Clock,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import MetaLabel from "@/components/wedding/meta-label";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";

export default function ListaPresentesPage() {
  const presentes = useQuery(api.gifts.listPublic);
  const cart = useCart();
  const isLoading = presentes === undefined;
  const lista = presentes ?? [];
  const categorias = Array.from(new Set(lista.map((p) => p.categoria)));

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
          presentear, escolha um ou mais itens abaixo. Você pode pagar com PIX
          ou cartão diretamente pelo site.
        </p>
      </section>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : lista.length === 0 ? (
        <div className="py-20 text-center px-[5vw]">
          <p className="font-display italic text-2xl text-[hsl(var(--muted-foreground))]">
            A lista está sendo preparada com carinho.
          </p>
        </div>
      ) : (
        categorias.map((cat) => (
          <section key={cat} className="px-[5vw] md:px-[8vw] mb-16">
            <div className="flex items-center gap-4 mb-8">
              <MetaLabel>{cat}</MetaLabel>
              <span className="flex-1 h-px bg-[hsl(var(--border))]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[hsl(var(--border))]">
              {lista
                .filter((p) => p.categoria === cat)
                .map((item, i) => {
                  const isPago = item.status === "pago";
                  const isReservado = item.status === "reservado";
                  const inCart = cart.has(item._id);
                  const semPreco = typeof item.preco !== "number";

                  return (
                    <motion.article
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                      className={`group bg-background/80 backdrop-blur-sm p-8 flex flex-col gap-4 transition-colors ${
                        isPago || isReservado
                          ? "opacity-60"
                          : "hover:bg-[hsl(var(--secondary))]"
                      }`}
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
                        {item.preco !== undefined && (
                          <p className="mt-3 font-mono text-sm text-[hsl(var(--primary))]">
                            R$ {item.preco.toFixed(2).replace(".", ",")}
                          </p>
                        )}
                      </div>

                      <div className="self-stretch pt-4 mt-2 border-t border-[hsl(var(--border))] flex items-center justify-between gap-3">
                        {isPago ? (
                          <span className="meta-label text-[hsl(var(--accent))] inline-flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" />
                            Já foi presenteado
                          </span>
                        ) : isReservado ? (
                          <span className="meta-label text-[hsl(var(--muted-foreground))] inline-flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Reservado
                          </span>
                        ) : semPreco ? (
                          <span className="meta-label text-[hsl(var(--muted-foreground))]">
                            Sem preço definido
                          </span>
                        ) : inCart ? (
                          <Button
                            type="button"
                            onClick={() => cart.remove(item._id)}
                            variant="ghost"
                            className="h-auto p-0 rounded-none gap-2 text-[hsl(var(--accent))] hover:bg-transparent hover:text-[hsl(var(--accent))] hover:gap-3 transition-all"
                          >
                            <Check className="w-3 h-3" />
                            <span className="meta-label text-[hsl(var(--accent))]">
                              No carrinho
                            </span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              cart.add({
                                giftId: item._id,
                                titulo: item.titulo,
                                categoria: item.categoria,
                                preco: item.preco ?? 0,
                                imagem: item.imagem,
                              });
                              cart.open();
                            }}
                            variant="ghost"
                            className="h-auto p-0 rounded-none gap-2 text-[hsl(var(--primary))] hover:bg-transparent hover:text-[hsl(var(--primary))] hover:gap-3 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            <span className="meta-label text-[hsl(var(--primary))]">
                              Adicionar ao carrinho
                            </span>
                          </Button>
                        )}

                        {item.url && item.url !== "#" && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="meta-label inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
                            aria-label={`Ver ${item.titulo} na loja`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver loja
                          </a>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
            </div>
          </section>
        ))
      )}

      {cart.count > 0 && (
        <section className="px-[5vw] md:px-[8vw] mt-10">
          <div className="border border-[hsl(var(--primary))] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 bg-[hsl(var(--primary))]/5">
            <div className="flex-1">
              <MetaLabel className="mb-2">
                {cart.count} {cart.count === 1 ? "presente" : "presentes"} no carrinho
              </MetaLabel>
              <p className="font-display italic text-2xl md:text-3xl">
                Total: R$ {cart.total.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <Button
              onClick={cart.open}
              className="group gap-3 rounded-none border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-6 py-4"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="meta-label text-[hsl(var(--primary-foreground))] group-hover:text-[hsl(var(--primary))]">
                Ver carrinho e pagar
              </span>
            </Button>
          </div>
        </section>
      )}

      <section className="px-[5vw] md:px-[8vw] mt-10">
        <div className="border border-[hsl(var(--border))] p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-6 bg-background/40">
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
