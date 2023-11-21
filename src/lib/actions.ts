"use server";

import { db } from "@/db/db"
import { users, posts, postReads, contentVersions, accounts } from "@/db/schema"
import { desc, eq, gt, sql } from "drizzle-orm";

import { generateKey } from "./passwords";
import { cache } from "react";

//================================= PREP =====================================================

//all users
const usersprep = db.select().from(users).orderBy(users.userId).prepare("list_users");

//all posts
const postsprep = db.select({
  id: posts.postId, 
  title: posts.title, 
  author: users.name, 
  date: posts.publishedDate
}).from(posts)
  .leftJoin(users, eq(posts.userId, users.userId))
  .orderBy(desc(posts.publishedDate))
  .prepare("list_posts");

//top posts
const reads = sql<number>`cast(count(${postReads.postId}) as int)`;
const toppostsprep = db.select({
  id: posts.postId, 
  title: posts.title, 
  author: users.name, 
  date: posts.publishedDate, 
  reads: reads,
}).from(posts)
  .leftJoin(postReads, eq(posts.postId, postReads.postId))
  .leftJoin(users, eq(users.userId, posts.userId))
  .groupBy(posts.postId, posts.title, users.name, posts.publishedDate)
  .having(gt(reads, 0))
  .orderBy(desc(reads))
  .prepare("list_top_posts");

//featured posts
const featuredpostsprep = db.select({
  id: posts.postId,
  title: posts.title,
  author: users.name,
  date: posts.publishedDate
})
.from(posts)
.leftJoin(users, eq(users.userId, posts.userId))
.leftJoin(contentVersions, eq(contentVersions.postId, posts.postId))
.where(eq(contentVersions.isFeatured, true))
.orderBy(desc(posts.publishedDate))

//================================================================================================================

//all users
export const getUsers = cache(async function getUsers() {
  return await usersprep.execute();
})
export const updateUserData = cache(async function setUserData(userId: typeof users.$inferInsert.userId, { name, bio }: typeof users.$inferInsert) {
  return await db.update(users)
  .set({ name, bio })
  .where(eq(users.userId, userId!));
})

//top posts
export const getTopPosts = cache(async function getTopPosts() {
  return await toppostsprep.execute();
})

//featured posts
export const getFeaturedPosts = cache(async function getFeaturedPosts() {
  return await featuredpostsprep.execute();
})

//all posts
export const getPosts = cache(async function getPosts() {
  return await postsprep.execute();
})

export const signUp = async function signUp({ name, email, password }: { name: string, email: string, password: string }) {
  const result = await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({        
      userId: crypto.randomUUID(),
      name,
      email,
      bio: "Description...",
      image: "",
    }).returning();

    const [account] = await tx.insert(accounts).values({
      userId: user.userId,
    
      // Future proofing our implmentation
      type: "email",
      provider: "credentials",
      providerAccountId: user.userId,
  
      // The password field stores the base64-encoded string representing the hashed and salted password.
      password: await generateKey(password, 1_000_000),
    }).returning();

    return account;
  })

  return result
}