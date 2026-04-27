"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-provider";

function formatBRL(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export default function CartDrawer() {
  const cart = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    cart.close();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-[hsl(var(--background))]/85 backdrop-blur-sm"
          onClick={cart.close}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-[hsl(var(--background))] border-l border-[hsl(var(--border))] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-[hsl(var(--border))]">
              <div>
                <span className="meta-label">Carrinho</span>
                <h2 className="font-display italic text-3xl text-[hsl(var(--foreground))] mt-1">
                  {cart.count === 0
                    ? "Vazio"
                    : `${cart.count} ${cart.count === 1 ? "presente" : "presentes"}`}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cart.close}
                aria-label="Fechar carrinho"
                className="hover:bg-transparent hover:text-[hsl(var(--primary))]"
              >
                <X className="w-5 h-5" />
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
              {cart.count === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-20">
                  <ShoppingBag className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                  <p className="font-display italic text-2xl text-[hsl(var(--muted-foreground))] max-w-xs">
                    Você ainda não escolheu nenhum presente.
                  </p>
                  <Button
                    onClick={() => {
                      cart.close();
                      router.push("/presentes");
                    }}
                    className="rounded-none border border-[hsl(var(--primary))] bg-transparent text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] h-auto px-6 py-4"
                  >
                    <span className="meta-label">Ver lista de presentes</span>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-[hsl(var(--border))]">
                  {cart.items.map((it) => (
                    <li
                      key={it.giftId}
                      className="py-5 flex items-start gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="meta-label">{it.categoria}</span>
                        <h3 className="font-display italic text-2xl text-[hsl(var(--foreground))] leading-tight mt-1">
                          {it.titulo}
                        </h3>
                        <p className="font-mono text-sm text-[hsl(var(--primary))] mt-2">
                          R$ {formatBRL(it.preco)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cart.remove(it.giftId)}
                        aria-label={`Remover ${it.titulo}`}
                        className="hover:bg-transparent hover:text-[hsl(var(--destructive))]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.count > 0 && (
              <footer className="px-6 md:px-8 py-6 border-t border-[hsl(var(--border))] space-y-5">
                <div className="flex items-baseline justify-between">
                  <span className="meta-label">Total</span>
                  <span className="font-mono text-xl text-[hsl(var(--primary))]">
                    R$ {formatBRL(cart.total)}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="group w-full gap-3 rounded-none border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-6 py-5"
                >
                  <span className="meta-label text-[hsl(var(--primary-foreground))] group-hover:text-[hsl(var(--primary))]">
                    Ir para o checkout
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
