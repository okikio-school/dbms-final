import { db } from "@/db/db";
import { users, accounts } from "@/db/schema";
import { eq, and, exists, not } from "drizzle-orm";
import { verifyKey } from "./passwords";

/**
 * Authenticates a user based on email and password.
 *
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user data if authentication is successful, otherwise null or an error.
 */
export async function authenticate(
  email: string,
  password: string
): Promise<typeof users.$inferSelect | null> {
  try {
    if (!email || !password) {
      return null;
    }

    // Step 1: Retrieve the user by email
    const usersList = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();

    if (!usersList || usersList.length === 0) {
      // No user found with the given email
      throw new Error("No user found with the email given.");
    }

    if (usersList.length > 1) {
      // More than one user found for the email, indicating a data integrity issue
      throw new Error("Multiple users found for the given email.");
    }

    const user = usersList[0];
    
    // Step 2: Retrieve the associated account details
    const accountsList = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, user.userId),
          eq(accounts.provider, "credentials"),
        )
      )
      .execute();


    if (!accountsList || accountsList.length === 0) {
      throw new Error("Account not found");
    }

    // Step 3: Verify the password
    for (const account of accountsList) {
      if (account.provider === 'credentials' && account.password) {
        // Verify the password for this account
        const isVerified = await verifyKey(password, account.password);
        if (isVerified) {
          // Password is correct, return the user data
          return user;
        }
      }
    }

    throw new Error("Invalid email and/or password");
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}
