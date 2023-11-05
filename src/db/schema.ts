import { pgTable, pgEnum, serial, text, varchar, integer, timestamp, decimal, boolean, primaryKey, json } from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Table definitions
export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
  password: varchar('password').notNull(),
  bio: text('bio'),
  memberId: integer('memberid').unique().references(() => members.memberId)
});

export const members = pgTable('members', {
  memberId: serial('memberid').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').unique().notNull(),
  password: varchar('password').notNull()
});

export const roles = pgTable('roles', {
  roleId: serial('role_id').primaryKey(),
  name: varchar('name').notNull().unique(),
  description: text('description')
});

export const userRoles = pgTable('userroles', {
  userId: integer('user_id').notNull().references(() => users.userId),
  roleId: integer('role_id').notNull().references(() => roles.roleId)
}, (t) => ({
  pk: primaryKey(t.userId, t.roleId)
}));

export const permissions = pgTable('permissions', {
  permissionId: serial('permission_id').primaryKey(),
  name: varchar('name').notNull().unique(),
  description: text('description')
});

export const rolePermissions = pgTable('rolepermissions', {
  permissionId: integer('permission_id').notNull().references(() => permissions.permissionId),
  roleId: integer('role_id').notNull().references(() => roles.roleId)
}, (t) => ({
  pk: primaryKey(t.permissionId, t.roleId)
}));

export const followtype = pgEnum('type', ['user', 'tag']);
export const follows = pgTable('follows', {
  followerId: integer('follower_id').notNull().references(() => members.memberId),
  entityId: integer('entity_id').notNull(), //references user or tag
  type: followtype('type').notNull(),
  createdAt: timestamp('created_at').notNull()
}, (t) => ({
  pk: primaryKey(t.followerId, t.entityId, t.type)
}));

export const posts = pgTable('posts', {
  postId: serial('post_id').primaryKey(),
  title: varchar('title').notNull(),
  userId: integer('userid').notNull().references(() => users.userId),
  publishedDate: timestamp('published_date').notNull(),
  version: integer('version').unique()
});

export const versionType = pgEnum('type', ['post', 'page']);
export const contentVersions = pgTable('contentversions', {
  versionId: serial('version_id').primaryKey(),
  postId: integer('post_id').notNull().references(()=>posts.postId),
  type: versionType('type').notNull(),
  updateAt: timestamp('update_at').notNull(),
  contentPath: varchar('content_path').notNull().unique(),
  publishedStatus: boolean('published_status').notNull(),
  isFeatured: boolean('is_featured').notNull(),
  metadata: json('metadata')
});

export const comments = pgTable('comments', {
  commentId: serial('comment_id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.postId),
  memberId: integer('memberid').notNull().references(() => members.memberId),
  createdAt: timestamp('created_at').notNull(),
  parentComment: integer('parent_comment').references((): AnyPgColumn => users.userId),
  text: text('text').notNull()
});

export const tags = pgTable('tags', {
  tagId: serial('tag_id').primaryKey(),
  name: varchar('name').notNull().unique()
});

export const tagsToPosts = pgTable('tagstoposts', {
  tagId: integer('tag_id').notNull().references(()=>tags.tagId),
  postId: integer('post_id').notNull().references(()=>posts.postId)
}, (t) => ({
  pk: primaryKey(t.tagId, t.postId)
}));

export const slugType = pgEnum('type', ['tag', 'post']);
export const slugs = pgTable('slugs', {
  slugId: serial('slug_id').primaryKey(),
  entityId: integer('entity_id').notNull(), //references post or tag
  slug: varchar('slug').notNull().unique(),
  type: slugType('type').notNull()
});

export const assetType = pgEnum('type', ['photo', 'video', 'file']);
export const assets = pgTable('assets', {
  assetId: serial('assetid').primaryKey(),
  type: varchar('type').notNull(),
  contentPath: varchar('content_path').notNull(),
  fileType: varchar('file_type').notNull(),
  fileSize: decimal('file_size', {precision:8,scale:3}).notNull(),
  width: decimal('width', {precision:10,scale:4}),
  height: decimal('height', {precision:10,scale:4}),
  title: varchar('title'),
  alt: text('alt')
});

export const postReads = pgTable('postreads', {
  postId: integer('post_id').notNull().references(()=>posts.postId),
  postVersion: integer('post_version').notNull().references(()=>contentVersions.versionId),
  memberId: integer('memberid').notNull().references(()=>members.memberId)
}, (t) => ({
  pk: primaryKey(t.postId, t.postVersion, t.memberId)
}));

export const postAssets = pgTable('postassets', {
  postId: integer('post_id').notNull().references(()=>posts.postId),
  assetId: integer('assetid').notNull().references(()=>assets.assetId)
}, (t) => ({
  pk: primaryKey(t.postId, t.assetId)
}));

// Below, you would define the relations similar to the above definitions, keeping in mind to map the foreign keys accordingly.
// Since this is a lengthy process, let me illustrate with a few examples:

export const usersRelations = relations(users, ({ one, many }) => ({
  member: one(members, {
    fields: [users.memberId],
    references: [members.memberId],
  }),
  posts: many(posts),
  roles: many(userRoles)
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, {
    fields: [members.memberId],
    references: [users.memberId],
  }),
  comments: many(comments),
  follows: many(follows),
  reads: many(postReads)
}));

// Complete the rest of the relation definitions following the foreign key constraints provided by the ALTER TABLE SQL statements.

// UserRoles relations
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.userId],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.roleId],
  })
}));

// RolePermissions relations
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.roleId],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.permissionId],
  })
}));

// Follows relations
export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.userId],
  }),
  // Assuming `entityId` in follows can refer to different types of entities,
  // You might need a conditional or polymorphic relation here, which is not a standard feature and would require custom logic.
}));

// Posts relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.userId],
  }),
  comments: many(comments),
  contentVersions: many(contentVersions),
  tags: many(tagsToPosts)
  //slugs use entity ids and must be determined by user logic
}));

// ContentVersions relations
export const contentVersionsRelations = relations(contentVersions, ({ one, many }) => ({
  post: one(posts, {
    fields: [contentVersions.postId],
    references: [posts.postId],
  }),
  reads: many(postReads)
}));

// Comments relations
export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.postId],
  }),
  member: one(members, {
    fields: [comments.memberId],
    references: [members.memberId],
  }),
  // Parent comment (self-referential)
  parentComment: one(comments, {
    fields: [comments.parentComment],
    references: [comments.commentId],
  }),
  // Child comments
  childComments: many(comments),
}));

// TagsToPosts relations
export const tagsToPostsRelations = relations(tagsToPosts, ({ one }) => ({
  tag: one(tags, {
    fields: [tagsToPosts.tagId],
    references: [tags.tagId],
  }),
  post: one(posts, {
    fields: [tagsToPosts.postId],
    references: [posts.postId],
  }),
}));

// Slugs relations
// Assuming that `entityId` and `type` refer to different entities,
// you would need a polymorphic association, which Drizzle ORM may not support out of the box.

// Assets relations
// Since there are no foreign keys in the provided SQL, no relations are defined here.

// PostReads relations
export const postReadsRelations = relations(postReads, ({ one }) => ({
  post: one(posts, {
    fields: [postReads.postId],
    references: [posts.postId],
  }),
  member: one(members, {
    fields: [postReads.memberId],
    references: [members.memberId],
  }),
  // This assumes there is also a relation to a post version, which should be set if your model supports this.
}));

// PostAssets relations
export const postAssetsRelations = relations(postAssets, ({ one }) => ({
  post: one(posts, {
    fields: [postAssets.postId],
    references: [posts.postId],
  }),
  asset: one(assets, {
    fields: [postAssets.assetId],
    references: [assets.assetId],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  users: many(userRoles)
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions)
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(tagsToPosts)
  //slug relations are done logically
  //follows relations are done logically
}));

export const assetsRelations = relations(assets, ({ many }) => ({
  posts: many(postAssets)
}));

// Note: The actual implementation of these relations will depend on the specifics of the Drizzle ORM and how it handles relations.
// Ensure you refer to the documentation of Drizzle ORM for any specific methods or configuration required to accurately map these relations.
