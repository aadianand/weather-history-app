"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface WeatherTableProps {
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

export function WeatherTable({ data }: WeatherTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Process data for the table
  const tableData = useMemo(() => {
    return data.daily.time.map((date: string, index: number) => ({
      date,
      formattedDate: new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      temperature_2m_max: data.daily.temperature_2m_max[index],
      temperature_2m_min: data.daily.temperature_2m_min[index],
      temperature_2m_mean: data.daily.temperature_2m_mean[index],
      apparent_temperature_max: data.daily.apparent_temperature_max[index],
      apparent_temperature_min: data.daily.apparent_temperature_min[index],
      apparent_temperature_mean: data.daily.apparent_temperature_mean[index],
    }))
  }, [data])

  const totalPages = Math.ceil(tableData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentData = tableData.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number.parseInt(value))
    setCurrentPage(1) // Reset to first page
  }

  const exportToCSV = () => {
    const headers = [
      "Date",
      `Max Temp (${data.daily_units.temperature_2m_max})`,
      `Min Temp (${data.daily_units.temperature_2m_min})`,
      `Mean Temp (${data.daily_units.temperature_2m_mean})`,
      `Max Apparent (${data.daily_units.apparent_temperature_max})`,
      `Min Apparent (${data.daily_units.apparent_temperature_min})`,
      `Mean Apparent (${data.daily_units.apparent_temperature_mean})`,
    ]

    const csvContent = [
      headers.join(","),
      ...tableData.map((row) =>
        [
          row.date,
          row.temperature_2m_max,
          row.temperature_2m_min,
          row.temperature_2m_mean,
          row.apparent_temperature_max,
          row.apparent_temperature_min,
          row.apparent_temperature_mean,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `weather-data-${tableData[0]?.date}-to-${tableData[tableData.length - 1]?.date}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatTemperature = (value: number | null, unit: string) => {
    if (value === null || value === undefined) return "N/A"
    return `${value.toFixed(1)}°${unit}`
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rows per page:</span>
            <Select value={rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline">{tableData.length} total records</Badge>
        </div>
        <Button onClick={exportToCSV} variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-center">
                    Max Temp
                    <br />
                    <span className="text-xs text-muted-foreground">({data.daily_units.temperature_2m_max})</span>
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Min Temp
                    <br />
                    <span className="text-xs text-muted-foreground">({data.daily_units.temperature_2m_min})</span>
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Mean Temp
                    <br />
                    <span className="text-xs text-muted-foreground">({data.daily_units.temperature_2m_mean})</span>
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Max Apparent
                    <br />
                    <span className="text-xs text-muted-foreground">({data.daily_units.apparent_temperature_max})</span>
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Min Apparent
                    <br />
                    <span className="text-xs text-muted-foreground">({data.daily_units.apparent_temperature_min})</span>
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Mean Apparent
                    <br />
                    <span className="text-xs text-muted-foreground">
                      ({data.daily_units.apparent_temperature_mean})
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell className="font-medium">{row.formattedDate}</TableCell>
                    <TableCell className="text-center">
                      {formatTemperature(row.temperature_2m_max, data.daily_units.temperature_2m_max)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatTemperature(row.temperature_2m_min, data.daily_units.temperature_2m_min)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatTemperature(row.temperature_2m_mean, data.daily_units.temperature_2m_mean)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatTemperature(row.apparent_temperature_max, data.daily_units.apparent_temperature_max)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatTemperature(row.apparent_temperature_min, data.daily_units.apparent_temperature_min)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatTemperature(row.apparent_temperature_mean, data.daily_units.apparent_temperature_mean)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, tableData.length)} of {tableData.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => goToPage(1)} disabled={currentPage === 1}>
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <span className="text-sm font-medium px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
