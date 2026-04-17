"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Loader2, Gift, MessageCircle, Wallet, ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import MetaLabel from "@/components/wedding/meta-label";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="border border-[hsl(var(--border))] p-8 bg-background/80 backdrop-blur-sm">
      <MetaLabel className="mb-4">{label}</MetaLabel>
      <div className="font-display italic text-5xl md:text-6xl text-[hsl(var(--primary))]">
        {value}
      </div>
      {hint && (
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{hint}</p>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const giftStats = useQuery(api.gifts.stats);
  const messageCount = useQuery(api.messages.countAdmin);
  const paymentStats = useQuery(api.payments.stats);

  const isLoading =
    giftStats === undefined ||
    messageCount === undefined ||
    paymentStats === undefined;

  return (
    <div>
      <section className="mb-16">
        <MetaLabel className="mb-6">00 · Dashboard</MetaLabel>
        <h1
          className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 6rem)",
            letterSpacing: "-0.04em",
          }}
        >
          Painel dos
          <br />
          Noivos
        </h1>
        <p className="mt-8 max-w-xl text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          Acompanhe presentes, mensagens e pagamentos em um só lugar.
        </p>
      </section>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : (
        <>
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <MetaLabel>Presentes</MetaLabel>
              <span className="flex-1 h-px bg-[hsl(var(--border))]" />
              <Link
                href="/admin/presentes"
                className="meta-label hover:text-[hsl(var(--primary))] transition-colors inline-flex items-center gap-2"
              >
                Gerenciar <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[hsl(var(--border))]">
              <StatCard label="Total" value={giftStats.total} />
              <StatCard label="Disponíveis" value={giftStats.disponivel} />
              <StatCard label="Reservados" value={giftStats.reservado} />
              <StatCard label="Pagos" value={giftStats.pago} />
            </div>
          </section>

          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <MetaLabel>Mensagens</MetaLabel>
              <span className="flex-1 h-px bg-[hsl(var(--border))]" />
              <Link
                href="/admin/mensagens"
                className="meta-label hover:text-[hsl(var(--primary))] transition-colors inline-flex items-center gap-2"
              >
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[hsl(var(--border))]">
              <StatCard
                label="Recebidas"
                value={messageCount}
                hint="Mensagens deixadas no mural."
              />
              <div className="border border-[hsl(var(--border))] p-8 bg-background/80 backdrop-blur-sm flex flex-col justify-between">
                <MetaLabel className="mb-4">Atalho</MetaLabel>
                <Link
                  href="/admin/mensagens"
                  className="group flex items-center gap-3 text-[hsl(var(--primary))] hover:gap-5 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-display italic text-2xl">
                    Ler o mural
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <MetaLabel>Pagamentos</MetaLabel>
              <span className="flex-1 h-px bg-[hsl(var(--border))]" />
              <Link
                href="/admin/pagamentos"
                className="meta-label hover:text-[hsl(var(--primary))] transition-colors inline-flex items-center gap-2"
              >
                Gerenciar <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[hsl(var(--border))]">
              <StatCard label="Registros" value={paymentStats.total} />
              <StatCard label="Pendentes" value={paymentStats.pendente} />
              <StatCard label="Pagos" value={paymentStats.pago} />
              <StatCard
                label="Arrecadado"
                value={`R$ ${paymentStats.totalArrecadado
                  .toFixed(2)
                  .replace(".", ",")}`}
              />
            </div>
          </section>

          <section className="border border-[hsl(var(--primary))]/30 p-8 md:p-12 bg-[hsl(var(--primary))]/5 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <MetaLabel className="mb-3">Em breve</MetaLabel>
              <h3 className="font-display italic text-3xl md:text-4xl mb-2">
                Integração com Asaas
              </h3>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xl">
                Em breve será possível receber pagamentos via PIX e cartão
                diretamente pelo site, com confirmação automática.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Gift className="w-5 h-5 text-[hsl(var(--primary))]" />
              <Wallet className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
