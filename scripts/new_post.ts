import { db, sql } from "@/db/db.ts";
import { contentVersions, posts } from "@/db/schema";
import { faker } from "@faker-js/faker";
import { timeStamp } from "console";
import { eq } from "drizzle-orm";
import { argv } from "process";
import { randomUUID } from "crypto";

export async function NewPost(userID : string, title : string) {
    const postID = randomUUID()
    await db.transaction(async (tx) => {
        const [post] = await tx.insert(posts).values({
        postId: postID,
        title: title,
        userId: userID,
        publishedDate: new Date(),
        }).returning();

        const [contentversion] = await tx.insert(contentVersions).values({
        postId: postID,
        type: "post",
        updateAt: new Date(),
        publishedStatus: false,
        isFeatured: false,
        content: { markdown: "# " + faker.lorem.words() + "\n" + faker.lorem.paragraphs() },
        }).returning({ id: contentVersions.versionId });
        
        await tx.update(posts)
            .set({ version: contentversion.id })
            .where(eq(posts.postId, postID));
    });
    return postID;
}

const main = async () => {

    if (argv.length != 4){
        console.log("Usage: pnpm carl:newpost <post-title> <user-id>\n");
        return 1;
    }

    console.log("Creating new post...");
    const postID = await NewPost(argv[3], argv[2]);
    console.log("New post created: " + postID);
    return 0;
};

(async () => {
    await main();
    await sql.end();
  })();