import { db, sql } from "@/db/db";
import { contentVersions, posts } from "@/db/schema";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { argv } from "process";

export async function NewVersion(postID : string) {
    let vid = 0;
    await db.transaction(async (tx) => {
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
        
        vid = contentversion.id;
    });
    return vid;
}

const main = async () => {

    if (argv.length != 3){
        console.log("Usage: pnpm carl:newversion <post-id>\n");
        return 1;
    }

    console.log("Creating new version for post " + argv[2] + "...");
    const versionID = await NewVersion(argv[2]);
    console.log("New version created: " + versionID);
    return 0;
};

(async () => {
    await main();
    await sql.end();
  })();