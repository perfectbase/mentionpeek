CREATE TABLE "accountConfig" (
	"id" text PRIMARY KEY NOT NULL,
	"defaultEmailGroupId" text,
	"aiPrompt" text,
	"accountId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accountConfig_accountId_unique" UNIQUE("accountId")
);
--> statement-breakpoint
CREATE TABLE "emailGroup" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"from" text NOT NULL,
	"accountId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emailRecipient" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"groupId" text NOT NULL,
	"accountId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mention" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"date" timestamp NOT NULL,
	"isRejected" boolean DEFAULT false,
	"sentiment" text,
	"query" text NOT NULL,
	"emailGroupId" text,
	"searchConfigId" text,
	"accountId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "searchConfig" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"query" text NOT NULL,
	"emailGroupId" text,
	"aiPrompt" text,
	"accountConfigId" text NOT NULL,
	"accountId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updatedAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accountConfig" ADD CONSTRAINT "accountConfig_defaultEmailGroupId_emailGroup_id_fk" FOREIGN KEY ("defaultEmailGroupId") REFERENCES "public"."emailGroup"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accountConfig" ADD CONSTRAINT "accountConfig_accountId_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emailGroup" ADD CONSTRAINT "emailGroup_accountId_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emailRecipient" ADD CONSTRAINT "emailRecipient_groupId_emailGroup_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."emailGroup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emailRecipient" ADD CONSTRAINT "emailRecipient_accountId_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mention" ADD CONSTRAINT "mention_emailGroupId_emailGroup_id_fk" FOREIGN KEY ("emailGroupId") REFERENCES "public"."emailGroup"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mention" ADD CONSTRAINT "mention_searchConfigId_searchConfig_id_fk" FOREIGN KEY ("searchConfigId") REFERENCES "public"."searchConfig"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mention" ADD CONSTRAINT "mention_accountId_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "searchConfig" ADD CONSTRAINT "searchConfig_emailGroupId_emailGroup_id_fk" FOREIGN KEY ("emailGroupId") REFERENCES "public"."emailGroup"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "searchConfig" ADD CONSTRAINT "searchConfig_accountConfigId_accountConfig_id_fk" FOREIGN KEY ("accountConfigId") REFERENCES "public"."accountConfig"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "searchConfig" ADD CONSTRAINT "searchConfig_accountId_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_config_account_idx" ON "accountConfig" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "account_config_default_email_group_idx" ON "accountConfig" USING btree ("defaultEmailGroupId");--> statement-breakpoint
CREATE INDEX "account_config_account_created_idx" ON "accountConfig" USING btree ("accountId","createdAt");--> statement-breakpoint
CREATE INDEX "account_config_created_idx" ON "accountConfig" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "email_group_account_idx" ON "emailGroup" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "email_group_account_created_idx" ON "emailGroup" USING btree ("accountId","createdAt");--> statement-breakpoint
CREATE INDEX "email_group_created_idx" ON "emailGroup" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "email_recipient_group_idx" ON "emailRecipient" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "email_recipient_account_idx" ON "emailRecipient" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "email_recipient_email_idx" ON "emailRecipient" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_recipient_account_created_idx" ON "emailRecipient" USING btree ("accountId","createdAt");--> statement-breakpoint
CREATE INDEX "email_recipient_created_idx" ON "emailRecipient" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "mention_account_idx" ON "mention" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "mention_email_group_idx" ON "mention" USING btree ("emailGroupId");--> statement-breakpoint
CREATE INDEX "mention_search_config_idx" ON "mention" USING btree ("searchConfigId");--> statement-breakpoint
CREATE INDEX "mention_platform_idx" ON "mention" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "mention_date_idx" ON "mention" USING btree ("date");--> statement-breakpoint
CREATE INDEX "mention_sentiment_idx" ON "mention" USING btree ("sentiment","accountId","createdAt");--> statement-breakpoint
CREATE INDEX "mention_platform_date_idx" ON "mention" USING btree ("platform","accountId","date");--> statement-breakpoint
CREATE INDEX "mention_is_rejected_idx" ON "mention" USING btree ("isRejected","accountId","date");--> statement-breakpoint
CREATE INDEX "mention_account_date_idx" ON "mention" USING btree ("accountId","date");--> statement-breakpoint
CREATE INDEX "mention_account_created_idx" ON "mention" USING btree ("accountId","createdAt");--> statement-breakpoint
CREATE INDEX "mention_created_idx" ON "mention" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "search_config_account_idx" ON "searchConfig" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "search_config_email_group_idx" ON "searchConfig" USING btree ("emailGroupId");--> statement-breakpoint
CREATE INDEX "search_config_account_config_idx" ON "searchConfig" USING btree ("accountConfigId");--> statement-breakpoint
CREATE INDEX "search_config_platform_idx" ON "searchConfig" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "search_config_platform_account_idx" ON "searchConfig" USING btree ("platform","accountId");--> statement-breakpoint
CREATE INDEX "search_config_account_created_idx" ON "searchConfig" USING btree ("accountId","createdAt");--> statement-breakpoint
CREATE INDEX "search_config_created_idx" ON "searchConfig" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "account_created_at_idx" ON "account" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_user_created_idx" ON "session" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "verification_identifier_value_idx" ON "verification" USING btree ("identifier","value");--> statement-breakpoint
CREATE INDEX "verification_created_at_idx" ON "verification" USING btree ("createdAt");