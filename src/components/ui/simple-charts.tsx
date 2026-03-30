import { format } from "date-fns"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type ChartPoint = {
  label: string
  value: number
}

type BaseChartProps = {
  data: ChartPoint[]
  className?: string
  emptyLabel?: string
  showTime?: boolean
}

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function LineMiniChart({
  data,
  className,
  emptyLabel = "No data yet",
  showTime = false,
}: BaseChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground",
          className
        )}
      >
        {emptyLabel}
      </div>
    )
  }

  // Find min/max for better Y axis scaling
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const margin = (max - min) * 0.1 || 1

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto h-64 w-full", className)}
    >
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
          tickFormatter={(value) => {
            try {
              const date = new Date(value)
              if (showTime) {
                return format(date, "MM/dd HH:mm")
              }
              return format(date, "MM/dd")
            } catch {
              return value
            }
          }}
        />
        <YAxis
          hide
          domain={[min - margin, max + margin]}
          allowDecimals={true}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value) => {
                try {
                  return format(new Date(value), "yyyy-MM-dd HH:mm")
                } catch {
                  return value
                }
              }}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "var(--color-value)", strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
          animationDuration={1000}
        />
      </LineChart>
    </ChartContainer>
  )
}

export function BarMiniChart({
  data,
  className,
  emptyLabel = "No data yet",
  showTime = false,
}: BaseChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground",
          className
        )}
      >
        {emptyLabel}
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto h-64 w-full", className)}
    >
      <BarChart
        data={data}
        margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
          tickFormatter={(value) => {
            try {
              const date = new Date(value)
              if (showTime) {
                return format(date, "MM/dd HH:mm")
              }
              return format(date, "MM/dd")
            } catch {
              return value
            }
          }}
        />
        <YAxis domain={[0, (dataMax: number) => Math.max(dataMax + 1, 5)]} hide />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel={false}
              indicator="dashed"
              labelFormatter={(value) => {
                try {
                  return format(new Date(value), "yyyy-MM-dd")
                } catch {
                  return value
                }
              }}
            />
          }
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={[4, 4, 0, 0]}
          maxBarSize={45}
          animationDuration={1000}
        />
      </BarChart>
    </ChartContainer>
  )
}
