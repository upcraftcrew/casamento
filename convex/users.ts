import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  findUserByClerkId,
  findUserByEmail,
  getBootstrapAdminEmails,
  requireAdmin,
} from "./lib/admin";

const userObject = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  email: v.string(),
  clerkUserId: v.optional(v.string()),
  name: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

/**
 * Chamado pelo cliente após o login do Clerk.
 * - Se já existe linha com esse clerkUserId → atualiza metadados.
 * - Se existe linha com o mesmo e-mail (pré-cadastrado por um admin) → casa o clerkUserId.
 * - Se o e-mail está em ADMIN_EMAILS → cria registro novo.
 * - Caso contrário, retorna null (usuário não autorizado).
 */
export const ensureCurrent = mutation({
  args: {},
  returns: v.union(userObject, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkUserId = identity.subject;
    const email = (identity.email ?? "").toLowerCase();
    const fallbackName = [identity.givenName, identity.familyName]
      .filter(Boolean)
      .join(" ");
    const name = identity.name ?? (fallbackName || undefined);
    const imageUrl = identity.pictureUrl ?? undefined;
    const now = Date.now();

    const byClerk = await findUserByClerkId(ctx, clerkUserId);
    if (byClerk) {
      const patch: Record<string, unknown> = { updatedAt: now };
      if (email && byClerk.email !== email) patch.email = email;
      if (name !== undefined && byClerk.name !== name) patch.name = name;
      if (imageUrl !== undefined && byClerk.imageUrl !== imageUrl) {
        patch.imageUrl = imageUrl;
      }
      if (Object.keys(patch).length > 1) {
        await ctx.db.patch(byClerk._id, patch);
      }
      return await ctx.db.get(byClerk._id);
    }

    if (email) {
      const byEmail = await findUserByEmail(ctx, email);
      if (byEmail) {
        await ctx.db.patch(byEmail._id, {
          clerkUserId,
          name: name ?? byEmail.name,
          imageUrl: imageUrl ?? byEmail.imageUrl,
          updatedAt: now,
        });
        return await ctx.db.get(byEmail._id);
      }
    }

    if (email && getBootstrapAdminEmails().includes(email)) {
      const id = await ctx.db.insert("users", {
        email,
        clerkUserId,
        name,
        imageUrl,
        createdAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(id);
    }

    return null;
  },
});

export const current = query({
  args: {},
  returns: v.union(userObject, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const byClerk = await findUserByClerkId(ctx, identity.subject);
    if (byClerk) return byClerk;
    const email = (identity.email ?? "").toLowerCase();
    if (email) return await findUserByEmail(ctx, email);
    return null;
  },
});

export const listAdmin = query({
  args: {},
  returns: v.array(userObject),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").order("desc").collect();
  },
});

export const inviteByEmail = mutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const email = args.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      throw new Error("E-mail inválido.");
    }
    const existing = await findUserByEmail(ctx, email);
    if (existing) {
      throw new Error("Este e-mail já tem acesso.");
    }
    const now = Date.now();
    return await ctx.db.insert("users", {
      email,
      name: args.name?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const target = await ctx.db.get(args.id);
    if (!target) throw new Error("Usuário não encontrado.");

    if (target.clerkUserId && target.clerkUserId === admin.clerkUserId) {
      throw new Error("Você não pode excluir a si mesmo.");
    }

    const all = await ctx.db.query("users").collect();
    if (all.length <= 1) {
      throw new Error("Mantenha pelo menos um administrador.");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

export const stats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    ativos: v.number(),
    pendentes: v.number(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("users").collect();
    return {
      total: all.length,
      ativos: all.filter((u) => !!u.clerkUserId).length,
      pendentes: all.filter((u) => !u.clerkUserId).length,
    };
  },
});
