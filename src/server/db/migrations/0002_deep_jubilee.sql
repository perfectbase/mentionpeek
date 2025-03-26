CREATE TABLE "searchEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"startedAt" timestamp NOT NULL,
	"endedAt" timestamp NOT NULL,
	"runTime" timestamp NOT NULL,
	"platform" text NOT NULL,
	"query" text NOT NULL,
	"aiPrompt" text,
	"totalCount" text DEFAULT '0' NOT NULL,
	"negativeCount" text DEFAULT '0' NOT NULL,
	"neutralCount" text DEFAULT '0' NOT NULL,
	"positiveCount" text DEFAULT '0' NOT NULL,
	"relevantCount" text DEFAULT '0' NOT NULL,
	"rejectedCount" text DEFAULT '0' NOT NULL,
	"searchConfigId" text NOT NULL,
	"accountId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mention" ADD COLUMN "searchEventId" text;--> statement-breakpoint
ALTER TABLE "searchEvent" ADD CONSTRAINT "searchEvent_searchConfigId_searchConfig_id_fk" FOREIGN KEY ("searchConfigId") REFERENCES "public"."searchConfig"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "searchEvent" ADD CONSTRAINT "searchEvent_accountId_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "search_event_account_idx" ON "searchEvent" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "search_event_config_idx" ON "searchEvent" USING btree ("searchConfigId");--> statement-breakpoint
CREATE INDEX "search_event_platform_idx" ON "searchEvent" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "search_event_started_at_idx" ON "searchEvent" USING btree ("startedAt");--> statement-breakpoint
CREATE INDEX "search_event_ended_at_idx" ON "searchEvent" USING btree ("endedAt");--> statement-breakpoint
CREATE INDEX "search_event_platform_account_idx" ON "searchEvent" USING btree ("platform","accountId");--> statement-breakpoint
CREATE INDEX "search_event_account_date_idx" ON "searchEvent" USING btree ("accountId","startedAt");--> statement-breakpoint
CREATE INDEX "search_event_total_count_idx" ON "searchEvent" USING btree ("accountId","totalCount");--> statement-breakpoint
CREATE INDEX "search_event_negative_count_idx" ON "searchEvent" USING btree ("accountId","negativeCount");--> statement-breakpoint
CREATE INDEX "search_event_neutral_count_idx" ON "searchEvent" USING btree ("accountId","neutralCount");--> statement-breakpoint
CREATE INDEX "search_event_positive_count_idx" ON "searchEvent" USING btree ("accountId","positiveCount");--> statement-breakpoint
CREATE INDEX "search_event_relevant_count_idx" ON "searchEvent" USING btree ("accountId","relevantCount");--> statement-breakpoint
CREATE INDEX "search_event_rejected_count_idx" ON "searchEvent" USING btree ("accountId","rejectedCount");--> statement-breakpoint
CREATE INDEX "search_event_created_idx" ON "searchEvent" USING btree ("createdAt");--> statement-breakpoint
ALTER TABLE "mention" ADD CONSTRAINT "mention_searchEventId_searchEvent_id_fk" FOREIGN KEY ("searchEventId") REFERENCES "public"."searchEvent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mention_search_event_idx" ON "mention" USING btree ("searchEventId");