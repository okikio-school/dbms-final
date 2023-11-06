import { faker } from "@faker-js/faker";

import { assets, comments, contentVersions, follows, members, permissions, postAssets, postReads, posts, rolePermissions, roles, slugs, tags, tagsToPosts, userRoles, users } from "./schema.ts";
import { db, sql } from "./db.ts";
import { randomInt } from "crypto";
import { desc, eq } from "drizzle-orm";

const rolesData: (typeof roles.$inferInsert)[] = [
  {
    roleId: 0,
    name: "admin",
    description: "full access",
  },
  {
    roleId: 1,
    name: "content manager",
    description: "schedueles posts & works to ensure posts are out on time",
  },
  {
    roleId: 2,
    name: "editor",
    description: "reviews and publishes posts",
  },
  {
    roleId: 3,
    name: "author",
    description: "write posts",
  },
  {
    roleId: 4,
    name: "viewer",
    description: "employees with only read permissions"
  },
  {
    roleId: 5,
    name: "developer",
    description: "non-admin roles with lots of access for debugging, support, and fixing issues"
  }
];

const permissionsData: (typeof permissions.$inferInsert)[] = [
  {
    permissionId: 0,
    name: "post-read",
    description: "read access for only published posts and versions",
  },
  {
    permissionId: 1,
    name: "content-read",
    description: "read access for all posts and versions",
  },
  {
    permissionId: 2,
    name: "content-write",
    description: "write access to all posts and versions",
  },
  {
    permissionId: 3,
    name: "comments-read",
    description: "read access for comments",
  },
  {
    permissionId: 4,
    name: "comments-write",
    description: "write access for comments",
  },
  {
    permissionId: 5,
    name: "users-read",
    description: "read access to total list of users & members",
  },
  {
    permissionId: 6,
    name: "users-write",
    description: "write access to users & members; e.g. add new users & edit user details",
  },
  {
    permissionId: 7,
    name: "publish",
    description: "permission to publish post",
  },
];

const rolesToPermissionsData: (typeof rolePermissions.$inferInsert)[] = [
  {roleId: 0, permissionId: 0,},
  {roleId: 0, permissionId: 1,},
  {roleId: 0, permissionId: 2,},
  {roleId: 0, permissionId: 3,},
  {roleId: 0, permissionId: 4,},
  {roleId: 0, permissionId: 5,},
  {roleId: 0, permissionId: 6,},
  {roleId: 0, permissionId: 7,},

  {roleId: 1, permissionId: 0,},
  {roleId: 1, permissionId: 1,},
  {roleId: 1, permissionId: 3,},
  {roleId: 1, permissionId: 5,},
  {roleId: 1, permissionId: 6,},
  {roleId: 1, permissionId: 7,},

  {roleId: 2, permissionId: 0,},
  {roleId: 2, permissionId: 1,},
  {roleId: 2, permissionId: 2,},
  {roleId: 2, permissionId: 3,},
  {roleId: 2, permissionId: 4,},
  {roleId: 2, permissionId: 7,},

  {roleId: 3, permissionId: 0,},
  {roleId: 3, permissionId: 1,},
  {roleId: 3, permissionId: 2,},
  {roleId: 3, permissionId: 3,},
  {roleId: 3, permissionId: 4,},

  {roleId: 4, permissionId: 0,},
  {roleId: 4, permissionId: 3,},

  {roleId: 5, permissionId: 0,},
  {roleId: 5, permissionId: 1,},
  {roleId: 5, permissionId: 2,},
  {roleId: 5, permissionId: 3,},
  {roleId: 5, permissionId: 5,},
  {roleId: 5, permissionId: 6,},
];

const main = async () => {
  const usersData: (typeof users.$inferInsert)[] = [];
  
  for (let i = 0; i < 10; i++) {
    usersData.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      bio: faker.person.bio(),
      userId: i,
    });
  }

  const tagsdata: (typeof tags.$inferInsert)[] = [];
  for (let i = 0; i < 10; i++) {
    tagsdata.push({
      tagId: i,
      name: faker.company.buzzNoun(),
    })
  }

  const postsdata: (typeof posts.$inferInsert)[] = [];
  for (let i = 0; i < 6; i++) {
    postsdata.push({
      postId: i,
      title: faker.lorem.words(randomInt(1, 8)),
      userId: randomInt(0,10),
      publishedDate: new Date(),
    })
  }

  const versionsdata: (typeof contentVersions.$inferInsert)[] = [];
  for (let i = 0; i < 10; i++) {
    versionsdata.push({
      versionId: 0,
      postId: randomInt(0, 6),
      updateAt: new Date(),
      publishedStatus: Boolean(randomInt(0,2)),
      type: "post",
      isFeatured: Boolean(randomInt(0,2)),
      contentPath: faker.image.url(),
    });
  }

  const userrolesdata: (typeof userRoles.$inferInsert)[] = [];
  for (let i = 0; i < 10; i++) {
    userrolesdata.push({
      userId: i,
      roleId: randomInt(0, 6)
    })
  }

  const membersData: (typeof members.$inferInsert)[] = [];
  for (let i = 0; i < 10; i++) {
    membersData.push({
      name: faker.internet.displayName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      memberId: i,
    });
  }

  const followsData: (typeof follows.$inferInsert)[] = [];
  var typenumber;
  for (let i = 0; i < 12; i++) {
    typenumber = randomInt(0, 2);
    if (typenumber == 0) {
      // user follow
      followsData.push({
        followerId: randomInt(0, 10),
        type: "user",
        entityId: randomInt(0, 10),
        createdAt: new Date(),
      });
    } else {
      // tag follow
      followsData.push({
        followerId: randomInt(0, 10),
        type: "tag",
        entityId: randomInt(0, 6),
        createdAt: new Date(),
      });
    }
  }

  const tagstopostsdata: (typeof tagsToPosts.$inferInsert)[] = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 10; j++) {
      var bUse = Boolean(randomInt(0,2));
      if (bUse) {
        tagstopostsdata.push({
          postId: i,
          tagId: j
        });
      }
    }
  }

  const slugData: (typeof slugs.$inferInsert)[] = [];
  for (let i = 0; i < 10; i++) {
    const type = Math.random() > 0.5 ? "post" : "tag";
    slugData.push({
      slugId: i,
      slug: faker.lorem.slug(),
      type,
      entityId: 0
    })
  }

  const assetsData: (typeof assets.$inferInsert)[] = [];
  for (let i = 0 ; i < 10; i ++) {
    assetsData.push({
      type: "image",
      fileType: "image/jpeg",
      fileSize: "10",
      assetId: i,
      contentPath: "https://images.pexels.com/photos/18937801/pexels-photo-18937801/free-photo-of-wanna-play-football-or-drone.jpeg"
    })
  }

  const commentsData: (typeof comments.$inferInsert)[] = [];
  for (let i = 0; i < 10; i++) {
    commentsData.push({
      postId: i, // postData[i].postId!,
      memberId: membersData[i].memberId!,
      createdAt: new Date(),
      text: faker.lorem.paragraphs(),
      commentId: i,
      parentComment: i === 0 ? null : 0
    })
  }

  const postToAssetsData: (typeof postAssets.$inferInsert)[] = [];
  for (let i = 0; i < 10; i++) {
    postToAssetsData.push({
      postId: i, // postData[i].postId!,
      assetId: assetsData[i].assetId!,
    })
  }
  

  console.log("Seed start");
  await db.transaction(async (tx) => {
    await tx.insert(users).values(usersData);
    await tx.insert(members).values(membersData);
    await tx.insert(posts).values(postsdata);
    await tx.insert(contentVersions).values(versionsdata);
    await tx.insert(roles).values(rolesData);
    await tx.insert(permissions).values(permissionsData);
    await tx.insert(rolePermissions).values(rolesToPermissionsData);
    await tx.insert(userRoles).values(userrolesdata);
    await tx.insert(tags).values(tagsdata);
    await tx.insert(tagsToPosts).values(tagstopostsdata);
    await tx.insert(assets).values(assetsData);
    await tx.insert(follows).values(followsData);
    await tx.insert(postAssets).values(postToAssetsData);
    await tx.insert(comments).values(commentsData);
    await tx.insert(slugs).values(slugData);
  })
  await db.insert(postReads).values(await generatePostReadsData());
  console.log("Seed done");
};

(async () => {
  await main();
  await sql.end();
})();

//https://anasrin.vercel.app/blog/seeding-database-with-drizzle-orm/

async function generatePostReadsData() {
  const postreadsdata: (typeof postReads.$inferInsert)[] = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 10; j++) {
      var bUse = Boolean(randomInt(0,2));
      if (bUse) {
        var result = await db.select({
          id: contentVersions.versionId
        }).from(contentVersions).where(eq(contentVersions.postId, i)).orderBy(desc(contentVersions.updateAt));
        postreadsdata.push({
          postId: i,
          memberId: j,
          postVersion: result[0].id
        });
      }
    }
  }
  return postreadsdata;
}