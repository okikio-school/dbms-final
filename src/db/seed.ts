import { faker } from "@faker-js/faker";

import { permissions, rolePermissions, roles, users } from "./schema";
import { db, sql } from "./db";

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
    permissionId: 0,
    name: "content-read",
    description: "read access for all posts and versions",
  },
  {
    permissionId: 1,
    name: "content-write",
    description: "write access to all posts and versions",
  },
  {
    permissionId: 2,
    name: "comments-read",
    description: "read access for comments",
  },
  {
    permissionId: 3,
    name: "comments-write",
    description: "write access for comments",
  },
  {
    permissionId: 4,
    name: "users-read",
    description: "read access to total list of users & members",
  },
  {
    permissionId: 5,
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
  {
    roleId: 0,
    permissionId: 0,
  },
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

  console.log("Seed start");
  await db.insert(users).values(usersData);
  console.log("Seed done");
};

(async () => {
  await main();
  await sql.end();
})();

//https://anasrin.vercel.app/blog/seeding-database-with-drizzle-orm/
