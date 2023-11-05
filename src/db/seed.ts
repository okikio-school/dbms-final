import { faker } from "@faker-js/faker";

import { comments, members, permissions, rolePermissions, roles, slugs, userRoles, users } from "./schema.ts";
import { db, sql } from "./db.ts";

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

  const membersData: (typeof members.$inferInsert)[] = [];
  for (let i = 0; i < 10; i++) {
    membersData.push({
      name: faker.internet.displayName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      memberId: i,
    });
  }

  const usersToRolesData: (typeof userRoles.$inferInsert)[] = [];
  for (const user of usersData) {
    usersToRolesData.push({
      roleId: 4,
      userId: +user.userId!
    })
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

  

  console.log("Seed start");
  await db.insert(users).values(usersData);
  await db.insert(members).values(membersData);
  await db.insert(roles).values(rolesData);
  await db.insert(permissions).values(permissionsData);
  await db.insert(rolePermissions).values(rolesToPermissionsData);
  await db.insert(userRoles).values(usersToRolesData);
  console.log("Seed done");
};

(async () => {
  await main();
  await sql.end();
})();

//https://anasrin.vercel.app/blog/seeding-database-with-drizzle-orm/
