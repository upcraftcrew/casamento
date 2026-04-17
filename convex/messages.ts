import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      name: v.string(),
      message: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    message: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const message = args.message.trim();
    if (name.length === 0 || message.length === 0) {
      throw new Error("Nome e mensagem são obrigatórios.");
    }
    return await ctx.db.insert("messages", {
      name,
      message,
      createdAt: Date.now(),
    });
  },
});
