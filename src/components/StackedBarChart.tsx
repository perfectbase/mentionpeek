import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// Mock data for the bar chart
const mockData = [
  { month: "Jan", mentions: 100 },
  { month: "Feb", mentions: 115 },
  { month: "Mar", mentions: 80 },
  { month: "Apr", mentions: 135 },
  { month: "May", mentions: 110 },
  { month: "Jun", mentions: 140 },
];

// Chart configuration
const chartConfig: ChartConfig = {
  mentions: {
    label: "Mentions",
    color: "#FFFFFF",
  },
};

export function StackedBarChart() {
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-normal text-muted-foreground">
          Mentions Over Time
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="w-full h-72">
          <BarChart
            accessibilityLayer
            data={mockData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="mentions" fill="var(--color-chart-1)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
