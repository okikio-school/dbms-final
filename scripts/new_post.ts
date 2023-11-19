import { db, sql } from "@/db/db.ts";
import { posts } from "@/db/schema";
import { argv } from "process";

export async function NewPost(userID : string, title : string) {
    const postID = crypto.randomUUID()
    await db.transaction(async (tx) => {
        const [post] = await tx.insert(posts).values({
        postId: postID,
        title: title,
        userId: userID,
        publishedDate: new Date(),
        }).returning();
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