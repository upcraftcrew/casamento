import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const giftStatus = v.union(
  v.literal("disponivel"),
  v.literal("reservado"),
  v.literal("pago")
);

export const paymentStatus = v.union(
  v.literal("pendente"),
  v.literal("pago"),
  v.literal("cancelado"),
  v.literal("expirado")
);

export const paymentMethod = v.union(
  v.literal("PIX"),
  v.literal("CREDIT_CARD"),
  v.literal("MANUAL")
);

export default defineSchema({
  users: defineTable({
    email: v.string(),
    clerkUserId: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clerkUserId", ["clerkUserId"]),

  messages: defineTable({
    name: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  gifts: defineTable({
    categoria: v.string(),
    titulo: v.string(),
    descricao: v.string(),
    loja: v.string(),
    url: v.string(),
    preco: v.optional(v.number()),
    imagem: v.optional(v.string()),
    status: giftStatus,
    reservedUntil: v.optional(v.number()),
    reservedByPaymentId: v.optional(v.id("payments")),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_categoria", ["categoria"])
    .index("by_status", ["status"])
    .index("by_order", ["order"]),

  payments: defineTable({
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
    pixEncodedImage: v.optional(v.string()),
    pixPayload: v.optional(v.string()),
    pixExpirationDate: v.optional(v.string()),
    invoiceUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_asaasPaymentId", ["asaasPaymentId"])
    .index("by_expiresAt", ["expiresAt"]),

  purchaseItems: defineTable({
    paymentId: v.id("payments"),
    giftId: v.id("gifts"),
    amount: v.number(),
    giftTituloSnapshot: v.string(),
    giftCategoriaSnapshot: v.string(),
    createdAt: v.number(),
  })
    .index("by_payment", ["paymentId"])
    .index("by_gift", ["giftId"]),

  asaasWebhookEvents: defineTable({
    eventId: v.string(),
    event: v.string(),
    asaasPaymentId: v.optional(v.string()),
    receivedAt: v.number(),
  }).index("by_eventId", ["eventId"]),
});
