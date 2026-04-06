"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

interface TableExportButtonProps {
  data: Record<string, unknown>[]
  filename: string
  sheetName?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function TableExportButton({
  data,
  filename,
  sheetName = "Data",
  variant = "outline",
  size = "sm",
}: TableExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const downloadFile = (content: ArrayBuffer | string, name: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = async () => {
    if (data.length === 0) return
    setIsExporting(true)

    try {
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      // Auto-size columns
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, ...data.map(row => String(row[key] || "").length)) + 2
      }))
      worksheet["!cols"] = colWidths

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      downloadFile(
        excelBuffer,
        `${filename}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = async () => {
    if (data.length === 0) return
    setIsExporting(true)

    try {
      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(","),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header]
            const stringValue = String(value ?? "")
            if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          }).join(",")
        ),
      ]

      downloadFile(csvRows.join("\n"), `${filename}.csv`, "text/csv;charset=utf-8;")
    } finally {
      setIsExporting(false)
    }
  }

  if (data.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="mr-2 h-4 w-4" />
          CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
