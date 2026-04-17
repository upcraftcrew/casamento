import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export type AdminIdentity = {
  tokenIdentifier: string;
  clerkUserId: string;
  email: string;
  name?: string;
};

export function getBootstrapAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function findUserByClerkId(
  ctx: QueryCtx | MutationCtx,
  clerkUserId: string
): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

export async function findUserByEmail(
  ctx: QueryCtx | MutationCtx,
  email: string
): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
    .unique();
}

/**
 * Verifica se o usuário autenticado está registrado na tabela `users`
 * (ou é um bootstrap admin via `ADMIN_EMAILS`). Se não estiver, nega acesso.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<AdminIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Não autenticado.");
  }
  const email = (identity.email ?? "").toLowerCase();
  const clerkUserId = identity.subject;

  const byClerk = await findUserByClerkId(ctx, clerkUserId);
  if (byClerk) {
    return {
      tokenIdentifier: identity.tokenIdentifier,
      clerkUserId,
      email: byClerk.email,
      name: byClerk.name,
    };
  }

  if (email) {
    const byEmail = await findUserByEmail(ctx, email);
    if (byEmail) {
      return {
        tokenIdentifier: identity.tokenIdentifier,
        clerkUserId,
        email: byEmail.email,
        name: byEmail.name,
      };
    }
  }

  if (email && getBootstrapAdminEmails().includes(email)) {
    return {
      tokenIdentifier: identity.tokenIdentifier,
      clerkUserId,
      email,
      name: identity.name ?? undefined,
    };
  }

  throw new Error("Acesso negado.");
}
