"use server";

import { db } from "@/db/db"
import { users, posts, postReads, contentVersions } from "@/db/schema"
import { desc, eq, sql } from "drizzle-orm";
import { cache } from "react";

//================================= PREP =====================================================

//all users
const usersprep = db.select().from(users).orderBy(users.userId).prepare("list_users");

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