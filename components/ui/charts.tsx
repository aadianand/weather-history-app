"use client"

import * as React from "react"
import type { TooltipProps, LegendProps } from "recharts"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  const style = React.useMemo(() => {
    return Object.entries(config).reduce(
      (acc, [key, value]) => {
        acc[`--color-${key}`] = value.color
        return acc
      },
      {} as Record<string, string>
    )
  }, [config])

  return (
    <div className={cn("chart-container", className)} style={style} {...props}>
      {children}
    </div>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color?: string
    payload: {
      [key: string]: unknown
    }
  }>
  label?: string
  formatter?: (value: number, name: string, props: unknown) => React.ReactNode
  labelFormatter?: (label: string, payload: unknown[]) => React.ReactNode
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="grid gap-2">
        <div className="font-medium">
          {labelFormatter ? labelFormatter(label as string, payload) : label}
        </div>
        <div className="grid gap-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: (entry.payload?.color as string) || `var(--color-${entry.name})`,
                  }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}:</span>
              </div>
              <div className="text-sm font-medium">
                {formatter ? formatter(entry.value, entry.name, entry) : entry.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChartTooltip(props: TooltipProps<number, string>) {
  const { active, payload, label, formatter, labelFormatter } = props

  const transformedPayload = payload?.map((item) => ({
    name: item.name ?? "",
    value: item.value ?? 0,
    color: item.color,
    payload: item.payload ?? {},
  }))

  const adaptedFormatter =
    formatter &&
    ((value: number, name: string, entry: unknown) =>
      formatter(value, name, entry, 0, payload || []))

  return (
    <ChartTooltipContent
      active={active}
      payload={transformedPayload}
      label={label}
      formatter={adaptedFormatter}
      labelFormatter={labelFormatter}
    />
  )
}

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        return (
          <div
            key={item.value}
            className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
          >
            {!hideIcon ? (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            ) : null}
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegend"

export { ChartLegend, ChartLegendContent }
