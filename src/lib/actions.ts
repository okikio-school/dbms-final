"use server";

import { db } from "@/db/db"
import { users, posts, postReads, contentVersions, postReadsRelations } from "@/db/schema"
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { PostgresJsPreparedQuery } from "drizzle-orm/postgres-js";
import { cache } from "react";
import { NotifyResetEmail, ResetEmail } from "@/components/email/email";
import { Html } from "@react-email/html";

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
