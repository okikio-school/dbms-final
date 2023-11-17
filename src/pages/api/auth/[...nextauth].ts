import type { AdapterSession, VerificationToken } from "next-auth/adapters";
import type { Account, AuthOptions, User } from "next-auth";

import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { verifyKey } from "@/lib/passwords";

import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github"
import { Users2 } from "lucide-react";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "@/env";

export type CustomUser = Omit<User, "id"> & typeof users.$inferSelect;
export type CustomAccounts = Omit<Account, "id"> & typeof accounts.$inferSelect;

export interface AdapterUser extends CustomUser { }
export interface AdapterAccount extends CustomAccounts { }

const adapter = {
  async createUser(data: Omit<AdapterUser, "id">) {
    const userId = crypto.randomUUID();
    const user = await db
      .insert(users)
      .values({ ...data, userId: crypto.randomUUID() })
      .returning()
      .then((res) => res[0] ?? null);
    console.log({
      user
    })
    if (user) {
      return { ...user, id: userId }
    }
    return user;
  },
  async getUser(data: string) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userId, data))
      .then((res) => res[0] ?? null);
      console.log({
        getUser: user
      })
      return user;
  },
  async getUserByEmail(data: string) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data))
      .then((res) => res[0] ?? null);
      console.log({
        getUserByEmail: user
      })
      return user;
  },
  async createSession(data: {
    sessionToken: string
    userId: string
    expires: Date
  }) {
    console.log({
      session: data
    })
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
    console.log({
      updateUser: data
    })
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
    console.log({
      account: rawAccount
    })
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

    return { provider, type, providerAccountId, userId };
  },
}

export const authOptions: Omit<AuthOptions, "adapter"> & { adapter: typeof adapter} = {
  adapter,
  // Configure one or more authentication providers
  providers: [
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID!,
      clientSecret: GITHUB_CLIENT_SECRET!,
    }),
    // CredentialsProvider({
    //   // The name to display on the sign in form (e.g. 'Sign in with...')
    //   name: "Credentials",
    //   // The credentials is used to generate a suitable form on the sign in page.
    //   // You can specify whatever fields you are expecting to be submitted.
    //   // e.g. domain, username, password, 2FA token, etc.
    //   // You can pass any HTML attribute to the <input> tag through the object.
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials, req) {
    //     if (!credentials) return null;

    //     // Fetch user from the database
    //     const matchingUsers = await db
    //       .select({
    //         id: users.userId,
    //         email: users.email,
    //         password: users.password,
    //       })
    //       .from(users)
    //       .where(eq(users.email, credentials.email))
    //       .execute();

    //     if (!matchingUsers) {
    //       throw new Error("No user found with the email");
    //     }

    //     if (matchingUsers.length > 1) {
    //       throw new Error("Too many users found with the email");
    //     }

    //     // Verify the password
    //     const [user] = matchingUsers;
    //     const isValid = await verifyKey(credentials.password, user.password);
    //     if (!isValid) {
    //       throw new Error("Invalid password");
    //     }

    //     // You need to provide your own logic here that takes the credentials
    //     // submitted and returns either a object representing a user or value
    //     // that is false/null if the credentials are invalid.
    //     // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
    //     // You can also use the `req` object to obtain additional parameters
    //     // (i.e., the request IP address)
    //     // const res = await fetch("/your/endpoint", {
    //     //   method: 'POST',
    //     //   body: JSON.stringify(credentials),
    //     //   headers: { "Content-Type": "application/json" }
    //     // })
    //     // const user = await res.json()

    //     // // If no error and we have user data, return it
    //     // if (res.ok && user) {
    //     //   return user
    //     // }
    //     // // Return null if user data could not be retrieved
    //     // return null
    //     // Return user object on successful authentication
    //     return { id: user.id + "", email: user.email };
    //   },
    // }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions as unknown as AuthOptions);
