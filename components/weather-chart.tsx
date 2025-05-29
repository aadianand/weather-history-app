"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { BarChart3, LineChartIcon, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface WeatherChartProps {
  data: {
    daily: {
      time: string[]
      temperature_2m_max: number[]
      temperature_2m_min: number[]
      temperature_2m_mean: number[]
      apparent_temperature_max: number[]
      apparent_temperature_min: number[]
      apparent_temperature_mean: number[]
    }
    daily_units: {
      temperature_2m_max: string
      temperature_2m_min: string
      temperature_2m_mean: string
      apparent_temperature_max: string
      apparent_temperature_min: string
      apparent_temperature_mean: string
    }
  }
}

export function WeatherChart({ data }: WeatherChartProps) {
  const [chartType, setChartType] = useState<"line" | "area">("line")

  // Process data for the chart
  const chartData = data.daily.time.map((date: string, index: number) => {
    return {
      date,
      formattedDate: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "Max Temp": data.daily.temperature_2m_max[index],
      "Min Temp": data.daily.temperature_2m_min[index],
      "Mean Temp": data.daily.temperature_2m_mean[index],
      "Max Apparent": data.daily.apparent_temperature_max[index],
      "Min Apparent": data.daily.apparent_temperature_min[index],
      "Mean Apparent": data.daily.apparent_temperature_mean[index],
    }
  })

  const chartConfig = {
    "Max Temp": {
      label: "Max Temperature",
      color: "#ef4444",
    },
    "Min Temp": {
      label: "Min Temperature",
      color: "#3b82f6",
    },
    "Mean Temp": {
      label: "Mean Temperature",
      color: "#10b981",
    },
    "Max Apparent": {
      label: "Max Apparent",
      color: "#f59e0b",
    },
    "Min Apparent": {
      label: "Min Apparent",
      color: "#8b5cf6",
    },
    "Mean Apparent": {
      label: "Mean Apparent",
      color: "#06b6d4",
    },
  }

  const renderChart = (dataKeys: string[], title: string) => {
    const ChartComponent = chartType === "line" ? LineChart : AreaChart

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="outline">{data.daily_units.temperature_2m_max}</Badge>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}°`} />
              <Legend />
              {dataKeys.map((key) => {
                if (chartType === "line") {
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={chartConfig[key as keyof typeof chartConfig]?.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )
                } else {
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={chartConfig[key as keyof typeof chartConfig]?.color}
                      fill={chartConfig[key as keyof typeof chartConfig]?.color}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  )
                }
              })}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart Type Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Chart Type:</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("line")}
            className="flex items-center gap-2"
          >
            <LineChartIcon className="h-4 w-4" />
            Line
          </Button>
          <Button
            variant={chartType === "area" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("area")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Area
          </Button>
        </div>
      </div>

      {/* Chart Tabs */}
      <Tabs defaultValue="temperature" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="apparent">Apparent Temperature</TabsTrigger>
          <TabsTrigger value="all">All Data</TabsTrigger>
        </TabsList>

        <TabsContent value="temperature" className="mt-6">
          <Card className="p-6">
            <CardContent className="p-0">
              {renderChart(["Max Temp", "Min Temp", "Mean Temp"], "Temperature Trends")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apparent" className="mt-6">
          <Card className="p-6">
            <CardContent className="p-0">
              {renderChart(["Max Apparent", "Min Apparent", "Mean Apparent"], "Apparent Temperature Trends")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <Card className="p-6">
            <CardContent className="p-0">
              {renderChart(
                ["Max Temp", "Min Temp", "Mean Temp", "Max Apparent", "Min Apparent", "Mean Apparent"],
                "All Temperature Data",
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
