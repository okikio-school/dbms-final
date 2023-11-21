import type { AdapterSession, VerificationToken } from "next-auth/adapters";
import type { Account, User } from "next-auth";

import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

import { DrizzleAdapter } from "@auth/drizzle-adapter"

export type CustomUser = Omit<User, "id"> & typeof users.$inferSelect;
export type CustomAccounts = Omit<Account, "id"> & typeof accounts.$inferSelect;

export interface AdapterUser extends CustomUser { }
export interface AdapterAccount extends CustomAccounts { }

export const adapter = {
  async createUser(data: Omit<AdapterUser, "id">) {
    const user = await db
      .insert(users)
      .values({ ...data, userId: crypto.randomUUID() })
      .returning()
      .then((res) => res[0] ?? null);

    if (user) {
      return { ...user, id: user.userId }
    }
    return user;
  },
  async getUser(data: string) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userId, data))
      .then((res) => res[0] ?? null);
    return user;
  },
  async getUserByEmail(data: string) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data))
      .then((res) => res[0] ?? null);
    return user;
  },
  async createSession(data: {
    sessionToken: string
    userId: string
    expires: Date
  }) {
    return await db
      .insert(sessions)
      .values(data)
      .returning()
      .then((res) => res[0]);
  },
  async getSessionAndUser(data: string) {
    return await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .where(eq(sessions.sessionToken, data))
      .innerJoin(users, eq(users.userId, sessions.userId))
      .then((res) => res[0] ?? null);
  },
  async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "userId">) {
    // @ts-ignore
    if (!data.userId && !data.id) {
      throw new Error("No user id.");
    }

    return await db
      .update(users)
      .set(data)
      // @ts-ignore
      .where(eq(users.userId, data.userId ?? data.id))
      .returning()
      .then((res) => res[0]);
  },
  async updateSession(data: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">) {
    return await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.sessionToken, data.sessionToken))
      .returning()
      .then((res) => res[0]);
  },
  async linkAccount(rawAccount: AdapterAccount) {
    const updatedAccount = await db
      .insert(accounts)
      .values(rawAccount)
      .returning()
      .then((res) => res[0]);

    // Drizzle will return `null` for fields that are not defined.
    // However, the return type is expecting `undefined`.
    const account = {
      ...updatedAccount,
      access_token: updatedAccount.access_token ?? undefined,
      token_type: updatedAccount.token_type ?? undefined,
      id_token: updatedAccount.id_token ?? undefined,
      refresh_token: updatedAccount.refresh_token ?? undefined,
      scope: updatedAccount.scope ?? undefined,
      expires_at: updatedAccount.expires_at ?? undefined,
      session_state: updatedAccount.session_state ?? undefined,
    };

    return account;
  },
  async getUserByAccount(account: Pick<AdapterAccount, "provider" | "providerAccountId">) {
    const dbAccount =
      (await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider)
          )
        )
        .leftJoin(users, eq(accounts.userId, users.userId))
        .then((res) => res[0])) ?? null;

    if (!dbAccount) {
      return null;
    }

    if (dbAccount.users) {
      const user = dbAccount.users;
      return { ...user, id: user.userId }
    }

    return dbAccount.users;
  },
  async deleteSession(sessionToken: string) {
    const session = await db
      .delete(sessions)
      .where(eq(sessions.sessionToken, sessionToken))
      .returning()
      .then((res) => res[0] ?? null);

    return session;
  },
  async createVerificationToken(token: VerificationToken) {
    return await db
      .insert(verificationTokens)
      .values(token)
      .returning()
      .then((res) => res[0]);
  },
  async useVerificationToken(token: {
    identifier: string
    token: string
  }) {
    try {
      return await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, token.identifier),
            eq(verificationTokens.token, token.token)
          )
        )
        .returning()
        .then((res) => res[0] ?? null);
    } catch (err) {
      throw new Error("No verification token found.");
    }
  },
  async deleteUser(userId: string) {
    await db
      .delete(users)
      .where(eq(users.userId, userId))
      .returning()
      .then((res) => res[0] ?? null);
  },
  async unlinkAccount(account: Pick<AdapterAccount, "provider" | "providerAccountId">) {
    const { type, provider, providerAccountId, userId } = await db
      .delete(accounts)
      .where(
        and(
          eq(accounts.providerAccountId, account.providerAccountId),
          eq(accounts.provider, account.provider)
        )
      )
      .returning()
      .then((res) => res[0] ?? null);

    return { provider, type, providerAccountId, userId, id: userId };
  },
}