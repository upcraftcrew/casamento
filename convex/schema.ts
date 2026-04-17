import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    name: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
