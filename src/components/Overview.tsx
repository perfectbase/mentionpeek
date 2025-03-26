import { type Platform } from "~/server/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { ArrowDownIcon } from "lucide-react";
import { ArrowUpIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { StackedBarChart } from "~/components/StackedBarChart";

export function Overview(props: {
  period: {
    start: string;
    end: string;
  };
  currentCount: number;
  previousCount: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  rejectedCount: number;
  platforms: {
    platform: Platform;
    count: number;
  }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <StatCard title="Searches" value={8} previousValue={8} />
      <StatCard title="Search Time" value={20} previousValue={20} />
      <StatCard
        title="Mentions"
        value={props.currentCount}
        previousValue={props.previousCount}
      />
      <StatCard title="Positive Mentions" value={props.positiveCount} />
      {props.platforms.length > 0 && (
        <div className="col-span-full">
          <PlatformDistributionChart platforms={props.platforms} />
        </div>
      )}
      <div className="col-span-full">
        <StackedBarChart />
      </div>
    </div>
  );
}

function PlatformDistributionChart({
  platforms,
}: {
  platforms: {
    platform: Platform;
    count: number;
  }[];
}) {
  // Platform-specific colors
  const PLATFORM_COLORS: Record<Platform, string> = {
    X: "#1DA1F2", // Twitter blue
    YouTube: "#FF0000", // YouTube red
    Reddit: "#FF5700", // Reddit orange
    Bluesky: "#1D9BF0", // Bluesky blue
  };

  // Transform the platform data for the pie chart to include a name property
  const platformData = platforms.map((item) => ({
    name: item.platform,
    count: item.count,
    platform: item.platform,
    color: PLATFORM_COLORS[item.platform],
  }));

  // Create chart config for the custom chart components
  const chartConfig: ChartConfig = {
    X: {
      label: "X",
      color: PLATFORM_COLORS.X,
    },
    YouTube: {
      label: "YouTube",
      color: PLATFORM_COLORS.YouTube,
    },
    Reddit: {
      label: "Reddit",
      color: PLATFORM_COLORS.Reddit,
    },
    Bluesky: {
      label: "Bluesky",
      color: PLATFORM_COLORS.Bluesky,
    },
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-normal text-muted-foreground">
          Mention Distribution by Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="w-full h-48">
          <PieChart>
            <ChartLegend
              content={<ChartLegendContent />}
              layout="vertical"
              align="left"
              verticalAlign="middle"
            />
            <Pie
              data={platformData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={70}
              fill="#8884d8"
              dataKey="count"
              nameKey="name"
              animationDuration={500}
            >
              {platformData.map((entry) => (
                <Cell key={`cell-${entry.platform}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent nameKey="platform" indicator="dot" />
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  value,
  previousValue,
  className,
}: {
  title: string;
  value: number;
  previousValue?: number;
  className?: string;
}) {
  const increaseRate =
    previousValue !== undefined && previousValue !== 0
      ? ((value - previousValue) / previousValue) * 100
      : 0;
  const isPositive = increaseRate >= 0;

  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader>
        <CardTitle className="text-base font-normal text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">{value}</div>
          {previousValue !== undefined && previousValue !== 0 && (
            <div
              className={cn(
                "flex items-center gap-1",
                isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {isPositive ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <div className="text-sm">
                {previousValue !== undefined && previousValue !== 0
                  ? Math.abs(increaseRate).toFixed(0)
                  : "N/A"}
                %
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
