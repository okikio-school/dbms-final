import { pgTable, serial, text, varchar, integer, timestamp, decimal, boolean, primaryKey, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Table definitions
export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),
  name: varchar('name'),
  email: varchar('email'),
  password: varchar('password'),
  bio: text('bio'),
  memberId: integer('memberid')
});

export const members = pgTable('members', {
  memberId: serial('memberid').primaryKey(),
  name: varchar('name'),
  email: varchar('email'),
  password: varchar('password')
});

export const roles = pgTable('roles', {
  roleId: serial('role_id').primaryKey(),
  name: varchar('name'),
  description: text('description')
});

export const userRoles = pgTable('userroles', {
  userId: integer('user_id'),
  roleId: integer('role_id')
}, (t) => ({
  pk: primaryKey(t.userId, t.roleId)
}));

export const permissions = pgTable('permissions', {
  permissionId: serial('permission_id').primaryKey(),
  name: varchar('name'),
  description: text('description')
});

export const rolePermissions = pgTable('rolepermissions', {
  permissionId: integer('permission_id'),
  roleId: integer('role_id')
}, (t) => ({
  pk: primaryKey(t.permissionId, t.roleId)
}));

export const follows = pgTable('follows', {
  followerId: integer('follower_id'),
  entityId: integer('entity_id'),
  type: varchar('type'),
  createdAt: timestamp('created_at')
});

export const posts = pgTable('posts', {
  postId: serial('post_id').primaryKey(),
  title: varchar('title'),
  userId: integer('userid'),
  publishedDate: timestamp('published_date'),
  version: integer('version')
});

export const contentVersions = pgTable('contentversions', {
  versionId: serial('version_id').primaryKey(),
  postId: integer('post_id'),
  type: varchar('type'),
  updateAt: timestamp('update_at'),
  contentPath: varchar('content_path'),
  publishedStatus: boolean('published_status'),
  isFeatured: boolean('is_featured'),
  metadata: text('metadata')
});

export const comments = pgTable('comments', {
  commentId: serial('comment_id').primaryKey(),
  postId: integer('post_id'),
  memberId: integer('memberid'),
  createdAt: timestamp('created_at'),
  parentComment: integer('parent_comment').references((): AnyPgColumn => users.userId),
  text: text('text')
});

export const tags = pgTable('tags', {
  tagId: serial('tag_id').primaryKey(),
  name: varchar('name')
});

export const tagsToPosts = pgTable('tagstoposts', {
  tagId: integer('tag_id'),
  postId: integer('post_id')
}, (t) => ({
  pk: primaryKey(t.tagId, t.postId)
}));

export const slugs = pgTable('slugs', {
  slugId: serial('slug_id').primaryKey(),
  entityId: integer('entity_id'),
  slug: varchar('slug'),
  type: varchar('type')
});

export const assets = pgTable('assets', {
  assetId: serial('assetid').primaryKey(),
  type: varchar('type'),
  contentPath: varchar('content_path'),
  fileType: varchar('file_type'),
  fileSize: decimal('file_size'),
  width: decimal('width'),
  height: decimal('height'),
  title: varchar('title'),
  alt: text('alt')
});

export const postReads = pgTable('postreads', {
  postId: integer('post_id'),
  postVersion: integer('post_version'),
  memberId: integer('memberid')
}, (t) => ({
  pk: primaryKey(t.postId, t.postVersion, t.memberId)
}));

export const postAssets = pgTable('postassets', {
  postId: integer('post_id'),
  assetId: integer('assetid')
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
  posts: many(posts, {
    fields: [users.userId],
    references: [posts.userId],
  }),
  // other relations would follow a similar pattern
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, {
    fields: [members.memberId],
    references: [users.memberId],
  }),
  comments: many(comments, {
    fields: [members.memberId],
    references: [comments.memberId],
  }),
  // other relations would follow a similar pattern
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
  comments: many(comments, {
    fields: [posts.postId],
    references: [comments.postId],
  }),
  contentVersions: many(contentVersions, {
    fields: [posts.postId],
    references: [contentVersions.postId],
  }),
  tags: many(tagsToPosts, {
    fields: [posts.postId],
    references: [tagsToPosts.postId],
  }),
  // Assuming there is a relation for postReads and postAssets, define similarly
}));

// ContentVersions relations
export const contentVersionsRelations = relations(contentVersions, ({ one }) => ({
  post: one(posts, {
    fields: [contentVersions.postId],
    references: [posts.postId],
  }),
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
  // Assuming `parentComment` refers to a self-relation on `comments`
  parentComment: one(comments, {
    fields: [comments.parentComment],
    references: [comments.commentId],
  }),
  // Child comments
  childComments: many(comments, {
    fields: [comments.commentId],
    references: [comments.parentComment],
  }),
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

// Note: The actual implementation of these relations will depend on the specifics of the Drizzle ORM and how it handles relations.
// Ensure you refer to the documentation of Drizzle ORM for any specific methods or configuration required to accurately map these relations.
