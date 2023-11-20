"use server";

import { db } from "@/db/db"
import { users, posts, postReads, contentVersions, postReadsRelations } from "@/db/schema"
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { PostgresJsPreparedQuery } from "drizzle-orm/postgres-js";
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
}).from(posts)
  .leftJoin(users, eq(users.userId, posts.userId))
  .leftJoin(contentVersions, eq(contentVersions.postId, posts.postId))
  .where(eq(contentVersions.isFeatured, true))
  .orderBy(desc(posts.publishedDate));


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

//my posts
export const getMyPosts = cache(async function getMyPosts({userId} : {userId:string}) {
  const mypostsprep = db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.publishedDate));
  return await mypostsprep.execute();
})

//post content
export const getPostContent = cache(async function getPostContent(postID : string, versionID : number) {
  const postcontentprep = db.select({
    content: contentVersions.content,
    title: posts.title,
    author: users.name,
    published_date: posts.publishedDate,
    version: contentVersions.versionId,
  }).from(posts)
    .leftJoin(contentVersions, eq(contentVersions.postId, posts.postId))
    .leftJoin(users, eq(users.userId, posts.userId))
    .where(
      and(
        eq(posts.version, contentVersions.versionId),
        eq(posts.postId, postID),
        eq(contentVersions.versionId, versionID)
        )
    );
  return await postcontentprep.execute();
})