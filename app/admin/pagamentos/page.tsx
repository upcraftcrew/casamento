"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import {
  Loader2,
  Plus,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import MetaLabel from "@/components/wedding/meta-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PaymentStatus = "pendente" | "pago" | "cancelado" | "expirado";
type PaymentMethod = "PIX" | "CREDIT_CARD" | "MANUAL";

const statusLabels: Record<PaymentStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
  expirado: "Expirado",
};

const methodLabels: Record<PaymentMethod, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão",
  MANUAL: "Manual",
};

export default function AdminPagamentosPage() {
  const payments = useQuery(api.payments.listAdmin);
  const gifts = useQuery(api.gifts.listAdmin);
  const create = useMutation(api.payments.createManual);
  const markPaid = useMutation(api.payments.markPaid);
  const cancel = useMutation(api.payments.cancel);
  const remove = useMutation(api.payments.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [giftId, setGiftId] = useState<string>("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [markAsPaid, setMarkAsPaid] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = payments === undefined || gifts === undefined;
  const list = payments ?? [];

  const closeForm = () => {
    setFormOpen(false);
    setGiftId("");
    setBuyerName("");
    setBuyerEmail("");
    setAmount("");
    setMarkAsPaid(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
      const amountNum = Number(amount.replace(",", "."));
      if (Number.isNaN(amountNum) || amountNum < 0) {
        throw new Error("Valor inválido.");
      }
      if (!giftId) throw new Error("Selecione um presente.");
      await create({
        giftId: giftId as Id<"gifts">,
        buyerName,
        buyerEmail: buyerEmail.trim() || undefined,
        amount: amountNum,
        status: markAsPaid ? "pago" : "pendente",
      });
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar.");
    } finally {
      setIsPending(false);
    }
  };

  const handleMarkPaid = async (id: Id<"payments">) => {
    try {
      await markPaid({ id });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro.");
    }
  };

  const handleCancel = async (id: Id<"payments">) => {
    try {
      await cancel({ id });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro.");
    }
  };

  const handleDelete = async (id: Id<"payments">) => {
    if (!confirm("Excluir este registro?")) return;
    try {
      await remove({ id });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro.");
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignora
    }
  };

  return (
    <div>
      <section className="mb-12">
        <MetaLabel className="mb-6">04 · Pagamentos</MetaLabel>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h1
            className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 6rem)",
              letterSpacing: "-0.04em",
            }}
          >
            Pagamentos
          </h1>
          <Button
            onClick={() => setFormOpen(true)}
            className="group gap-3 rounded-none border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-6 py-4 self-start"
          >
            <Plus className="w-4 h-4" />
            <span className="meta-label text-[hsl(var(--primary-foreground))] group-hover:text-[hsl(var(--primary))]">
              Registrar manualmente
            </span>
          </Button>
        </div>
      </section>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : list.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[hsl(var(--border))]">
          <p className="font-display italic text-2xl text-[hsl(var(--muted-foreground))]">
            Nenhum pagamento registrado ainda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <article
              key={p._id}
              className="border border-[hsl(var(--border))] p-6 md:p-7 bg-background/40"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span
                      className={`meta-label px-2 py-0.5 border ${
                        p.status === "pago"
                          ? "border-[hsl(var(--accent))] text-[hsl(var(--accent))]"
                          : p.status === "cancelado" || p.status === "expirado"
                            ? "border-[hsl(var(--destructive))] text-[hsl(var(--destructive))]"
                            : "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                      }`}
                    >
                      {statusLabels[p.status]}
                    </span>
                    <span className="meta-label px-2 py-0.5 border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                      {methodLabels[p.paymentMethod]}
                    </span>
                    <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">
                      {new Date(p.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <h3 className="font-display italic text-2xl md:text-3xl text-[hsl(var(--foreground))] leading-tight">
                    {p.buyerName}
                  </h3>
                  <div className="flex items-baseline gap-4 flex-wrap text-sm mt-1">
                    {p.buyerEmail && (
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {p.buyerEmail}
                      </span>
                    )}
                    {p.buyerPhone && (
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {p.buyerPhone}
                      </span>
                    )}
                    <span className="font-mono text-[hsl(var(--primary))]">
                      R$ {p.amount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  {p.items.length > 0 && (
                    <ul className="mt-4 border-l-2 border-[hsl(var(--border))] pl-4 space-y-1">
                      {p.items.map((it) => (
                        <li
                          key={it._id}
                          className="text-sm flex items-baseline gap-3"
                        >
                          <span className="meta-label">
                            {it.giftCategoriaSnapshot}
                          </span>
                          <span className="text-[hsl(var(--foreground))]">
                            {it.giftTituloSnapshot}
                          </span>
                          <span className="font-mono text-xs text-[hsl(var(--muted-foreground))] ml-auto">
                            R$ {it.amount.toFixed(2).replace(".", ",")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {p.buyerMessage && (
                    <p className="mt-4 italic text-[hsl(var(--muted-foreground))] border-l-2 border-[hsl(var(--accent))] pl-4">
                      &ldquo;{p.buyerMessage}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col items-start gap-2 flex-wrap md:flex-nowrap">
                  {p.status !== "pago" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkPaid(p._id)}
                      className="gap-2 rounded-none hover:bg-transparent hover:text-[hsl(var(--accent))]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="meta-label">Marcar pago</span>
                    </Button>
                  )}
                  {p.status === "pendente" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(p._id)}
                      className="gap-2 rounded-none hover:bg-transparent hover:text-[hsl(var(--muted-foreground))]"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="meta-label">Cancelar</span>
                    </Button>
                  )}
                  {p.invoiceUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="gap-2 rounded-none hover:bg-transparent hover:text-[hsl(var(--primary))]"
                    >
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="meta-label">Asaas</span>
                      </a>
                    </Button>
                  )}
                  {p.asaasPaymentId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(p.asaasPaymentId!)}
                      className="gap-2 rounded-none hover:bg-transparent hover:text-[hsl(var(--primary))]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="meta-label">Copiar ID</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p._id)}
                    className="gap-2 rounded-none hover:bg-transparent hover:text-[hsl(var(--destructive))]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="meta-label">Excluir</span>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

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
                    Registrar pagamento manual
                  </h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                    Para presentes pagos fora do site (PIX direto, dinheiro, etc).
                  </p>
                </div>
                <button
                  onClick={closeForm}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="gift" className="meta-label block mb-2">
                    Presente
                  </Label>
                  <select
                    id="gift"
                    value={giftId}
                    onChange={(e) => setGiftId(e.target.value)}
                    required
                    className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))] px-0 py-3 font-display italic text-xl text-[hsl(var(--foreground))]"
                  >
                    <option value="">Selecione...</option>
                    {(gifts ?? []).map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.titulo} — {g.categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="buyerName" className="meta-label block mb-2">
                    Nome do convidado
                  </Label>
                  <Input
                    id="buyerName"
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="buyerEmail" className="meta-label block mb-2">
                    E-mail (opcional)
                  </Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="meta-label block mb-2">
                    Valor (R$)
                  </Label>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="0,00"
                    className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markAsPaid}
                    onChange={(e) => setMarkAsPaid(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="meta-label">
                    Já recebido? (marcar presente como pago)
                  </span>
                </label>

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
                      {isPending ? "Salvando..." : "Registrar"}
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
