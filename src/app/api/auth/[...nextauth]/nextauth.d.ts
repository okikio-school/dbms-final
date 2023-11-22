import NextAuth from "next-auth"
import type { User as OldUser } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id?: string
    }
  }

  interface User extends OldUser {
    userId?: string
  }
}