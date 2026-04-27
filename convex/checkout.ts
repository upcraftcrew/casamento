import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { paymentMethod, paymentStatus } from "./schema";
import {
  createCustomer,
  createPayment,
  getPixQrCode,
  todayIsoDate,
} from "./lib/asaas";

const RESERVATION_MS = 30 * 60 * 1000;

const checkoutItemValidator = v.object({
  giftId: v.id("gifts"),
});

const buyerValidator = v.object({
  name: v.string(),
  email: v.string(),
  cpf: v.string(),
  phone: v.optional(v.string()),
  message: v.optional(v.string()),
});

function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

function isValidCpf(cpf: string): boolean {
  const c = cleanCpf(cpf);
  if (c.length !== 11) return false;
  if (/^(\d)\1+$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += parseInt(c[i]) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += parseInt(c[i]) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === parseInt(c[10]);
}

export const reserveGiftsAndCreatePayment = internalMutation({
  args: {
    items: v.array(checkoutItemValidator),
    buyer: buyerValidator,
    paymentMethod: v.union(v.literal("PIX"), v.literal("CREDIT_CARD")),
  },
  returns: v.object({
    paymentId: v.id("payments"),
    total: v.number(),
    items: v.array(
      v.object({
        giftId: v.id("gifts"),
        titulo: v.string(),
        categoria: v.string(),
        amount: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    if (args.items.length === 0) {
      throw new Error("Selecione pelo menos um presente.");
    }
    const seen = new Set<string>();
    for (const it of args.items) {
      if (seen.has(it.giftId)) {
        throw new Error("Itens duplicados no carrinho.");
      }
      seen.add(it.giftId);
    }

    const now = Date.now();
    const expiresAt = now + RESERVATION_MS;

    const fetched = await Promise.all(
      args.items.map((it) => ctx.db.get(it.giftId))
    );
    const gifts = fetched.map((g) => {
      if (!g) {
        throw new Error("Presente não encontrado. Atualize a página.");
      }
      const stillReserved =
        g.status === "reservado" &&
        typeof g.reservedUntil === "number" &&
        g.reservedUntil > now;
      if (g.status === "pago" || stillReserved) {
        throw new Error(
          `O presente "${g.titulo}" não está mais disponível.`
        );
      }
      if (typeof g.preco !== "number" || g.preco <= 0) {
        throw new Error(
          `O presente "${g.titulo}" não possui preço configurado.`
        );
      }
      return g;
    });

    const total = gifts.reduce((sum, g) => sum + (g.preco ?? 0), 0);

    const paymentId = await ctx.db.insert("payments", {
      buyerName: args.buyer.name.trim(),
      buyerEmail: args.buyer.email.trim().toLowerCase() || undefined,
      buyerCpf: cleanCpf(args.buyer.cpf),
      buyerPhone: args.buyer.phone?.replace(/\D/g, "") || undefined,
      buyerMessage: args.buyer.message?.trim() || undefined,
      amount: total,
      paymentMethod: args.paymentMethod,
      status: "pendente",
      expiresAt,
      createdAt: now,
    });

    for (const g of gifts) {
      await ctx.db.patch(g._id, {
        status: "reservado",
        reservedUntil: expiresAt,
        reservedByPaymentId: paymentId,
      });
      await ctx.db.insert("purchaseItems", {
        paymentId,
        giftId: g._id,
        amount: g.preco ?? 0,
        giftTituloSnapshot: g.titulo,
        giftCategoriaSnapshot: g.categoria,
        createdAt: now,
      });
    }

    return {
      paymentId,
      total,
      items: gifts.map((g) => ({
        giftId: g._id,
        titulo: g.titulo,
        categoria: g.categoria,
        amount: g.preco ?? 0,
      })),
    };
  },
});

export const updateAsaasInfo = internalMutation({
  args: {
    paymentId: v.id("payments"),
    asaasCustomerId: v.optional(v.string()),
    asaasPaymentId: v.optional(v.string()),
    pixEncodedImage: v.optional(v.string()),
    pixPayload: v.optional(v.string()),
    pixExpirationDate: v.optional(v.string()),
    invoiceUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { paymentId, ...rest } = args;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(paymentId, patch);
    return null;
  },
});

export const releaseReservation = internalMutation({
  args: { paymentId: v.id("payments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) return null;
    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.paymentId))
      .collect();
    for (const it of items) {
      const gift = await ctx.db.get(it.giftId);
      if (
        gift &&
        gift.status === "reservado" &&
        gift.reservedByPaymentId === args.paymentId
      ) {
        await ctx.db.patch(gift._id, {
          status: "disponivel",
          reservedUntil: undefined,
          reservedByPaymentId: undefined,
        });
      }
    }
    if (payment.status === "pendente") {
      await ctx.db.patch(args.paymentId, { status: "cancelado" });
    }
    return null;
  },
});

export const getPaymentForAction = internalQuery({
  args: { paymentId: v.id("payments") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("payments"),
      buyerName: v.string(),
      buyerEmail: v.optional(v.string()),
      buyerCpf: v.optional(v.string()),
      buyerPhone: v.optional(v.string()),
      amount: v.number(),
      paymentMethod: paymentMethod,
    })
  ),
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.paymentId);
    if (!p) return null;
    return {
      _id: p._id,
      buyerName: p.buyerName,
      buyerEmail: p.buyerEmail,
      buyerCpf: p.buyerCpf,
      buyerPhone: p.buyerPhone,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
    };
  },
});

export const createCheckout = action({
  args: {
    giftIds: v.array(v.id("gifts")),
    buyer: buyerValidator,
    paymentMethod: v.union(v.literal("PIX"), v.literal("CREDIT_CARD")),
  },
  returns: v.object({ paymentId: v.id("payments") }),
  handler: async (ctx, args) => {
    const name = args.buyer.name.trim();
    const email = args.buyer.email.trim();
    const cpf = cleanCpf(args.buyer.cpf);

    if (!name) throw new Error("Informe seu nome.");
    if (!email || !email.includes("@"))
      throw new Error("Informe um e-mail válido.");
    if (!isValidCpf(cpf)) throw new Error("CPF inválido.");

    const reservation: {
      paymentId: Id<"payments">;
      total: number;
      items: Array<{
        giftId: Id<"gifts">;
        titulo: string;
        categoria: string;
        amount: number;
      }>;
    } = await ctx.runMutation(
      internal.checkout.reserveGiftsAndCreatePayment,
      {
        items: args.giftIds.map((id) => ({ giftId: id })),
        buyer: { ...args.buyer, name, email, cpf },
        paymentMethod: args.paymentMethod,
      }
    );

    try {
      const customer = await createCustomer({
        name,
        email,
        cpfCnpj: cpf,
        phone: args.buyer.phone,
      });

      const description = `Presente de casamento Paloma & Rodrigo - ${reservation.items
        .map((i) => i.titulo)
        .join(", ")}`.slice(0, 480);

      const payment = await createPayment({
        customer: customer.id,
        billingType: args.paymentMethod,
        value: reservation.total,
        dueDate: todayIsoDate(),
        description,
        externalReference: reservation.paymentId,
      });

      let pixEncodedImage: string | undefined;
      let pixPayload: string | undefined;
      let pixExpirationDate: string | undefined;
      if (args.paymentMethod === "PIX") {
        const qr = await getPixQrCode(payment.id);
        pixEncodedImage = qr.encodedImage;
        pixPayload = qr.payload;
        pixExpirationDate = qr.expirationDate;
      }

      await ctx.runMutation(internal.checkout.updateAsaasInfo, {
        paymentId: reservation.paymentId,
        asaasCustomerId: customer.id,
        asaasPaymentId: payment.id,
        invoiceUrl: payment.invoiceUrl,
        pixEncodedImage,
        pixPayload,
        pixExpirationDate,
      });

      return { paymentId: reservation.paymentId };
    } catch (err) {
      await ctx.runMutation(internal.checkout.releaseReservation, {
        paymentId: reservation.paymentId,
      });
      throw err instanceof Error
        ? err
        : new Error("Falha ao criar cobrança no Asaas.");
    }
  },
});

const publicPaymentValidator = v.object({
  _id: v.id("payments"),
  status: paymentStatus,
  paymentMethod: paymentMethod,
  amount: v.number(),
  buyerName: v.string(),
  buyerMessage: v.optional(v.string()),
  pixEncodedImage: v.optional(v.string()),
  pixPayload: v.optional(v.string()),
  pixExpirationDate: v.optional(v.string()),
  invoiceUrl: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
  paidAt: v.optional(v.number()),
  items: v.array(
    v.object({
      giftId: v.id("gifts"),
      titulo: v.string(),
      categoria: v.string(),
      amount: v.number(),
    })
  ),
});

export const getPublic = query({
  args: { paymentId: v.id("payments") },
  returns: v.union(v.null(), publicPaymentValidator),
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.paymentId);
    if (!p) return null;
    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.paymentId))
      .collect();
    return {
      _id: p._id,
      status: p.status,
      paymentMethod: p.paymentMethod,
      amount: p.amount,
      buyerName: p.buyerName,
      buyerMessage: p.buyerMessage,
      pixEncodedImage: p.pixEncodedImage,
      pixPayload: p.pixPayload,
      pixExpirationDate: p.pixExpirationDate,
      invoiceUrl: p.invoiceUrl,
      expiresAt: p.expiresAt,
      createdAt: p.createdAt,
      paidAt: p.paidAt,
      items: items.map((it) => ({
        giftId: it.giftId,
        titulo: it.giftTituloSnapshot,
        categoria: it.giftCategoriaSnapshot,
        amount: it.amount,
      })),
    };
  },
});

export const expirePending = internalMutation({
  args: {},
  returns: v.object({ expired: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const pending = await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "pendente"))
      .collect();

    let expired = 0;
    for (const p of pending) {
      if (typeof p.expiresAt !== "number" || p.expiresAt > now) continue;
      const items = await ctx.db
        .query("purchaseItems")
        .withIndex("by_payment", (q) => q.eq("paymentId", p._id))
        .collect();
      for (const it of items) {
        const gift = await ctx.db.get(it.giftId);
        if (
          gift &&
          gift.status === "reservado" &&
          gift.reservedByPaymentId === p._id
        ) {
          await ctx.db.patch(gift._id, {
            status: "disponivel",
            reservedUntil: undefined,
            reservedByPaymentId: undefined,
          });
        }
      }
      await ctx.db.patch(p._id, { status: "expirado" });
      expired += 1;
    }
    return { expired };
  },
});

export const markPaidByAsaasId = internalMutation({
  args: {
    asaasPaymentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_asaasPaymentId", (q) =>
        q.eq("asaasPaymentId", args.asaasPaymentId)
      )
      .unique();
    if (!payment) return null;
    if (payment.status === "pago") return null;

    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_payment", (q) => q.eq("paymentId", payment._id))
      .collect();
    for (const it of items) {
      const gift = await ctx.db.get(it.giftId);
      if (gift) {
        await ctx.db.patch(gift._id, {
          status: "pago",
          reservedUntil: undefined,
          reservedByPaymentId: undefined,
        });
      }
    }
    await ctx.db.patch(payment._id, {
      status: "pago",
      paidAt: Date.now(),
    });
    return null;
  },
});

export const cancelByAsaasId = internalMutation({
  args: {
    asaasPaymentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_asaasPaymentId", (q) =>
        q.eq("asaasPaymentId", args.asaasPaymentId)
      )
      .unique();
    if (!payment) return null;
    if (payment.status === "pago" || payment.status === "cancelado")
      return null;

    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_payment", (q) => q.eq("paymentId", payment._id))
      .collect();
    for (const it of items) {
      const gift = await ctx.db.get(it.giftId);
      if (
        gift &&
        gift.status === "reservado" &&
        gift.reservedByPaymentId === payment._id
      ) {
        await ctx.db.patch(gift._id, {
          status: "disponivel",
          reservedUntil: undefined,
          reservedByPaymentId: undefined,
        });
      }
    }
    await ctx.db.patch(payment._id, { status: "cancelado" });
    return null;
  },
});

export const recordWebhookEvent = internalMutation({
  args: {
    eventId: v.string(),
    event: v.string(),
    asaasPaymentId: v.optional(v.string()),
  },
  returns: v.object({ duplicate: v.boolean() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("asaasWebhookEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();
    if (existing) return { duplicate: true };
    await ctx.db.insert("asaasWebhookEvents", {
      eventId: args.eventId,
      event: args.event,
      asaasPaymentId: args.asaasPaymentId,
      receivedAt: Date.now(),
    });
    return { duplicate: false };
  },
});
