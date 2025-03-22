# Drizzle ORM Cheat Sheet

Drizzle is a TypeScript ORM with a SQL-like syntax, known for its performance, type safety, and developer experience. This cheat sheet covers the essential functionalities of Drizzle ORM.

## Table of Contents

- [Drizzle ORM Cheat Sheet](#drizzle-orm-cheat-sheet)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Schema Definition](#schema-definition)
    - [PostgreSQL](#postgresql)
    - [MySQL](#mysql)
    - [SQLite](#sqlite)
  - [Database Connection](#database-connection)
    - [PostgreSQL](#postgresql-1)
    - [PostgreSQL with Neon](#postgresql-with-neon)
    - [MySQL](#mysql-1)
    - [SQLite](#sqlite-1)
  - [Querying Data](#querying-data)
    - [Select](#select)
    - [Insert](#insert)
    - [Update](#update)
    - [Delete](#delete)
  - [Filters and Operators](#filters-and-operators)
  - [Relations](#relations)
    - [Define relations](#define-relations)
    - [Query related data](#query-related-data)
  - [Joins](#joins)
  - [Transactions](#transactions)
  - [Migrations](#migrations)
    - [Setup drizzle.config.ts](#setup-drizzleconfigts)
    - [Generate migrations](#generate-migrations)
    - [Apply migrations in code](#apply-migrations-in-code)
  - [Type Helpers](#type-helpers)
  - [SQL Expressions](#sql-expressions)
  - [Additional Resources](#additional-resources)

## Installation

```bash
# Install core package
npm install drizzle-orm

# Add database-specific package (examples)
npm install drizzle-orm/pg-core # PostgreSQL
npm install drizzle-orm/mysql-core # MySQL
npm install drizzle-orm/sqlite-core # SQLite

# Add drizzle-kit for migrations
npm install -D drizzle-kit
```

## Schema Definition

### PostgreSQL

```typescript
// schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### MySQL

```typescript
// schema.ts
import {
  mysqlTable,
  serial,
  text,
  int,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### SQLite

```typescript
// schema.ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
});
```

## Database Connection

### PostgreSQL

```typescript
// db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
```

### PostgreSQL with Neon

```typescript
// db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

### MySQL

```typescript
// db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

export const db = drizzle(connection);
```

### SQLite

```typescript
// db.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite);
```

## Querying Data

### Select

Basic query:

```typescript
// Get all users
const allUsers = await db.select().from(users);

// Get specific fields
const userNames = await db
  .select({
    id: users.id,
    name: users.name,
  })
  .from(users);

// Get single user by ID
const user = await db.select().from(users).where(eq(users.id, 1));

// Get first user
const firstUser = await db.select().from(users).limit(1);

// Order by name descending
const sortedUsers = await db.select().from(users).orderBy(desc(users.name));

// Count users
const userCount = await db.select({ count: count() }).from(users);

// Pagination
const page = 1;
const pageSize = 10;
const paginatedUsers = await db
  .select()
  .from(users)
  .limit(pageSize)
  .offset((page - 1) * pageSize);
```

### Insert

Single row:

```typescript
// Insert a single user
await db.insert(users).values({
  name: "John Doe",
  email: "john@example.com",
});

// Insert and return the inserted data
const inserted = await db
  .insert(users)
  .values({
    name: "John Doe",
    email: "john@example.com",
  })
  .returning();
```

Multiple rows:

```typescript
// Insert multiple users
await db.insert(users).values([
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Doe", email: "jane@example.com" },
]);
```

### Update

```typescript
// Update user name by ID
await db.update(users).set({ name: "John Smith" }).where(eq(users.id, 1));

// Update and return the updated data
const updated = await db
  .update(users)
  .set({ name: "John Smith" })
  .where(eq(users.id, 1))
  .returning();
```

### Delete

```typescript
// Delete a user by ID
await db.delete(users).where(eq(users.id, 1));

// Delete all users
await db.delete(users);

// Delete and return the deleted data
const deleted = await db.delete(users).where(eq(users.id, 1)).returning();
```

## Filters and Operators

```typescript
import {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  like,
  notLike,
  ilike,
  notIlike,
  between,
  and,
  or,
} from "drizzle-orm";

// Equal
const user = await db.select().from(users).where(eq(users.id, 1));

// Not equal
const notAdminUsers = await db
  .select()
  .from(users)
  .where(ne(users.role, "admin"));

// Greater than
const olderUsers = await db.select().from(users).where(gt(users.age, 18));

// Greater than or equal
const adultUsers = await db.select().from(users).where(gte(users.age, 18));

// Less than
const youngUsers = await db.select().from(users).where(lt(users.age, 18));

// Less than or equal
const notAdultUsers = await db.select().from(users).where(lte(users.age, 17));

// Is null
const noEmailUsers = await db.select().from(users).where(isNull(users.email));

// Is not null
const withEmailUsers = await db
  .select()
  .from(users)
  .where(isNotNull(users.email));

// In array
const specificUsers = await db
  .select()
  .from(users)
  .where(inArray(users.id, [1, 2, 3]));

// Not in array
const otherUsers = await db
  .select()
  .from(users)
  .where(notInArray(users.id, [1, 2, 3]));

// Like (case-sensitive)
const johnUsers = await db
  .select()
  .from(users)
  .where(like(users.name, "John%"));

// Not like (case-sensitive)
const notJohnUsers = await db
  .select()
  .from(users)
  .where(notLike(users.name, "John%"));

// ILike (case-insensitive)
const johnUsersInsensitive = await db
  .select()
  .from(users)
  .where(ilike(users.name, "john%"));

// Not ILike (case-insensitive)
const notJohnUsersInsensitive = await db
  .select()
  .from(users)
  .where(notIlike(users.name, "john%"));

// Between
const middleAgedUsers = await db
  .select()
  .from(users)
  .where(between(users.age, 25, 45));

// Combining with AND
const johnAdults = await db
  .select()
  .from(users)
  .where(and(like(users.name, "John%"), gte(users.age, 18)));

// Combining with OR
const adminsOrManagers = await db
  .select()
  .from(users)
  .where(or(eq(users.role, "admin"), eq(users.role, "manager")));
```

## Relations

### Define relations

```typescript
// schema.ts
import { relations } from "drizzle-orm";

// Define one-to-many relation between users and posts
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

// Define many-to-many relation
export const usersToGroups = pgTable(
  "users_to_groups",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.groupId] }),
  })
);

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  user: one(users, {
    fields: [usersToGroups.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
}));
```

### Query related data

```typescript
// To use relational queries
import * as schema from "./schema";
const db = drizzle(client, { schema });

// One-to-many: Get user with their posts
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true,
  },
});

// Many-to-many: Get user with their groups
const usersWithGroups = await db.query.users.findMany({
  with: {
    usersToGroups: {
      with: {
        group: true,
      },
    },
  },
});

// Filtering related data
const usersWithRecentPosts = await db.query.users.findMany({
  with: {
    posts: {
      where: (posts, { gt }) => gt(posts.createdAt, new Date("2023-01-01")),
    },
  },
});
```

## Joins

```typescript
import { eq } from "drizzle-orm";

// Left join
const result = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId));

// Inner join
const result = await db
  .select()
  .from(users)
  .innerJoin(posts, eq(users.id, posts.authorId));

// Right join
const result = await db
  .select()
  .from(users)
  .rightJoin(posts, eq(users.id, posts.authorId));

// Full join
const result = await db
  .select()
  .from(users)
  .fullJoin(posts, eq(users.id, posts.authorId));

// Multiple joins
const result = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .leftJoin(comments, eq(posts.id, comments.postId));

// Selecting specific columns
const result = await db
  .select({
    userId: users.id,
    userName: users.name,
    postTitle: posts.title,
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId));
```

## Transactions

```typescript
// Basic transaction
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: "John", email: "john@example.com" });
  await tx.insert(posts).values({ title: "Post 1", authorId: 1 });
});

// Transaction with return value
const newBalance = await db.transaction(async (tx) => {
  await tx
    .update(accounts)
    .set({ balance: sql`${accounts.balance} - 100.00` })
    .where(eq(accounts.userId, 1));

  await tx
    .update(accounts)
    .set({ balance: sql`${accounts.balance} + 100.00` })
    .where(eq(accounts.userId, 2));

  const [account] = await tx
    .select({ balance: accounts.balance })
    .from(accounts)
    .where(eq(accounts.userId, 1));

  return account.balance;
});

// Nested transactions (savepoints)
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: "John", email: "john@example.com" });

  await tx.transaction(async (tx2) => {
    await tx2.insert(posts).values({ title: "Post 1", authorId: 1 });
  });
});

// Transaction with rollback
await db.transaction(async (tx) => {
  const [account] = await tx
    .select({ balance: accounts.balance })
    .from(accounts)
    .where(eq(accounts.userId, 1));

  if (account.balance < 100) {
    tx.rollback();
  }

  await tx
    .update(accounts)
    .set({ balance: sql`${accounts.balance} - 100.00` })
    .where(eq(accounts.userId, 1));
});

// Transaction with options (PostgreSQL example)
await db.transaction(
  async (tx) => {
    // Transaction operations
  },
  {
    isolationLevel: "read committed",
    accessMode: "read write",
    deferrable: true,
  }
);
```

## Migrations

### Setup drizzle.config.ts

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "pg", // or 'mysql', 'sqlite'
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Generate migrations

```bash
# Generate migrations based on schema changes
npx drizzle-kit generate

# Generate migrations with a custom name
npx drizzle-kit generate:pg --custom

# Pull schema from existing database (database first approach)
npx drizzle-kit pull

# Push schema directly to database without SQL files
npx drizzle-kit push
```

### Apply migrations in code

```typescript
// src/migrate.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// This will run migrations from the 'drizzle' folder
async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migrations completed!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed!", err);
  process.exit(1);
});
```

## Type Helpers

```typescript
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users, posts } from "./schema";

// Types for SELECT queries
type User = InferSelectModel<typeof users>;
type Post = InferSelectModel<typeof posts>;

// Types for INSERT operations
type NewUser = InferInsertModel<typeof users>;
type NewPost = InferInsertModel<typeof posts>;

// Usage
async function createUser(data: NewUser) {
  return await db.insert(users).values(data).returning();
}

async function getUserById(id: number): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}
```

## SQL Expressions

```typescript
import { sql } from "drizzle-orm";

// Raw SQL
const result = await db
  .select({
    value: sql`CURRENT_TIMESTAMP`,
  })
  .from(users);

// SQL in conditions
const recentUsers = await db
  .select()
  .from(users)
  .where(sql`${users.createdAt} > NOW() - INTERVAL '7 days'`);

// SQL in updates
await db
  .update(users)
  .set({
    loginCount: sql`${users.loginCount} + 1`,
  })
  .where(eq(users.id, 1));

// Prepared statements
const getUserById = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder("id")))
  .prepare();

const user = await getUserById.execute({ id: 1 });
```

## Additional Resources

- [Official Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [GitHub Repository](https://github.com/drizzle-team/drizzle-orm)
