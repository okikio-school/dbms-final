"use server";

import { db } from "@/db/db"
import { users, posts, postReads, contentVersions, follows, tags, tagsToPosts, accounts, verificationTokens } from "@/db/schema"
import { and, desc, eq, gt, lte, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";
import { cache } from "react";
import { NotifyResetEmail, ResetEmail } from "@/components/email/email";
import { NEXTAUTH_URL } from "@/env";
import { sendMail } from "./mail";
import { generateKey } from "./passwords";


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
      eq(follows.type, 'user'),
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

//list versions
export const getMyVersions = cache(async function getMyVersions({userId, postId} : {userId:string, postId : string}) {
  const myversionsprep = db.select({
    title: posts.title,
    id: contentVersions.versionId,
  }).from(contentVersions).innerJoin(posts, eq(posts.postId, contentVersions.postId)).where(and(eq(posts.userId, userId), eq(contentVersions.postId, postId))).orderBy(desc(contentVersions.updateAt));
  return await myversionsprep.execute();
})

//==================== AUTH ACTIONS ===========================

//sign up
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

//reset password
export const resetPassword = async function resetPassword({ email }: { email: string }) {
  try {
    if (!email) {
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

    const uuidToken = crypto.randomUUID();
    const [verificationToken] = await db.transaction(async (tx) => {
      const tokenList = await tx.select()
        .from(verificationTokens)
        .where(eq(verificationTokens.identifier, user.email))
        .execute();

      if (tokenList.length > 0) {
        for (const token of tokenList) {
          await tx.delete(verificationTokens).where(eq(verificationTokens.identifier, token.identifier))
        }
      }

      return await tx
        .insert(verificationTokens)
        .values({
          identifier: user.email,
          token: uuidToken,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        })
        .returning();
    })

    if (!verificationToken) {
      throw new Error("Error creating reset password token");
    }

    // Link send to user's email for resetting
    const link = `${NEXTAUTH_URL}/reset-password/${uuidToken}`;
    await sendMail(
      {
        to: user.email,
        subject: 'Reset Password',
        text: 'Reset Password Messsage',
      },
      ResetEmail({ url: link })
    )

    return { seccuess: true, message: 'Reset password link was sent to your email' };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

//update password
export const updatePassword = async function updatePassword({ password, tokenId }: { password: string, tokenId: string }) {
  try {
    if (!password || !tokenId) {
      return null;
    }

    const verificationTokenLists = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, tokenId),
          lte(verificationTokens.expires, new Date())
        )
      )
      .execute();

    if (!verificationTokenLists || verificationTokenLists.length === 0) {
      throw new Error("Invalid or expired password reset token");
    }

    const verificationToken = verificationTokenLists[0];

    // Step 1: Retrieve the user by email
    const usersList = await db
      .select()
      .from(users)
      .where(
        eq(users.email, verificationToken.identifier)
      )
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

    await db.transaction(async (tx) => {
      // Step 2: Retrieve the associated account details
      const accountsList = await tx
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

      const hashedPassword = await generateKey(password, 1_000_000);

      const [account] = await tx.update(accounts)
        .set({ password: hashedPassword })
        .where(
          and(
            eq(accounts.userId, user.userId),
            eq(accounts.provider, "credentials"),
          )
        )
        .returning();

      if (!account) {
        throw new Error("Error reseting password");
      }

      await sendMail(
        {
          to: user.email,
          subject: 'Password reset successufly',
          html: 'Password is successfuly reset',
        },
        NotifyResetEmail()
      )

      // Delete token so it won't be used twice
      const deleteTokenLists = await tx
        .delete(verificationTokens)
        .where(eq(verificationTokens.token, tokenId))
        .returning();

      if (!deleteTokenLists || deleteTokenLists.length === 0) {
        throw new Error("Error deleting reset password token");
      }

      return deleteTokenLists;
    });

    return { seccuess: true, message: 'Password is reset successfuly' };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}


interface NewPost {
  title: string,
  description?: string,
  content: string,
  publishedStatus: boolean,
  isFeatured: boolean,
  metadata?: {
    title: string,
    description?: string,
  },
  type: 'post' | 'page',
  publishedDate: string,
  updatedDate: string,
  userId: string,
}

export const newPost = async function newPost({ userId, title, type, content, publishedStatus, publishedDate, updatedDate, isFeatured }: NewPost) {
  try { 
    return await db.transaction(async (tx) => {
      const postId = crypto.randomUUID();
      const [post] = await tx.insert(posts).values({
        postId,
        userId,
        title,
        publishedDate: new Date(publishedDate),
        version: 1,
      }).returning();

      const [contentVersion] = await tx
        .insert(contentVersions)
        .values({
          postId: post.postId,
          versionId: post.version!,
          content: {
            markdown: content,
          },
          updateAt: new Date(updatedDate),
          isFeatured,
          publishedStatus,
          type,
        }).returning();

      // for (const tag of tags) {
      //   const [tagList] = await tx.select().from(tags).where(eq(tags.name, tag)).execute();
      //   let tagId = '';
      //   if (tagList) {
      //     tagId = tagList.tagId;
      //   } else {
      //     const [tag] = await tx.insert(tags).values({
      //       tagId: crypto.randomUUID(),
      //       name: tag,
      //     }).returning();
      //     tagId = tag.tagId;
      //   }

      //   await tx.insert(tagsToPosts).values({
      //     tagId,
      //     postId: post.postId,
      //   }).returning();
      // }

      return post;
    })
  } catch (e) { 
    console.warn(e)
  }
}

export const getPost = cache(async function getPost({ postId, versionId }: { postId: string, versionId: number }) {
  try { 
    const [post] = await db.select({
      id: posts.postId,
      title: posts.title,
      content: contentVersions.content,
      isFeatured: contentVersions.isFeatured,
      publishedStatus: contentVersions.publishedStatus,
      publishedDate: posts.publishedDate,
      updatedAt: contentVersions.updateAt,
      version: contentVersions.versionId,
      userId: posts.userId,
    })
      .from(posts)
      .leftJoin(contentVersions, and(
        eq(contentVersions.postId, posts.postId),
        eq(contentVersions.versionId, versionId)
      ))
      .where(and(
        eq(posts.postId, postId),
        eq(contentVersions.isFeatured, true),
        eq(contentVersions.publishedStatus, true)
      ))
      .execute();

    return post;
  } catch (e) { 
    console.warn(e)
  }
})

export const listPostVersions = cache(async function listPostVersions({ postId }: { postId: string }) {
  try { 
      const versions = await db.select({
        version: contentVersions.versionId,
        updatedAt: contentVersions.updateAt,
      })
        .from(contentVersions)
        .where(eq(contentVersions.postId, postId))
        .orderBy(desc(contentVersions.updateAt))
        .execute();

    return versions;
  } catch (e) { 
    console.warn(e)
  }
})