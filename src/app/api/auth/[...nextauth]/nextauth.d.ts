import type { users } from "@/db/schema.ts"
import NextAuth from "next-auth"
import type { User as OldUser } from "next-auth"

declare module "next-auth" {
  type NewUser = typeof users.$inferSelect

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: NewUser["userId"] | null,
      name: NewUser["name"] | null,
      email: NewUser["email"] | null,
      image: NewUser["image"] | null,
      bio: NewUser["bio"] | null,
    } & NewUser
  }

  interface User extends NewUser {
    id: NewUser["userId"] | null,
    name: NewUser["name"] | null,
    email: NewUser["email"] | null,
    image: NewUser["image"] | null,
    bio: NewUser["bio"] | null,
  }
}