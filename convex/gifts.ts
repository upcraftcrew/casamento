import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { giftStatus } from "./schema";
import { requireAdmin } from "./lib/admin";

const giftObject = v.object({
  _id: v.id("gifts"),
  _creationTime: v.number(),
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
});

export const listPublic = query({
  args: {},
  returns: v.array(giftObject),
  handler: async (ctx) => {
    const gifts = await ctx.db
      .query("gifts")
      .withIndex("by_order")
      .order("asc")
      .collect();
    return gifts;
  },
});

export const listAdmin = query({
  args: {},
  returns: v.array(giftObject),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const gifts = await ctx.db
      .query("gifts")
      .withIndex("by_order")
      .order("asc")
      .collect();
    return gifts;
  },
});

export const create = mutation({
  args: {
    categoria: v.string(),
    titulo: v.string(),
    descricao: v.string(),
    loja: v.string(),
    url: v.string(),
    preco: v.optional(v.number()),
    imagem: v.optional(v.string()),
    status: v.optional(giftStatus),
    order: v.optional(v.number()),
  },
  returns: v.id("gifts"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const categoria = args.categoria.trim();
    const titulo = args.titulo.trim();
    if (!categoria || !titulo) {
      throw new Error("Categoria e título são obrigatórios.");
    }
    const all = await ctx.db.query("gifts").collect();
    const nextOrder =
      args.order ??
      (all.length === 0 ? 0 : Math.max(...all.map((g) => g.order)) + 1);
    return await ctx.db.insert("gifts", {
      categoria,
      titulo,
      descricao: args.descricao.trim(),
      loja: args.loja.trim(),
      url: args.url.trim(),
      preco: args.preco,
      imagem: args.imagem?.trim() || undefined,
      status: args.status ?? "disponivel",
      order: nextOrder,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("gifts"),
    categoria: v.optional(v.string()),
    titulo: v.optional(v.string()),
    descricao: v.optional(v.string()),
    loja: v.optional(v.string()),
    url: v.optional(v.string()),
    preco: v.optional(v.number()),
    imagem: v.optional(v.string()),
    status: v.optional(giftStatus),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Presente não encontrado.");
    const patch: Record<string, unknown> = {};
    if (rest.categoria !== undefined) patch.categoria = rest.categoria.trim();
    if (rest.titulo !== undefined) patch.titulo = rest.titulo.trim();
    if (rest.descricao !== undefined) patch.descricao = rest.descricao.trim();
    if (rest.loja !== undefined) patch.loja = rest.loja.trim();
    if (rest.url !== undefined) patch.url = rest.url.trim();
    if (rest.preco !== undefined) patch.preco = rest.preco;
    if (rest.imagem !== undefined) patch.imagem = rest.imagem;
    if (rest.status !== undefined) patch.status = rest.status;
    if (rest.order !== undefined) patch.order = rest.order;
    await ctx.db.patch(id, patch);
    return null;
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("gifts"),
    status: giftStatus,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Presente não encontrado.");
    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("gifts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_gift", (q) => q.eq("giftId", args.id))
      .collect();
    for (const it of items) {
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
    disponivel: v.number(),
    reservado: v.number(),
    pago: v.number(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("gifts").collect();
    return {
      total: all.length,
      disponivel: all.filter((g) => g.status === "disponivel").length,
      reservado: all.filter((g) => g.status === "reservado").length,
      pago: all.filter((g) => g.status === "pago").length,
    };
  },
});
