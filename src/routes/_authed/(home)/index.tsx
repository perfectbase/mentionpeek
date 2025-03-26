import { Await, createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { db } from "~/server/db";
import {
  eq,
  desc,
  and,
  not,
  like,
  lt,
  or,
  gte,
  lte,
  count,
  sql,
  inArray,
} from "drizzle-orm";
import { mention } from "~/server/db/schema";
import type { Mention, Platform, Sentiment } from "~/server/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { Overview } from "~/components/Overview";

const getNextMentions = createServerFn({ method: "GET" })
  .validator((d?: Mention) => d)
  .handler(async ({ data: lastItem }) => {
    const mentions = await db
      .select()
      .from(mention)
      .where(
        lastItem
          ? or(
              lt(mention.date, lastItem.date),
              and(eq(mention.date, lastItem.date), lt(mention.id, lastItem.id))
            )
          : undefined
      )
      .orderBy(desc(mention.date), desc(mention.id))
      .limit(10);

    return mentions;
  });

const getOverview = createServerFn({ method: "GET" })
  .validator(
    (d: {
      period: {
        start: Date;
        end: Date;
      };
    }) => d
  )
  .handler(async ({ data: props }) => {
    // Calculate previous period start date
    const previousPeriodStart = new Date(props.period.start);
    const daysDiff =
      (props.period.end.getTime() - props.period.start.getTime()) /
      (1000 * 60 * 60 * 24);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);

    // Get current period count
    const [currentPeriodResult] = await db
      .select({ count: count() })
      .from(mention)
      .where(
        and(
          gte(mention.date, props.period.start),
          lte(mention.date, props.period.end)
        )
      );

    // Get previous period count
    const [previousPeriodResult] = await db
      .select({ count: count() })
      .from(mention)
      .where(
        and(
          gte(mention.date, previousPeriodStart),
          lt(mention.date, props.period.start)
        )
      );

    // Get sentiment counts
    const [sentimentCounts] = await db
      .select({
        positive: sql<number>`SUM(CASE WHEN ${mention.sentiment} = 'POSITIVE' THEN 1 ELSE 0 END)::int`,
        negative: sql<number>`SUM(CASE WHEN ${mention.sentiment} = 'NEGATIVE' THEN 1 ELSE 0 END)::int`,
        neutral: sql<number>`SUM(CASE WHEN ${mention.sentiment} = 'NEUTRAL' THEN 1 ELSE 0 END)::int`,
        rejected: sql<number>`SUM(CASE WHEN ${mention.isRejected} = true THEN 1 ELSE 0 END)::int`,
      })
      .from(mention)
      .where(
        and(
          gte(mention.date, props.period.start),
          lte(mention.date, props.period.end)
        )
      );

    // Get platform counts
    const platformCountsQuery = await db
      .select({
        platform: mention.platform,
        count: count(),
      })
      .from(mention)
      .where(
        and(
          gte(mention.date, props.period.start),
          lte(mention.date, props.period.end)
        )
      )
      .groupBy(mention.platform);

    return {
      period: {
        start: props.period.start.toISOString(),
        end: props.period.end.toISOString(),
      },
      currentCount: currentPeriodResult?.count ?? 0,
      previousCount: previousPeriodResult?.count ?? 0,
      positiveCount: sentimentCounts?.positive ?? 0,
      negativeCount: sentimentCounts?.negative ?? 0,
      neutralCount: sentimentCounts?.neutral ?? 0,
      rejectedCount: sentimentCounts?.rejected ?? 0,
      platforms: platformCountsQuery,
    };
  });

export const Route = createFileRoute("/_authed/(home)/")({
  loader: async () => {
    // tomorrow at 00:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    // 7 days ago at 00:00
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    return {
      mentions: await getNextMentions(),
      overviewPromise: getOverview({
        data: {
          period: {
            start: sevenDaysAgo,
            end: tomorrow,
          },
        },
      }),
    };
  },
  component: Dashboard,
});

const platformIcons = {
  X: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  YouTube: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
    </svg>
  ),
  Reddit: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm2 12c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2 2-.895 2-2zm-2-7c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-4 2c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1zm8 0c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1z" />
    </svg>
  ),
  Bluesky: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2.25c5.384 0 9.75 4.366 9.75 9.75s-4.366 9.75-9.75 9.75S2.25 17.384 2.25 12 6.616 2.25 12 2.25zm2.658 3.87A7.12 7.12 0 0 0 12 5.25a7.12 7.12 0 0 0-2.658.87.75.75 0 0 0-.252 1.054L12 12l2.91-4.826a.75.75 0 0 0-.252-1.054z" />
    </svg>
  ),
};

const sentimentIcons = {
  POSITIVE: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  ),
  NEUTRAL: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="8" y1="12" x2="16" y2="12"></line>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  ),
  NEGATIVE: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  ),
};

function Dashboard() {
  const { mentions, overviewPromise } = Route.useLoaderData();
  const [isScraping, setIsScraping] = useState(false);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      await fetch("/api/scrape");
    } catch (error) {
      console.error("Failed to trigger scrape:", error);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="flex gap-4 h-screen p-4">
      <div className="flex-1 min-w-96">
        <div className="mb-4">
          <Button
            onClick={handleScrape}
            disabled={isScraping}
            className="w-full"
          >
            {isScraping ? "Scraping..." : "Run Scraper"}
          </Button>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Await promise={overviewPromise}>
            {(overview) => {
              return <Overview {...overview} />;
            }}
          </Await>
        </Suspense>
      </div>
      <div className="flex-1">
        {mentions.map((mention) => (
          <Card key={mention.id}>
            <CardHeader>
              <CardTitle>{mention.username}</CardTitle>
              <CardDescription>{mention.content}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{mention.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
