import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paymentMethod, paymentStatus } from "./schema";
import { requireAdmin } from "./lib/admin";

const itemValidator = v.object({
  _id: v.id("purchaseItems"),
  giftId: v.id("gifts"),
  amount: v.number(),
  giftTituloSnapshot: v.string(),
  giftCategoriaSnapshot: v.string(),
});

const paymentAdminValidator = v.object({
  _id: v.id("payments"),
  _creationTime: v.number(),
  buyerName: v.string(),
  buyerEmail: v.optional(v.string()),
  buyerCpf: v.optional(v.string()),
  buyerPhone: v.optional(v.string()),
  buyerMessage: v.optional(v.string()),
  amount: v.number(),
  paymentMethod: paymentMethod,
  status: paymentStatus,
  asaasCustomerId: v.optional(v.string()),
  asaasPaymentId: v.optional(v.string()),
  invoiceUrl: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  paidAt: v.optional(v.number()),
  createdAt: v.number(),
  items: v.array(itemValidator),
});

export const listAdmin = query({
  args: {},
  returns: v.array(paymentAdminValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const payments = await ctx.db.query("payments").order("desc").collect();
    return await Promise.all(
      payments.map(async (p) => {
        const items = await ctx.db
          .query("purchaseItems")
          .withIndex("by_payment", (q) => q.eq("paymentId", p._id))
          .collect();
        return {
          _id: p._id,
          _creationTime: p._creationTime,
          buyerName: p.buyerName,
          buyerEmail: p.buyerEmail,
          buyerCpf: p.buyerCpf,
          buyerPhone: p.buyerPhone,
          buyerMessage: p.buyerMessage,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          status: p.status,
          asaasCustomerId: p.asaasCustomerId,
          asaasPaymentId: p.asaasPaymentId,
          invoiceUrl: p.invoiceUrl,
          expiresAt: p.expiresAt,
          paidAt: p.paidAt,
          createdAt: p.createdAt,
          items: items.map((it) => ({
            _id: it._id,
            giftId: it.giftId,
            amount: it.amount,
            giftTituloSnapshot: it.giftTituloSnapshot,
            giftCategoriaSnapshot: it.giftCategoriaSnapshot,
          })),
        };
      })
    );
  },
});

export const createManual = mutation({
  args: {
    giftId: v.id("gifts"),
    buyerName: v.string(),
    buyerEmail: v.optional(v.string()),
    amount: v.number(),
    status: v.optional(paymentStatus),
  },
  returns: v.id("payments"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const gift = await ctx.db.get(args.giftId);
    if (!gift) throw new Error("Presente não encontrado.");
    const name = args.buyerName.trim();
    if (!name) throw new Error("Nome do convidado é obrigatório.");
    if (args.amount < 0) throw new Error("Valor inválido.");

    const status = args.status ?? "pendente";
    const now = Date.now();

    const paymentId = await ctx.db.insert("payments", {
      buyerName: name,
      buyerEmail: args.buyerEmail?.trim() || undefined,
      amount: args.amount,
      paymentMethod: "MANUAL",
      status,
      createdAt: now,
      paidAt: status === "pago" ? now : undefined,
    });

    await ctx.db.insert("purchaseItems", {
      paymentId,
      giftId: args.giftId,
      amount: args.amount,
      giftTituloSnapshot: gift.titulo,
      giftCategoriaSnapshot: gift.categoria,
      createdAt: now,
    });

    if (status === "pago") {
      await ctx.db.patch(args.giftId, {
        status: "pago",
        reservedUntil: undefined,
        reservedByPaymentId: undefined,
      });
    }

    return paymentId;
  },
});

export const markPaid = mutation({
  args: { id: v.id("payments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const payment = await ctx.db.get(args.id);
    if (!payment) throw new Error("Pagamento não encontrado.");
    if (payment.status === "pago") return null;

    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.id))
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
    await ctx.db.patch(args.id, { status: "pago", paidAt: Date.now() });
    return null;
  },
});

export const cancel = mutation({
  args: { id: v.id("payments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const payment = await ctx.db.get(args.id);
    if (!payment) throw new Error("Pagamento não encontrado.");
    if (payment.status === "cancelado") return null;

    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.id))
      .collect();
    for (const it of items) {
      const gift = await ctx.db.get(it.giftId);
      if (
        gift &&
        gift.status === "reservado" &&
        gift.reservedByPaymentId === args.id
      ) {
        await ctx.db.patch(gift._id, {
          status: "disponivel",
          reservedUntil: undefined,
          reservedByPaymentId: undefined,
        });
      }
    }
    await ctx.db.patch(args.id, { status: "cancelado" });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("payments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const payment = await ctx.db.get(args.id);
    if (!payment) return null;

    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.id))
      .collect();
    for (const it of items) {
      const gift = await ctx.db.get(it.giftId);
      if (
        gift &&
        gift.status === "reservado" &&
        gift.reservedByPaymentId === args.id
      ) {
        await ctx.db.patch(gift._id, {
          status: "disponivel",
          reservedUntil: undefined,
          reservedByPaymentId: undefined,
        });
      }
      await ctx.db.delete(it._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const stats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    pendente: v.number(),
    pago: v.number(),
    cancelado: v.number(),
    expirado: v.number(),
    totalArrecadado: v.number(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("payments").collect();
    return {
      total: all.length,
      pendente: all.filter((p) => p.status === "pendente").length,
      pago: all.filter((p) => p.status === "pago").length,
      cancelado: all.filter((p) => p.status === "cancelado").length,
      expirado: all.filter((p) => p.status === "expirado").length,
      totalArrecadado: all
        .filter((p) => p.status === "pago")
        .reduce((sum, p) => sum + p.amount, 0),
    };
  },
});
