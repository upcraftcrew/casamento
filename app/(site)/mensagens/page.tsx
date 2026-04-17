"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { Send, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import MetaLabel from "@/components/wedding/meta-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MensagensPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const messages = useQuery(api.messages.list);
  const createMessage = useMutation(api.messages.create);

  const isLoading = messages === undefined;
  const list = messages ?? [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isPending) return;

    try {
      setIsPending(true);
      await createMessage({ name: name.trim(), message: message.trim() });
      setName("");
      setMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative pt-32 pb-20">
      <section className="px-[5vw] md:px-[8vw] mb-20 md:mb-28">
        <MetaLabel className="mb-6">06 · Mural</MetaLabel>
        <h1
          className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)", letterSpacing: "-0.04em" }}
        >
          Mensagens
        </h1>
        <p className="mt-10 max-w-xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Deixe uma palavra, um voto, uma lembrança. Cada mensagem será
          guardada — e lida, algum dia, num aniversário qualquer.
        </p>
      </section>

      <section className="px-[5vw] md:px-[8vw]">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5 md:sticky md:top-28 self-start">
            <MetaLabel className="mb-6">Deixe a sua</MetaLabel>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="msg-name" className="meta-label block mb-2">
                  Nome
                </Label>
                <Input
                  id="msg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]/60"
                />
              </div>
              <div>
                <Label htmlFor="msg-text" className="meta-label block mb-2">
                  Mensagem
                </Label>
                <Textarea
                  id="msg-text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Eu, ____, desejo aos noivos..."
                  required
                  className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 text-lg text-[hsl(var(--foreground))] leading-relaxed resize-none"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={isPending}
                className="group gap-4 rounded-none border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] h-auto px-6 py-4"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="meta-label group-hover:text-[hsl(var(--primary-foreground))]">
                  {isPending ? "Enviando..." : "Enviar mensagem"}
                </span>
              </Button>
            </form>
          </div>

          <div className="md:col-span-7">
            <div className="flex items-center justify-between mb-8">
              <MetaLabel>{list.length} registros</MetaLabel>
              <span className="meta-label">Mais recentes</span>
            </div>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
              </div>
            ) : list.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display italic text-2xl text-[hsl(var(--muted-foreground))]">
                  Seja o primeiro a deixar uma mensagem.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {list.map((m, i) => (
                    <motion.article
                      key={m._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="group border-t border-[hsl(var(--border))] last:border-b py-8 grid grid-cols-[auto_1fr] gap-6"
                    >
                      <span className="font-mono text-xs text-[hsl(var(--muted-foreground))] pt-1">
                        {String(list.length - i).padStart(3, "0")}
                      </span>
                      <div>
                        <p className="text-lg text-[hsl(var(--foreground))] leading-[1.7] mb-4">
                          “{m.message}”
                        </p>
                        <div className="flex items-baseline gap-4">
                          <span className="h-px w-6 bg-[hsl(var(--accent))]" />
                          <span className="font-display italic text-xl text-[hsl(var(--primary))]">
                            {m.name}
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
