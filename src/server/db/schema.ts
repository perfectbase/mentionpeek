import { pgTable, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import cuid from "cuid";

const timestamps = {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const user = pgTable(
  "user",
  {
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
  },
  (table) => [index("user_created_at_idx").on(table.createdAt)]
);
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export const session = pgTable(
  "session",
  {
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
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_user_created_idx").on(table.userId, table.createdAt),
  ]
);
export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;

export const account = pgTable(
  "account",
  {
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
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_created_at_idx").on(table.createdAt),
  ]
);
export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;

export const verification = pgTable(
  "verification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    ...timestamps,
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_expires_at_idx").on(table.expiresAt),
    index("verification_identifier_value_idx").on(
      table.identifier,
      table.value
    ),
    index("verification_created_at_idx").on(table.createdAt),
  ]
);
export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;

// Social media monitoring system schema

export const emailGroup = pgTable(
  "emailGroup",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    name: text("name").notNull(),
    from: text("from").notNull(),
    accountId: text("accountId")
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("email_group_account_idx").on(table.accountId),
    index("email_group_account_created_idx").on(
      table.accountId,
      table.createdAt
    ),
    index("email_group_created_idx").on(table.createdAt),
  ]
);
export type EmailGroup = InferSelectModel<typeof emailGroup>;
export type NewEmailGroup = InferInsertModel<typeof emailGroup>;

export const accountConfig = pgTable(
  "accountConfig",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    defaultEmailGroupId: text("defaultEmailGroupId").references(
      () => emailGroup.id
    ),
    aiPrompt: text("aiPrompt"),
    accountId: text("accountId")
      .unique()
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("account_config_account_idx").on(table.accountId),
    index("account_config_default_email_group_idx").on(
      table.defaultEmailGroupId
    ),
    index("account_config_account_created_idx").on(
      table.accountId,
      table.createdAt
    ),
    index("account_config_created_idx").on(table.createdAt),
  ]
);
export type AccountConfig = InferSelectModel<typeof accountConfig>;
export type NewAccountConfig = InferInsertModel<typeof accountConfig>;

export const emailRecipient = pgTable(
  "emailRecipient",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    email: text("email").notNull(),
    groupId: text("groupId")
      .notNull()
      .references(() => emailGroup.id, { onDelete: "cascade" }),
    accountId: text("accountId")
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("email_recipient_group_idx").on(table.groupId),
    index("email_recipient_account_idx").on(table.accountId),
    index("email_recipient_email_idx").on(table.email),
    index("email_recipient_account_created_idx").on(
      table.accountId,
      table.createdAt
    ),
    index("email_recipient_created_idx").on(table.createdAt),
  ]
);
export type EmailRecipient = InferSelectModel<typeof emailRecipient>;
export type NewEmailRecipient = InferInsertModel<typeof emailRecipient>;

export const searchConfig = pgTable(
  "searchConfig",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    platform: text("platform").notNull(),
    query: text("query").notNull(),
    emailGroupId: text("emailGroupId").references(() => emailGroup.id),
    aiPrompt: text("aiPrompt"),
    accountConfigId: text("accountConfigId")
      .notNull()
      .references(() => accountConfig.id, { onDelete: "cascade" }),
    accountId: text("accountId")
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("search_config_account_idx").on(table.accountId),
    index("search_config_email_group_idx").on(table.emailGroupId),
    index("search_config_account_config_idx").on(table.accountConfigId),
    index("search_config_platform_idx").on(table.platform),
    index("search_config_platform_account_idx").on(
      table.platform,
      table.accountId
    ),
    index("search_config_account_created_idx").on(
      table.accountId,
      table.createdAt
    ),
    index("search_config_created_idx").on(table.createdAt),
  ]
);
export type SearchConfig = InferSelectModel<typeof searchConfig>;
export type NewSearchConfig = InferInsertModel<typeof searchConfig>;

export const searchEvent = pgTable(
  "searchEvent",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    startedAt: timestamp("startedAt").notNull(),
    endedAt: timestamp("endedAt").notNull(),
    runTime: timestamp("runTime").notNull(),
    platform: text("platform").notNull().$type<Platform>(),
    query: text("query").notNull(),
    aiPrompt: text("aiPrompt"),
    totalCount: text("totalCount").notNull().default("0"),
    negativeCount: text("negativeCount").notNull().default("0"),
    neutralCount: text("neutralCount").notNull().default("0"),
    positiveCount: text("positiveCount").notNull().default("0"),
    relevantCount: text("relevantCount").notNull().default("0"),
    rejectedCount: text("rejectedCount").notNull().default("0"),
    searchConfigId: text("searchConfigId")
      .notNull()
      .references(() => searchConfig.id, { onDelete: "cascade" }),
    accountId: text("accountId")
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("search_event_account_idx").on(table.accountId),
    index("search_event_config_idx").on(table.searchConfigId),
    index("search_event_platform_idx").on(table.platform),
    index("search_event_started_at_idx").on(table.startedAt),
    index("search_event_ended_at_idx").on(table.endedAt),
    index("search_event_platform_account_idx").on(
      table.platform,
      table.accountId
    ),
    index("search_event_account_date_idx").on(table.accountId, table.startedAt),
    index("search_event_total_count_idx").on(table.accountId, table.totalCount),
    index("search_event_negative_count_idx").on(
      table.accountId,
      table.negativeCount
    ),
    index("search_event_neutral_count_idx").on(
      table.accountId,
      table.neutralCount
    ),
    index("search_event_positive_count_idx").on(
      table.accountId,
      table.positiveCount
    ),
    index("search_event_relevant_count_idx").on(
      table.accountId,
      table.relevantCount
    ),
    index("search_event_rejected_count_idx").on(
      table.accountId,
      table.rejectedCount
    ),
    index("search_event_created_idx").on(table.createdAt),
  ]
);
export type SearchEvent = InferSelectModel<typeof searchEvent>;
export type NewSearchEvent = InferInsertModel<typeof searchEvent>;

export const mention = pgTable(
  "mention",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    platform: text("platform").notNull().$type<Platform>(),
    url: text("url").notNull(),
    name: text("name").notNull(),
    username: text("username").notNull(),
    title: text("title"),
    content: text("content").notNull(),
    date: timestamp("date").notNull(),
    isRejected: boolean("isRejected").default(false),
    sentiment: text("sentiment").$type<Sentiment>(),
    query: text("query").notNull(),
    emailGroupId: text("emailGroupId").references(() => emailGroup.id),
    searchConfigId: text("searchConfigId").references(() => searchConfig.id, {
      onDelete: "cascade",
    }),
    searchEventId: text("searchEventId").references(() => searchEvent.id, {
      onDelete: "cascade",
    }),
    accountId: text("accountId")
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("mention_account_idx").on(table.accountId),
    index("mention_email_group_idx").on(table.emailGroupId),
    index("mention_search_config_idx").on(table.searchConfigId),
    index("mention_search_event_idx").on(table.searchEventId),
    index("mention_platform_idx").on(table.platform),
    index("mention_date_idx").on(table.date),
    index("mention_sentiment_idx").on(
      table.sentiment,
      table.accountId,
      table.createdAt
    ),
    index("mention_platform_date_idx").on(
      table.platform,
      table.accountId,
      table.date
    ),
    index("mention_is_rejected_idx").on(
      table.isRejected,
      table.accountId,
      table.date
    ),
    index("mention_account_date_idx").on(table.accountId, table.date),
    index("mention_account_created_idx").on(table.accountId, table.createdAt),
    index("mention_created_idx").on(table.createdAt),
  ]
);
export type Mention = InferSelectModel<typeof mention>;
export type NewMention = InferInsertModel<typeof mention>;
export type Platform = "X" | "YouTube" | "Reddit" | "Bluesky";
export type Sentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
