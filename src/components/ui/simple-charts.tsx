type ChartPoint = {
  label: string
  value: number
}

type BaseChartProps = {
  data: ChartPoint[]
  className?: string
  emptyLabel?: string
}

type LineChartProps = BaseChartProps & {
  strokeClassName?: string
  areaClassName?: string
}

type BarChartProps = BaseChartProps & {
  barClassName?: string
}

function normalizeRange(min: number, max: number) {
  if (min === max) {
    return {
      min: min - 1,
      max: max + 1,
    }
  }

  return { min, max }
}

function linePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ")
}

export function LineMiniChart({
  data,
  className,
  emptyLabel = "No data yet",
  strokeClassName = "text-primary",
  areaClassName = "text-primary/10",
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className={className}>
        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      </div>
    )
  }

  const width = 360
  const height = 140
  const horizontalPadding = 16
  const verticalPadding = 14

  const values = data.map((item) => item.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const { min, max } = normalizeRange(rawMin, rawMax)

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? width / 2
        : horizontalPadding + (index * (width - horizontalPadding * 2)) / (data.length - 1)
    const y =
      height -
      verticalPadding -
      ((item.value - min) / (max - min)) * (height - verticalPadding * 2)

    return { x, y }
  })

  const areaPath = `${linePath(points)} L${points[points.length - 1]?.x},${height - verticalPadding} L${points[0]?.x},${height - verticalPadding} Z`

  return (
    <div className={className}>
      <div className="h-36 rounded-lg border bg-card/30 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="size-full" role="img" aria-label="line chart">
          <line
            x1={horizontalPadding}
            y1={height - verticalPadding}
            x2={width - horizontalPadding}
            y2={height - verticalPadding}
            className="stroke-border"
            strokeWidth="1"
          />
          <line
            x1={horizontalPadding}
            y1={verticalPadding}
            x2={horizontalPadding}
            y2={height - verticalPadding}
            className="stroke-border"
            strokeWidth="1"
          />

          <path d={areaPath} className={`fill-current ${areaClassName}`} />
          <path d={linePath(points)} className={`fill-none stroke-current ${strokeClassName}`} strokeWidth="2" />

          {points.map((point, index) => (
            <circle
              key={`${data[index]?.label}-${point.x}`}
              cx={point.x}
              cy={point.y}
              r="2.5"
              className={`fill-current ${strokeClassName}`}
            />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}

export function BarMiniChart({
  data,
  className,
  emptyLabel = "No data yet",
  barClassName = "bg-primary/75",
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className={className}>
        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className={className}>
      <div className="flex h-36 items-end gap-2 rounded-lg border bg-card/30 p-3">
        {data.map((item) => {
          const heightPercent = Math.max((item.value / maxValue) * 100, 6)

          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className={`w-full rounded-t-sm transition-all ${barClassName}`}
                style={{ height: `${heightPercent}%` }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="truncate text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
