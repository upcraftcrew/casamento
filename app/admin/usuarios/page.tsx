"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import {
  Loader2,
  Shield,
  Trash2,
  Plus,
  X,
  Check,
  Clock,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import MetaLabel from "@/components/wedding/meta-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminUsuariosPage() {
  const users = useQuery(api.users.listAdmin);
  const me = useQuery(api.users.current);
  const invite = useMutation(api.users.inviteByEmail);
  const remove = useMutation(api.users.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = users === undefined || me === undefined;
  const list = users ?? [];
  const ativos = list.filter((u) => !!u.clerkUserId).length;
  const pendentes = list.length - ativos;

  const closeForm = () => {
    setFormOpen(false);
    setEmail("");
    setName("");
    setError(null);
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
      await invite({ email, name: name.trim() || undefined });
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: Id<"users">, email: string) => {
    if (!confirm(`Remover o acesso de ${email}?`)) return;
    try {
      await remove({ id });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  };

  return (
    <div>
      <section className="mb-12">
        <MetaLabel className="mb-6">05 · Acesso</MetaLabel>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h1
            className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 6rem)",
              letterSpacing: "-0.04em",
            }}
          >
            Admins
          </h1>
          <Button
            onClick={() => setFormOpen(true)}
            className="group gap-3 rounded-none border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-6 py-4 self-start"
          >
            <Plus className="w-4 h-4" />
            <span className="meta-label text-[hsl(var(--primary-foreground))] group-hover:text-[hsl(var(--primary))]">
              Adicionar
            </span>
          </Button>
        </div>
        <p className="mt-8 max-w-xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Apenas e-mails cadastrados aqui podem entrar na área dos noivos. Ao
          logar pela primeira vez o cadastro é concluído automaticamente.
        </p>
      </section>

      <section className="mb-10 grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-[hsl(var(--border))]">
        <div className="border border-[hsl(var(--border))] p-6 bg-background/80 backdrop-blur-sm">
          <MetaLabel className="mb-3">Total</MetaLabel>
          <div className="font-display italic text-4xl text-[hsl(var(--primary))]">
            {list.length}
          </div>
        </div>
        <div className="border border-[hsl(var(--border))] p-6 bg-background/80 backdrop-blur-sm">
          <MetaLabel className="mb-3">Ativos</MetaLabel>
          <div className="font-display italic text-4xl text-[hsl(var(--primary))]">
            {ativos}
          </div>
        </div>
        <div className="border border-[hsl(var(--border))] p-6 bg-background/80 backdrop-blur-sm">
          <MetaLabel className="mb-3">Pendentes</MetaLabel>
          <div className="font-display italic text-4xl text-[hsl(var(--primary))]">
            {pendentes}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[hsl(var(--border))]">
          <p className="font-display italic text-2xl text-[hsl(var(--muted-foreground))] mb-4">
            Nenhum admin cadastrado.
          </p>
          <Button
            variant="link"
            onClick={() => setFormOpen(true)}
            className="text-[hsl(var(--primary))]"
          >
            Adicionar o primeiro
          </Button>
        </div>
      ) : (
        <div className="border-t border-[hsl(var(--border))]">
          <AnimatePresence>
            {list.map((user) => {
              const isMe = me?._id === user._id;
              const isAtivo = !!user.clerkUserId;
              return (
                <motion.article
                  key={user._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-[hsl(var(--border))] py-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                        isAtivo
                          ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                          : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                      }`}
                    >
                      {isAtivo ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-display italic text-xl md:text-2xl text-[hsl(var(--foreground))] leading-tight">
                          {user.name || user.email}
                        </h3>
                        <span
                          className={`meta-label px-2 py-0.5 border ${
                            isAtivo
                              ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                              : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                          }`}
                        >
                          {isAtivo ? "Ativo" : "Aguardando login"}
                        </span>
                        {isMe && (
                          <span className="meta-label px-2 py-0.5 border border-[hsl(var(--accent))] text-[hsl(var(--accent))]">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] break-all">
                        {user.email}
                      </p>
                      <p className="font-mono text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        {isAtivo ? "Entrou" : "Convidado"} em{" "}
                        {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user._id, user.email)}
                      disabled={isMe}
                      className="gap-2 rounded-none hover:bg-transparent hover:text-[hsl(var(--destructive))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="meta-label">Remover</span>
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <section className="mt-12 border border-[hsl(var(--border))] p-6 md:p-8">
        <MetaLabel className="mb-3">Como funciona</MetaLabel>
        <ul className="space-y-2 text-[hsl(var(--muted-foreground))] leading-relaxed text-sm">
          <li>
            · Cadastre aqui o e-mail de quem precisa acessar a área admin.
          </li>
          <li>
            · No primeiro login via Clerk com esse e-mail, a conta é ativada e
            o perfil (nome, avatar) é preenchido automaticamente.
          </li>
          <li>
            · E-mails listados em{" "}
            <span className="font-mono text-[hsl(var(--primary))]">
              ADMIN_EMAILS
            </span>{" "}
            (env) também entram automaticamente no primeiro login.
          </li>
          <li>· O sistema nunca deixa ficar sem nenhum admin.</li>
        </ul>
      </section>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[hsl(var(--background))]/90 backdrop-blur-sm flex items-start md:items-center justify-center overflow-y-auto py-10 px-4"
            onClick={closeForm}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] p-8 md:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <MetaLabel className="mb-3">Novo</MetaLabel>
                  <h2 className="font-display italic text-3xl text-[hsl(var(--foreground))]">
                    Adicionar admin
                  </h2>
                </div>
                <button
                  onClick={closeForm}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-5">
                <div>
                  <Label htmlFor="invite-email" className="meta-label block mb-2">
                    E-mail
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="rodrigo@exemplo.com"
                    className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="invite-name" className="meta-label block mb-2">
                    Nome (opcional)
                  </Label>
                  <Input
                    id="invite-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[hsl(var(--destructive))]">
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-[hsl(var(--border))]">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="group gap-3 rounded-none border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-6 py-4"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span className="meta-label text-[hsl(var(--primary-foreground))] group-hover:text-[hsl(var(--primary))]">
                      {isPending ? "Salvando..." : "Adicionar"}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={closeForm}
                    className="rounded-none meta-label hover:bg-transparent"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
