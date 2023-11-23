import type { AuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github"
import { adapter } from "./_adapter";

import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "@/env";
import { authenticate } from "@/lib/authenticate";

export const authOptions: Omit<AuthOptions, "adapter"> & { adapter: typeof adapter} = {
  adapter,
  // Configure one or more authentication providers
  providers: [
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID!,
      clientSecret: GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'credentials',
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        // Fetch user from the database
        const user = await authenticate(credentials.email, credentials.password);
        if (!user) return null;

        console.log({
          credentials,
          user
        })
        return { ...user, id: user.userId, email: user.email };
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (user) { 
        session.user.id = user.userId;
        session.user.bio = user.bio;
        session.user.image = user.image;
      }
      // console.log({
      //   session, 
      //   token,
      //   user
      // })

      return session;
    },
  }
};
