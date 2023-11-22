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

        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        // const res = await fetch("/your/endpoint", {
        //   method: 'POST',
        //   body: JSON.stringify(credentials),
        //   headers: { "Content-Type": "application/json" }
        // })
        // const user = await res.json()

        // // If no error and we have user data, return it
        // if (res.ok && user) {
        //   return user
        // }
        // // Return null if user data could not be retrieved
        // return null
        // Return user object on successful authentication
        // return { id: user.id + "", email: user.email };
      },
    }),
    // ...add more providers here
  ],
  callbacks: {

    async session({ session, token }) {
      // session.user.accessToken = token.accessToken;
      console.log({
        session, 
        token
      })

      return session;
    },
  }
};
