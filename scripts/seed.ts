// Inspired by https://anasrin.vercel.app/blog/seeding-database-with-drizzle-orm/
import { assets, comments, contentVersions, follows, members, permissions, postAssets, postReads, posts, rolePermissions, roles, slugs, tags, tagsToPosts, userRoles, users } from "../src/db/schema.ts";
import { faker } from "@faker-js/faker";

// Database and SQL utilities import
import { db, sql } from "@/db/db.ts";
import { randomInt } from "node:crypto";

// Define role data to be inserted into the 'roles' table
const rolesData: (typeof roles.$inferInsert)[] = [
  // Each object represents a role with its name and description
  {
    name: "admin",
    description: "full access",
  },
  {
    name: "content manager",
    description: "schedueles posts & works to ensure posts are out on time",
  },
  {
    name: "editor",
    description: "reviews and publishes posts",
  },
  {
    name: "author",
    description: "write posts",
  },
  {
    name: "viewer",
    description: "employees with only read permissions"
  },
  {
    name: "developer",
    description: "non-admin roles with lots of access for debugging, support, and fixing issues"
  }
];

// Define permission data for the 'permissions' table
const permissionsData: (typeof permissions.$inferInsert)[] = [
  // Each object here represents a permission
  {
    name: "post-read",
    description: "read access for only published posts and versions",
  },
  {
    name: "content-read",
    description: "read access for all posts and versions",
  },
  {
    name: "content-write",
    description: "write access to all posts and versions",
  },
  {
    name: "comments-read",
    description: "read access for comments",
  },
  {
    name: "comments-write",
    description: "write access for comments",
  },
  {
    name: "users-read",
    description: "read access to total list of users & members",
  },
  {
    name: "users-write",
    description: "write access to users & members; e.g. add new users & edit user details",
  },
  {
    name: "publish",
    description: "permission to publish post",
  },
];

// Define relationships between roles and permissions
const rolesToPermissionsIndexData = [
  // This represents that the first role has the first permission, and so on
  { roleIndex: 0, permissionIndex: 0 },
  { roleIndex: 0, permissionIndex: 1 },
  { roleIndex: 0, permissionIndex: 2 },
  { roleIndex: 0, permissionIndex: 3 },
  { roleIndex: 0, permissionIndex: 4 },
  { roleIndex: 0, permissionIndex: 5 },
  { roleIndex: 0, permissionIndex: 6 },
  { roleIndex: 0, permissionIndex: 7 },

  { roleIndex: 1, permissionIndex: 0 },
  { roleIndex: 1, permissionIndex: 1 },
  { roleIndex: 1, permissionIndex: 3 },
  { roleIndex: 1, permissionIndex: 5 },
  { roleIndex: 1, permissionIndex: 6 },
  { roleIndex: 1, permissionIndex: 7 },

  { roleIndex: 2, permissionIndex: 0 },
  { roleIndex: 2, permissionIndex: 1 },
  { roleIndex: 2, permissionIndex: 2 },
  { roleIndex: 2, permissionIndex: 3 },
  { roleIndex: 2, permissionIndex: 4 },
  { roleIndex: 2, permissionIndex: 7 },

  { roleIndex: 3, permissionIndex: 0 },
  { roleIndex: 3, permissionIndex: 1 },
  { roleIndex: 3, permissionIndex: 2 },
  { roleIndex: 3, permissionIndex: 3 },
  { roleIndex: 3, permissionIndex: 4 },

  { roleIndex: 4, permissionIndex: 0 },
  { roleIndex: 4, permissionIndex: 3 },

  { roleIndex: 5, permissionIndex: 0 },
  { roleIndex: 5, permissionIndex: 1 },
  { roleIndex: 5, permissionIndex: 2 },
  { roleIndex: 5, permissionIndex: 3 },
  { roleIndex: 5, permissionIndex: 5 },
  { roleIndex: 5, permissionIndex: 6 },
];

// Define enum types for various features like FollowType, ContentVersionType, etc.
export enum FollowType {
  Tag = 'tag',
  User = 'user'
}

export enum ContentVersionType {
  Post = 'post',
  Page = 'page'
}

export enum SlugType {
  Post = 'post',
  Tag = 'tag'
}

export enum AssetType {
  Photo = 'photo',
  Video = 'video',
  File = 'file',
}

// The main function where the database seeding takes place
const main = async () => {
  console.log("Seed start");
  await db.transaction(async (tx) => {
    // Seed tags
    const tagsData: (typeof tags.$inferInsert)[] = []
    for (let i = 0; i < 10; i++) {
      const [tag] = await tx.insert(tags).values({
        name: faker.lorem.slug(),
      }).returning();
      tagsData.push(tag)
    }

    // Seed permissions
    const actualPermissionsData: (typeof permissions.$inferInsert)[] = [];
    for (const data of permissionsData) {
      const [permission] = await tx.insert(permissions).values(data).returning();
      actualPermissionsData.push(permission); 
    }

    // Seed roles
    const actualRolesData: (typeof roles.$inferInsert)[] = [];
    for (const data of rolesData) {
      const [role] = await tx.insert(roles).values(data).returning();
      actualRolesData.push(role);
    }

    // Seed rolePermissions
    const actualRolesToPermissionsData: (typeof rolePermissions.$inferInsert)[] = [];
    for (const data of rolesToPermissionsIndexData) {
      const [roleToPermission] = await tx.insert(rolePermissions).values({
        roleId: actualRolesData[data.roleIndex].roleId!, 
        permissionId: actualPermissionsData[data.permissionIndex].permissionId!,
      }).returning();
      actualRolesToPermissionsData.push(roleToPermission)
    }
    
    // Seed members and users
    const usersData: (typeof users.$inferInsert)[] = [];
    const membersData: (typeof users.$inferInsert)[] = [];
    for (let i = 0; i < 10; i++) {
      const [member] = await tx.insert(members).values({
        name: faker.internet.displayName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      }).returning();
      membersData.push(member);

      const [user] = await tx.insert(users).values({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        bio: faker.person.bio(),
        memberId: member.memberId
      }).returning();
      usersData.push(user);
    }

    // Seed userRoles
    const actualUserToRolesData: (typeof userRoles.$inferInsert)[] = [];
    for (let i = 0; i < usersData.length; i ++) {
      const userIndex = i; 
      const roleIndex = randomInt(0, actualRolesData.length - 1);
      const [userToRoles] = await tx.insert(userRoles).values({
        userId: usersData[userIndex].userId!,
        roleId: actualRolesData[roleIndex].roleId!,
      }).returning();
      actualUserToRolesData.push(userToRoles)
    }

    // Seed posts
    const postsData: (typeof posts.$inferInsert)[] = [];
    for (let i = 0; i < usersData.length; i ++) {
      const userIndex = i; 
      const [post] = await tx.insert(posts).values({
        title: faker.lorem.words(randomInt(1, 8)),
        userId: usersData[userIndex].userId!,
        publishedDate: new Date(),
      }).returning();
      postsData.push(post);
    }    

    // Seed comments
    const commentsData: (typeof comments.$inferInsert)[] = [];
    for (let i = 0; i < 10; i++) {
      const memeberIndex = randomInt(0, membersData.length - 1);
      const postIndex = randomInt(0, postsData.length - 1);
      const [comment] = await tx.insert(comments).values({
        postId: postsData[postIndex].postId!,
        memberId: membersData[memeberIndex].memberId!,
        createdAt: new Date(),
        text: faker.lorem.paragraphs(),
        parentComment: null
      }).returning();
      commentsData.push(comment);
    }

    // Seed content versions
    const versionsData: (typeof contentVersions.$inferInsert)[] = [];
    for (let i = 0; i < 10; i++) {
      const postIndex = randomInt(0, postsData.length - 1);
      const [contentVersion] = await tx.insert(contentVersions).values({
        postId: postsData[postIndex].postId!,
        updateAt: new Date(),
        publishedStatus: faker.datatype.boolean(),
        type: ContentVersionType.Post,
        isFeatured: faker.datatype.boolean(),
        contentPath: faker.image.url(),
      }).returning();
      versionsData.push(contentVersion);
    }

    // Seed tags to posts relations
    const tagsToPostsData: (typeof tagsToPosts.$inferInsert)[] = [];
    for (const post of postsData) {
      for (const tag of tagsData) {
        const active = faker.datatype.boolean();
        if (active) {
          const [tagToPost] = await tx.insert(tagsToPosts).values({
            postId: post.postId!,
            tagId: tag.tagId!
          }).returning();
          tagsToPostsData.push(tagToPost);
        }
      }
    }

    // Seed assets
    const assetsData: (typeof assets.$inferInsert)[] = [];
    for (let i = 0 ; i < 10; i ++) {
      const [asset] = await tx.insert(assets).values({
        type: AssetType.Photo,
        fileType: faker.system.mimeType(),
        fileSize: "100",
        contentPath: faker.image.url()
      }).returning();
      assetsData.push(asset);
    }

    // Seed slugs
    const slugsData: (typeof slugs.$inferInsert)[] = [];
    for (let i = 0 ; i < 10; i ++) {
      const type = faker.datatype.boolean() ? SlugType.Post : SlugType.Tag;
      const postIndex = randomInt(0, postsData.length - 1);
      const tagIndex = randomInt(0, tagsData.length - 1);
      const [slug] = await tx.insert(slugs).values({
        type,
        slug: faker.lorem.slug(),
        entityId: ({
          [SlugType.Post]: postsData[postIndex].postId!,
          [SlugType.Tag]: tagsData[tagIndex].tagId!
        })[type]
      }).returning();
      slugsData.push(slug);
    }

    // Seed follows
    const followsData: (typeof follows.$inferInsert)[] = [];
    for (let i = 0 ; i < 12; i ++) {
      const type = faker.datatype.boolean() ? FollowType.User : FollowType.Tag;
      const memberIndex = randomInt(0, membersData.length - 1);
      const userIndex = randomInt(0, usersData.length - 1);
      const tagIndex = randomInt(0, tagsData.length - 1);
      const [follow] = await tx.insert(follows).values({
        type,
        followerId: membersData[memberIndex].memberId!,
        entityId: ({
          [FollowType.User]: usersData[userIndex].userId!,
          [FollowType.Tag]: tagsData[tagIndex].tagId!
        })[type],
        createdAt: new Date()
      }).returning();
      followsData.push(follow);
    }

    // Seed post reads
    const postsReadData: (typeof postReads.$inferInsert)[] = [];
    for (const version of versionsData) {
      const memeberIndex = randomInt(0, membersData.length - 1);
      const [postRead] = await tx.insert(postReads).values({
        postId: version.postId!,
        memberId: membersData[memeberIndex].memberId!,
        postVersion: version.versionId!
      }).returning();
      postsReadData.push(postRead);
    }

    // Seed post assets relations
    const postToAssetsData: (typeof postAssets.$inferInsert)[] = [];
    for (const asset of assetsData) {
      const postIndex = randomInt(0, postsData.length - 1);
      const [postAsset] = await tx.insert(postAssets).values({
        assetId: asset.assetId!,
        postId: postsData[postIndex].postId!
      }).returning();
      postToAssetsData.push(postAsset);
    }
  })
  console.log("Seed completed");
};

(async () => {
  await main();
  await sql.end();
})();
