"use client"

import { useMemo } from "react"
import { Thermometer, TrendingUp, TrendingDown, Activity } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WeatherStatsProps {
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

export function WeatherStats({ data }: WeatherStatsProps) {
  const stats = useMemo(() => {
    const temps = data.daily.temperature_2m_max.filter((t) => t !== null && t !== undefined)
    const minTemps = data.daily.temperature_2m_min.filter((t) => t !== null && t !== undefined)
    const meanTemps = data.daily.temperature_2m_mean.filter((t) => t !== null && t !== undefined)
    const apparentMaxTemps = data.daily.apparent_temperature_max.filter((t) => t !== null && t !== undefined)

    if (temps.length === 0) return null

    return {
      highestTemp: Math.max(...temps),
      lowestTemp: Math.min(...minTemps),
      avgTemp: meanTemps.reduce((a, b) => a + b, 0) / meanTemps.length,
      tempRange: Math.max(...temps) - Math.min(...minTemps),
      highestApparent: Math.max(...apparentMaxTemps),
      totalDays: data.daily.time.length,
    }
  }, [data])

  if (!stats) return null

  const statCards = [
    {
      title: "Highest Temperature",
      value: `${stats.highestTemp.toFixed(1)}°${data.daily_units.temperature_2m_max}`,
      icon: TrendingUp,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Lowest Temperature",
      value: `${stats.lowestTemp.toFixed(1)}°${data.daily_units.temperature_2m_min}`,
      icon: TrendingDown,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Average Temperature",
      value: `${stats.avgTemp.toFixed(1)}°${data.daily_units.temperature_2m_mean}`,
      icon: Thermometer,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Temperature Range",
      value: `${stats.tempRange.toFixed(1)}°${data.daily_units.temperature_2m_max}`,
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {index === 3 && (
              <Badge variant="outline" className="mt-2">
                {stats.totalDays} days analyzed
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
