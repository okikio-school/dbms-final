"use server";

import { db } from "@/db/db"
import { users, posts, postReads, contentVersions } from "@/db/schema"
import { desc, eq, gt, sql } from "drizzle-orm";
//import { PostgresJsPreparedQuery } from "drizzle-orm/postgres-js";
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


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// retrieves relevant posts for a specific user
export const getRelevantPosts = async (userId: string) => {
  const relevantPostsQuery = sql<{
    followerId: string;
    postId: string;
    title: string;
    followedId: string;
    followedName: string;
    followType: string;
  }>`
    SELECT f.follower_id, p.post_id, p.title, t.tag_id AS followed_id, 
    t.name AS followed_name, f.type AS follow_type
    FROM posts p, tagstoposts tp, tags t
    JOIN follows f ON f.entity_id = t.tag_id
    WHERE p.post_id = tp.post_id AND tp.tag_id = t.tag_id AND f.type = 'tag' AND f.follower_id = ${userId}
    UNION 
    SELECT f.follower_id, p.post_id, p.title, u.user_id AS followed_id, 
    u.name AS followed_name, f.type AS follow_type
    FROM posts p, users u
    JOIN follows f ON f.entity_id = u.user_id
    WHERE p.userid = u.user_id AND f.type = 'user' AND f.follower_id = ${userId}`;

  const relevantPosts = await db.select(relevantPostsQuery);
  return relevantPosts;
};


// get posts for For You page
export const getForYouPageData = async (userId: string) => {
  try {

    const userData = await getUsers();

    const relevantPosts = await getRelevantPosts(userId);

    const topPosts = await getTopPosts();

    const featuredPosts = await getFeaturedPosts();

    return {
      user: userData,
      relevantPosts,
      topPosts,
      featuredPosts,
    };

  } catch (error) {
    console.error("Error fetching data for For You page:", error);
    throw error;
  }
};
