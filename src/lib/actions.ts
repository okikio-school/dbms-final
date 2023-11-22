"use server";

import { db } from "@/db/db"
import { users, posts, postReads, contentVersions, postReadsRelations, follows, tags, tagsToPosts } from "@/db/schema"
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";
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
  date: posts.publishedDate,
  version: posts.version,
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
  version: posts.version
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
  date: posts.publishedDate,
  version: posts.version,
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


//relevant posts
export const getRelevantPosts = cache(async function getRelevantPosts(userId : string) {

  /*SELECT f.follower_id, p.post_id, p.title, t.tag_id AS followed_id, 
    t.name AS followed_name, f.type AS follow_type
    FROM posts p, tagstoposts tp, tags t
    JOIN follows f ON f.entity_id = t.tag_id
    WHERE p.post_id = tp.post_id AND tp.tag_id = t.tag_id AND f.type = 'tag' AND f.follower_id = ${userId}
    UNION 
    SELECT f.follower_id, p.post_id, p.title, u.user_id AS followed_id, 
    u.name AS followed_name, f.type AS follow_type
    FROM posts p, users u
    JOIN follows f ON f.entity_id = u.user_id
    WHERE p.userid = u.user_id AND f.type = 'user' AND f.follower_id = ${userId}`;*/

  const tagfollowsprep = db.select({
    follower: follows.followerId,
    postID: posts.postId,
    title: posts.title,
    followed: tags.tagId,
    name: tags.name,
    type: follows.type,
    author: users.name,
    version: posts.version,
    date: posts.publishedDate,
  }).from(posts)
    .innerJoin(tagsToPosts, eq(posts.postId, tagsToPosts.postId))
    .innerJoin(tags, eq(tags.tagId, tagsToPosts.tagId))
    .innerJoin(follows, eq(follows.entityId, tags.tagId))
    .innerJoin(users, eq(users.userId, posts.userId))
    .where(and(
      eq(follows.type, 'tag'),
      eq(follows.followerId, userId),
  ));

  const userfollowsprep = db.select({
    follower: follows.followerId,
    postID: posts.postId,
    title: posts.title,
    followed: users.userId,
    name: users.name,
    type: follows.type,
    author: users.name,
    version: posts.version,
    date: posts.publishedDate,
  }).from(posts)
    .innerJoin(users, eq(users.userId, posts.userId))
    .innerJoin(follows, eq(follows.entityId, users.userId))
    .where(and(
      eq(follows.type, 'tag'),
      eq(follows.followerId, userId),
  ));

  return await union(tagfollowsprep, userfollowsprep);
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
