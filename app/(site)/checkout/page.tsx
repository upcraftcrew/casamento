"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { ArrowLeft, ArrowRight, CreditCard, Loader2, QrCode } from "lucide-react";
import { api } from "@/convex/_generated/api";
import MetaLabel from "@/components/wedding/meta-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/cart/cart-provider";

type PaymentMethodChoice = "PIX" | "CREDIT_CARD";

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatBRL(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const createCheckout = useAction(api.checkout.createCheckout);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodChoice>("PIX");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!redirecting && cart.count === 0) {
      router.replace("/presentes");
    }
  }, [cart.count, redirecting, router]);

  if (cart.count === 0) {
    return (
      <div className="pt-32 pb-20 px-[5vw] md:px-[8vw] flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
      const result = await createCheckout({
        giftIds: cart.items.map((it) => it.giftId),
        buyer: {
          name: name.trim(),
          email: email.trim(),
          cpf: cpf.replace(/\D/g, ""),
          phone: phone.replace(/\D/g, "") || undefined,
          message: message.trim() || undefined,
        },
        paymentMethod,
      });
      setRedirecting(true);
      router.replace(`/checkout/${result.paymentId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível iniciar o pagamento."
      );
      setIsPending(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-[5vw] md:px-[8vw]">
      <section className="mb-12">
        <Button
          variant="ghost"
          onClick={() => router.push("/presentes")}
          className="gap-2 hover:bg-transparent hover:text-[hsl(var(--primary))] -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="meta-label">Voltar para a lista</span>
        </Button>
        <MetaLabel className="mt-6 mb-4">Checkout</MetaLabel>
        <h1
          className="font-display italic leading-[0.9] text-[hsl(var(--foreground))]"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 6rem)",
            letterSpacing: "-0.04em",
          }}
        >
          Finalizar
          <br />
          presente
        </h1>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16">
        <aside className="lg:order-2">
          <div className="border border-[hsl(var(--border))] bg-background/60 p-6 md:p-8 sticky top-28">
            <MetaLabel className="mb-4">Resumo</MetaLabel>
            <ul className="divide-y divide-[hsl(var(--border))] -mx-2">
              {cart.items.map((it) => (
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
                    R$ {formatBRL(it.preco)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[hsl(var(--border))] mt-2 pt-5 flex items-baseline justify-between">
              <span className="meta-label">Total</span>
              <span className="font-mono text-2xl text-[hsl(var(--primary))]">
                R$ {formatBRL(cart.total)}
              </span>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="lg:order-1 space-y-8">
          <section className="space-y-5">
            <MetaLabel>Seus dados</MetaLabel>
            <div>
              <Label htmlFor="name" className="meta-label block mb-2">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="email" className="meta-label block mb-2">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl"
                />
              </div>
              <div>
                <Label htmlFor="cpf" className="meta-label block mb-2">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="meta-label block mb-2">
                Telefone (opcional)
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="w-full bg-transparent border-0 border-b border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-0 py-3 h-auto font-display italic text-xl"
              />
            </div>
            <div>
              <Label htmlFor="message" className="meta-label block mb-2">
                Recado para os noivos (opcional)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full bg-transparent border border-[hsl(var(--border))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 shadow-none rounded-none px-4 py-3"
              />
            </div>
          </section>

          <section className="space-y-4">
            <MetaLabel>Forma de pagamento</MetaLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("PIX")}
                aria-pressed={paymentMethod === "PIX"}
                className={`text-left p-5 border transition-colors ${
                  paymentMethod === "PIX"
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--foreground))]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-5 h-5 text-[hsl(var(--primary))]" />
                  <span className="meta-label text-[hsl(var(--foreground))]">PIX</span>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                  Pagamento instantâneo com QR Code ou copia e cola.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CREDIT_CARD")}
                aria-pressed={paymentMethod === "CREDIT_CARD"}
                className={`text-left p-5 border transition-colors ${
                  paymentMethod === "CREDIT_CARD"
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--foreground))]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[hsl(var(--primary))]" />
                  <span className="meta-label text-[hsl(var(--foreground))]">
                    Cartão de crédito
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                  Você será direcionado para a página segura do Asaas.
                </p>
              </button>
            </div>
          </section>

          {error && (
            <p className="text-sm text-[hsl(var(--destructive))] border-l-2 border-[hsl(var(--destructive))] pl-4">
              {error}
            </p>
          )}

          <div className="pt-6 border-t border-[hsl(var(--border))] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md">
              Os presentes ficam reservados por 30 minutos enquanto você
              finaliza o pagamento.
            </p>
            <Button
              type="submit"
              disabled={isPending}
              className="group gap-3 rounded-none border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-transparent hover:text-[hsl(var(--primary))] h-auto px-8 py-5"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span className="meta-label text-[hsl(var(--primary-foreground))] group-hover:text-[hsl(var(--primary))]">
                {isPending ? "Gerando cobrança..." : "Continuar para pagamento"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
