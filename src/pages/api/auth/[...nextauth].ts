import { db } from "@/db/db";
import { users } from "@/db/schema";
import { verifyKey } from "@/lib/passwords";
import { eq } from "drizzle-orm";

import NextAuth, { type AuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github"

export interface AdapterUser extends Omit<User, "id"> {
  userId: string
  email: string
  emailVerified: Date | null
}

const adapter = {
  async createUser(data: Omit<AdapterUser, "id">) {
    const user = await db
      .insert(users)
      .values({ ...data, userId: crypto.randomUUID() })
      .returning();
    return user;
  },
  async getUser(data) {
    return await db
      .select()
      .from(users)
      .where(eq(users.userId, data))
      .then((res) => res[0] ?? null);
  },
  async getUserByEmail(data) {
    return await db
      .select()
      .from(users)
      .where(eq(users.email, data))
      .then((res) => res[0] ?? null);
  },
  async createSession(data) {
    return await db
      .insert(sessions)
      .values(data)
      .returning()
      .then((res) => res[0]);
  },
  async getSessionAndUser(data) {
    return await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .where(eq(sessions.sessionToken, data))
      .innerJoin(users, eq(users.id, sessions.userId))
      .then((res) => res[0] ?? null);
  },
  async updateUser(data) {
    if (!data.id) {
      throw new Error("No user id.");
    }

    return await db
      .update(users)
      .set(data)
      .where(eq(users.id, data.id))
      .returning()
      .then((res) => res[0]);
  },
  async updateSession(data) {
    return await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.sessionToken, data.sessionToken))
      .returning()
      .then((res) => res[0]);
  },
  async linkAccount(rawAccount) {
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
  async getUserByAccount(account) {
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
        .leftJoin(users, eq(accounts.userId, users.id))
        .then((res) => res[0])) ?? null;

    if (!dbAccount) {
      return null;
    }

    return dbAccount.user;
  },
  async deleteSession(sessionToken) {
    const session = await db
      .delete(sessions)
      .where(eq(sessions.sessionToken, sessionToken))
      .returning()
      .then((res) => res[0] ?? null);

    return session;
  },
  async createVerificationToken(token) {
    return await db
      .insert(verificationTokens)
      .values(token)
      .returning()
      .then((res) => res[0]);
  },
  async useVerificationToken(token) {
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
  async deleteUser(id) {
    await db
      .delete(users)
      .where(eq(users.id, id))
      .returning()
      .then((res) => res[0] ?? null);
  },
  async unlinkAccount(account) {
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

export const authOptions: AuthOptions = {
  adapter,
  // Configure one or more authentication providers
  providers: [
    // GitHubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // }),
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

export default NextAuth(authOptions);
