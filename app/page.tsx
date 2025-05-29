"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { format, addDays, differenceInDays } from "date-fns"
import { CalendarIcon, Loader2, AlertCircle, MapPin, TrendingUp } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { WeatherChart } from "@/components/weather-chart"
import { WeatherTable } from "@/components/weather-table"
import { WeatherStats } from "@/components/weather-stats"
import { cn } from "@/lib/utils"

interface WeatherData {
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
  latitude: number
  longitude: number
  timezone: string
}

export default function WeatherDashboard() {
  const [latitude, setLatitude] = useState("40.7128")
  const [longitude, setLongitude] = useState("-74.0060")
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: addDays(new Date(), -1),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [lastFetchParams, setLastFetchParams] = useState<string | null>(null)

  // Input validation
  const isValidLatitude = useMemo(() => {
    const lat = Number.parseFloat(latitude)
    return !isNaN(lat) && lat >= -90 && lat <= 90
  }, [latitude])

  const isValidLongitude = useMemo(() => {
    const lng = Number.parseFloat(longitude)
    return !isNaN(lng) && lng >= -180 && lng <= 180
  }, [longitude])

  const isValidDateRange = useMemo(() => {
    if (!date?.from || !date?.to) return false
    const daysDiff = differenceInDays(date.to, date.from)
    return daysDiff >= 0 && daysDiff <= 366 // Max 1 year
  }, [date])

  const canFetchData = useMemo(() => {
    return isValidLatitude && isValidLongitude && isValidDateRange && latitude && longitude
  }, [isValidLatitude, isValidLongitude, isValidDateRange, latitude, longitude])

  const handleLatitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (
      value === "" ||
      value === "-" ||
      (!isNaN(Number.parseFloat(value)) && Number.parseFloat(value) >= -90 && Number.parseFloat(value) <= 90)
    ) {
      setLatitude(value)
    }
  }, [])

  const handleLongitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (
      value === "" ||
      value === "-" ||
      (!isNaN(Number.parseFloat(value)) && Number.parseFloat(value) >= -180 && Number.parseFloat(value) <= 180)
    ) {
      setLongitude(value)
    }
  }, [])

  const fetchWeatherData = useCallback(async () => {
    if (!canFetchData || !date?.from || !date?.to) {
      setError("Please fill in all fields with valid values")
      return
    }

    const startDate = format(date.from, "yyyy-MM-dd")
    const endDate = format(date.to, "yyyy-MM-dd")
    const currentParams = `${latitude},${longitude},${startDate},${endDate}`

    // Avoid duplicate API calls
    if (currentParams === lastFetchParams) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,apparent_temperature_max,apparent_temperature_min,apparent_temperature_mean&timezone=auto`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        setError(data.reason || "Failed to fetch weather data")
        setWeatherData(null)
      } else {
        // Validate data completeness
        if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
          setError("No weather data available for the selected period")
          setWeatherData(null)
        } else {
          setWeatherData(data)
          setLastFetchParams(currentParams)
        }
      }
    } catch (err) {
      console.error("Weather API Error:", err)
      setError("Failed to fetch weather data. Please check your internet connection and try again.")
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }, [canFetchData, date, latitude, longitude, lastFetchParams])

  const locationName = useMemo(() => {
    if (!weatherData) return null
    return `${Number.parseFloat(latitude).toFixed(4)}°, ${Number.parseFloat(longitude).toFixed(4)}°`
  }, [weatherData, latitude, longitude])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Weather History Dashboard
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore historical weather patterns with interactive charts and detailed data analysis
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">Location & Date Selection</CardTitle>
            </div>
            <CardDescription>
              Enter coordinates and select a date range to fetch historical weather data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Latitude Input */}
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-sm font-medium">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  placeholder="e.g., 40.7128"
                  value={latitude}
                  onChange={handleLatitudeChange}
                  className={cn(
                    "transition-colors",
                    !isValidLatitude && latitude ? "border-red-500 focus:border-red-500" : "",
                  )}
                />
                <p className="text-xs text-slate-500">Range: -90 to 90</p>
                {!isValidLatitude && latitude && <p className="text-xs text-red-500">Invalid latitude</p>}
              </div>

              {/* Longitude Input */}
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-sm font-medium">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  placeholder="e.g., -74.0060"
                  value={longitude}
                  onChange={handleLongitudeChange}
                  className={cn(
                    "transition-colors",
                    !isValidLongitude && longitude ? "border-red-500 focus:border-red-500" : "",
                  )}
                />
                <p className="text-xs text-slate-500">Range: -180 to 180</p>
                {!isValidLongitude && longitude && <p className="text-xs text-red-500">Invalid longitude</p>}
              </div>

              {/* Date Range Picker */}
              <div className="space-y-2 lg:col-span-2">
                <Label className="text-sm font-medium">Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      disabled={(date) => date > new Date() || date < new Date("1940-01-01")}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-slate-500">Maximum range: 1 year</p>
                {!isValidDateRange && date?.from && date?.to && (
                  <p className="text-xs text-red-500">Invalid date range</p>
                )}
              </div>
            </div>

            {/* Fetch Button */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={fetchWeatherData}
                disabled={loading || !canFetchData}
                size="lg"
                className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Data...
                  </>
                ) : (
                  "Fetch Weather Data"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Weather Data Display */}
        {weatherData && (
          <div className="space-y-8">
            {/* Location Info */}
            <Card className="border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Weather Data Retrieved</h2>
                    <p className="text-blue-100">
                      Location: {locationName} • Timezone: {weatherData.timezone}
                    </p>
                    <p className="text-blue-100">
                      Period: {format(date?.from as Date, "MMM dd, yyyy")} - {format(date?.to as Date, "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {weatherData.daily.time.length} days of data
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weather Statistics */}
            <WeatherStats data={weatherData} />

            {/* Weather Chart */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Weather Trends
                </CardTitle>
                <CardDescription>Interactive visualization of temperature patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <WeatherChart data={weatherData} />
              </CardContent>
            </Card>

            {/* Weather Table */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Detailed Weather Data</CardTitle>
                <CardDescription>Complete daily weather measurements with pagination</CardDescription>
              </CardHeader>
              <CardContent>
                <WeatherTable data={weatherData} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
