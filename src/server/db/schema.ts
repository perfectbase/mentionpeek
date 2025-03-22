import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import cuid from "cuid";

const timestamps = {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  username: text("username").unique(),
  displayUsername: text("displayUsername"),
  ...timestamps,
});
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export const session = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});
export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;

export const account = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
});
export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;

export const verification = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  ...timestamps,
});
export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;
