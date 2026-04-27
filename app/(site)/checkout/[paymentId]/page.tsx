"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import MetaLabel from "@/components/wedding/meta-label";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";

function formatBRL(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function useCountdown(expiresAt: number | undefined) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const diff = Math.max(0, expiresAt - now);
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return {
    expired: diff <= 0,
    text: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
  };
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = use(params);
  const router = useRouter();
  const cart = useCart();
  const purchase = useQuery(api.checkout.getPublic, {
    paymentId: paymentId as Id<"payments">,
  });
  const countdown = useCountdown(purchase?.expiresAt);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (purchase?.status === "pago") {
      cart.clear();
    }
  }, [purchase?.status, cart]);

  if (purchase === undefined) {
    return (
      <div className="pt-32 pb-20 px-[5vw] md:px-[8vw] flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (purchase === null) {
    return (
      <div className="pt-32 pb-20 px-[5vw] md:px-[8vw]">
        <h1 className="font-display italic text-4xl md:text-5xl">
          Pagamento não encontrado
        </h1>
        <p className="mt-4 text-[hsl(var(--muted-foreground))]">
          Verifique o link ou retorne para a lista de presentes.
        </p>
        <Button
          onClick={() => router.push("/presentes")}
          className="mt-8 rounded-none border border-[hsl(var(--primary))] bg-transparent text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] h-auto px-6 py-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="meta-label">Voltar para a lista</span>
        </Button>
      </div>
    );
  }

  const isPaid = purchase.status === "pago";
  const isCanceled =
    purchase.status === "cancelado" || purchase.status === "expirado";
  const isPending = purchase.status === "pendente";

  const handleCopyPix = async () => {
    if (!purchase.pixPayload) return;
    try {
      await navigator.clipboard.writeText(purchase.pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignora
    }
  };

  return (
    <div className="pt-32 pb-20 px-[5vw] md:px-[8vw]">
      <section className="mb-12">
        <MetaLabel className="mb-4">
          {isPaid
            ? "Pagamento confirmado"
            : isCanceled
              ? "Pagamento encerrado"
              : "Pagamento pendente"}
        </MetaLabel>
        <h1
          className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 6rem)",
            letterSpacing: "-0.04em",
          }}
        >
          {isPaid
            ? "Obrigado!"
            : isCanceled
              ? "Pagamento expirou"
              : purchase.paymentMethod === "PIX"
                ? "Pague com PIX"
                : "Pague com cartão"}
        </h1>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16">
        <div>
          {isPaid && (
            <div className="border border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5 p-8 md:p-10">
              <CheckCircle2 className="w-8 h-8 text-[hsl(var(--accent))]" />
              <h2 className="mt-6 font-display italic text-3xl md:text-4xl">
                Pagamento recebido
              </h2>
              <p className="mt-4 text-[hsl(var(--muted-foreground))] leading-relaxed">
                Recebemos seu presente com muito carinho, {purchase.buyerName}.
                Vamos lembrar de você sempre que olharmos para esse item em
                nossa nova casa.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  onClick={() => router.push("/presentes")}
                  className="rounded-none border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-6 py-4"
                >
                  <span className="meta-label text-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))]">
                    Ver outros presentes
                  </span>
                </Button>
                <Button
                  onClick={() => router.push("/home")}
                  variant="ghost"
                  className="rounded-none meta-label hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-6 py-4"
                >
                  Voltar ao início
                </Button>
              </div>
            </div>
          )}

          {isCanceled && (
            <div className="border border-[hsl(var(--border))] bg-background/60 p-8 md:p-10">
              <XCircle className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
              <h2 className="mt-6 font-display italic text-3xl md:text-4xl">
                Reserva cancelada
              </h2>
              <p className="mt-4 text-[hsl(var(--muted-foreground))] leading-relaxed">
                O tempo para concluir o pagamento expirou e os presentes foram
                liberados na lista. Você pode escolher novamente.
              </p>
              <Button
                onClick={() => router.push("/presentes")}
                className="mt-8 rounded-none border border-[hsl(var(--primary))] bg-transparent text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] h-auto px-6 py-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="meta-label">Voltar para a lista</span>
              </Button>
            </div>
          )}

          {isPending && purchase.paymentMethod === "PIX" && (
            <div className="border border-[hsl(var(--border))] bg-background/60 p-8 md:p-10">
              {purchase.pixEncodedImage ? (
                <>
                  <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
                    Abra o app do seu banco, escaneie o QR Code abaixo ou copie
                    o código PIX. A confirmação aparece aqui automaticamente.
                  </p>
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    <div className="bg-white p-4 border border-[hsl(var(--border))]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/png;base64,${purchase.pixEncodedImage}`}
                        alt="QR Code PIX"
                        className="w-56 h-56"
                      />
                    </div>
                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <MetaLabel className="mb-2">Copia e cola</MetaLabel>
                        <div className="border border-[hsl(var(--border))] bg-background/80 p-4 font-mono text-xs break-all max-h-32 overflow-y-auto">
                          {purchase.pixPayload}
                        </div>
                      </div>
                      <Button
                        onClick={handleCopyPix}
                        className="w-full rounded-none border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-6 py-4 gap-3 group"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="meta-label text-[hsl(var(--primary-foreground))] group-hover:text-[hsl(var(--primary))]">
                          {copied ? "Copiado!" : "Copiar código PIX"}
                        </span>
                      </Button>
                      {countdown && (
                        <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                          <Clock className="w-4 h-4" />
                          <span className="meta-label">
                            Reserva expira em {countdown.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gerando QR Code do PIX...</span>
                </div>
              )}
            </div>
          )}

          {isPending && purchase.paymentMethod === "CREDIT_CARD" && (
            <div className="border border-[hsl(var(--border))] bg-background/60 p-8 md:p-10">
              {purchase.invoiceUrl ? (
                <>
                  <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
                    Você será redirecionado para a página segura do Asaas para
                    inserir os dados do seu cartão. Após a confirmação, esta
                    tela vai atualizar automaticamente.
                  </p>
                  <Button
                    asChild
                    className="rounded-none border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-6 py-5 gap-3 group"
                  >
                    <a
                      href={purchase.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="meta-label text-[hsl(var(--primary-foreground))] group-hover:text-[hsl(var(--primary))]">
                        Pagar com cartão
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                  {countdown && (
                    <div className="mt-6 flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                      <Clock className="w-4 h-4" />
                      <span className="meta-label">
                        Reserva expira em {countdown.text}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gerando link de pagamento...</span>
                </div>
              )}
            </div>
          )}
        </div>

        <aside>
          <div className="border border-[hsl(var(--border))] bg-background/60 p-6 md:p-8 sticky top-28">
            <MetaLabel className="mb-4">Resumo</MetaLabel>
            <ul className="divide-y divide-[hsl(var(--border))] -mx-2">
              {purchase.items.map((it) => (
                <li
                  key={it.giftId}
                  className="px-2 py-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <span className="meta-label">{it.categoria}</span>
                    <p className="font-display italic text-xl text-[hsl(var(--foreground))] leading-tight mt-1">
                      {it.titulo}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-[hsl(var(--primary))] whitespace-nowrap">
                    R$ {formatBRL(it.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[hsl(var(--border))] mt-2 pt-5 flex items-baseline justify-between">
              <span className="meta-label">Total</span>
              <span className="font-mono text-2xl text-[hsl(var(--primary))]">
                R$ {formatBRL(purchase.amount)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
