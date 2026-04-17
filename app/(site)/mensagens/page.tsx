import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MetaLabel from '../components/wedding/MetaLabel';
import { Send, Loader2 } from 'lucide-react';

export default function Mensagens() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const qc = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 100),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (payload) => base44.entities.Message.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      setName('');
      setMessage('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    createMutation.mutate({ name: name.trim(), message: message.trim() });
  };

  return (
    <div className="relative pt-32 pb-20">
      <section className="px-[5vw] md:px-[8vw] mb-20 md:mb-28">
        <MetaLabel className="mb-6">06 · Mural</MetaLabel>
        <h1
          className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
          style={{ fontSize: 'clamp(3rem, 10vw, 9rem)', letterSpacing: '-0.04em' }}
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
          {/* Form */}
          <div className="md:col-span-5 md:sticky md:top-28 self-start">
            <MetaLabel className="mb-6">Deixe a sua</MetaLabel>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="meta-label block mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] outline-none py-3 font-display italic text-xl text-[hsl(var(--foreground))] transition-colors"
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div>
                <label className="meta-label block mb-2">Mensagem</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full bg-transparent border-b border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] outline-none py-3 text-lg text-[hsl(var(--foreground))] leading-relaxed transition-colors resize-none"
                  placeholder="Eu, ____, desejo aos noivos..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="group inline-flex items-center gap-4 border border-[hsl(var(--primary))] text-[hsl(var(--primary))] px-6 py-4 hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="meta-label">
                  {createMutation.isPending ? 'Enviando...' : 'Enviar mensagem'}
                </span>
              </button>
            </form>
          </div>

          {/* List */}
          <div className="md:col-span-7">
            <div className="flex items-center justify-between mb-8">
              <MetaLabel>{messages.length} registros</MetaLabel>
              <span className="meta-label">Mais recentes</span>
            </div>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display italic text-2xl text-[hsl(var(--muted-foreground))]">
                  Seja o primeiro a deixar uma mensagem.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {messages.map((m, i) => (
                    <motion.article
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="group border-t border-[hsl(var(--border))] last:border-b py-8 grid grid-cols-[auto_1fr] gap-6"
                    >
                      <span className="font-mono text-xs text-[hsl(var(--muted-foreground))] pt-1">
                        {String(messages.length - i).padStart(3, '0')}
                      </span>
                      <div>
                        <p className="text-lg text-[hsl(var(--foreground))] leading-[1.7] mb-4">
                          "{m.message}"
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