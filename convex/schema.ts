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
  v.literal("cancelado")
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
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_categoria", ["categoria"])
    .index("by_status", ["status"])
    .index("by_order", ["order"]),

  payments: defineTable({
    giftId: v.id("gifts"),
    guestName: v.string(),
    guestEmail: v.optional(v.string()),
    amount: v.number(),
    status: paymentStatus,
    asaasPaymentId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_gift", ["giftId"])
    .index("by_status", ["status"]),
});
