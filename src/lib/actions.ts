"use server";

import { db } from "@/db/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm";
import { cache } from "react";

const prepared = db.select().from(users).orderBy(users.userId).prepare("list_users");

// export const revalidate = 360;
export const getUsers = cache(async function getUsers() {
  return await prepared.execute();
})

export const updateUserData = cache(async function setUserData(userId: typeof users.$inferInsert.userId, { name, bio }: typeof users.$inferInsert) {
  return await db.update(users)
  .set({ name, bio })
  .where(eq(users.userId, userId!));
})