"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Receipt,
  ArrowDownCircle,
  FolderOpen,
  History,
  Database,
} from "lucide-react"
import * as XLSX from "xlsx"

type DataType = "depenses" | "retraits" | "categories" | "logs" | "all"
type ExportFormat = "xlsx" | "csv"

interface ExportState {
  dataType: DataType
  format: ExportFormat
  isExporting: boolean
  error: string | null
  success: boolean
  exportedCount: number
}

const dataTypeConfig = {
  depenses: {
    label: "Dépenses",
    icon: Receipt,
    description: "Toutes vos dépenses avec date, montant, catégorie et désignation",
    columns: ["Date", "Désignation", "Montant", "Catégorie"],
  },
  retraits: {
    label: "Retraits",
    icon: ArrowDownCircle,
    description: "Tous vos retraits/revenus avec date, montant et motif",
    columns: ["Date", "Désignation", "Montant", "Motif"],
  },
  categories: {
    label: "Catégories",
    icon: FolderOpen,
    description: "Liste de toutes vos catégories de dépenses",
    columns: ["Nom", "Date de création"],
  },
  logs: {
    label: "Historique",
    icon: History,
    description: "Journal de toutes les actions effectuées dans l'application",
    columns: ["Date", "Action", "Table", "Détails"],
  },
  all: {
    label: "Toutes les données",
    icon: Database,
    description: "Export complet de toutes vos données (dépenses, retraits, catégories)",
    columns: [],
  },
}

export function DataExporter() {
  const [state, setState] = useState<ExportState>({
    dataType: "depenses",
    format: "xlsx",
    isExporting: false,
    error: null,
    success: false,
    exportedCount: 0,
  })

  const supabase = createClient()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const downloadFile = (data: ArrayBuffer | string, filename: string, mimeType: string) => {
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = (data: Record<string, unknown>[], sheetName: string, filename: string) => {
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
  }

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          // Escape quotes and wrap in quotes if contains comma or newline
          const stringValue = String(value ?? "")
          if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(",")
      ),
    ]
    
    downloadFile(csvRows.join("\n"), `${filename}.csv`, "text/csv;charset=utf-8;")
  }

  const handleExport = async () => {
    setState(prev => ({ ...prev, isExporting: true, error: null, success: false }))

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Utilisateur non connecté")

      const timestamp = new Date().toISOString().split("T")[0]
      let totalExported = 0

      if (state.dataType === "all") {
        // Export all data to separate sheets in one Excel file
        const workbook = XLSX.utils.book_new()

        // Dépenses
        const { data: depenses } = await supabase
          .from("depenses")
          .select("*, categories(nom)")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        if (depenses && depenses.length > 0) {
          const depensesData = depenses.map(d => ({
            Date: formatDate(d.date),
            Désignation: d.designation || "",
            Montant: d.montant,
            Catégorie: d.categories?.nom || "",
          }))
          const ws1 = XLSX.utils.json_to_sheet(depensesData)
          XLSX.utils.book_append_sheet(workbook, ws1, "Dépenses")
          totalExported += depenses.length
        }

        // Retraits
        const { data: retraits } = await supabase
          .from("retraits")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        if (retraits && retraits.length > 0) {
          const retraitsData = retraits.map(r => ({
            Date: formatDate(r.date),
            Désignation: r.designation || "",
            Montant: r.montant,
            Motif: r.motif || "",
          }))
          const ws2 = XLSX.utils.json_to_sheet(retraitsData)
          XLSX.utils.book_append_sheet(workbook, ws2, "Retraits")
          totalExported += retraits.length
        }

        // Catégories
        const { data: categories } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("nom")

        if (categories && categories.length > 0) {
          const categoriesData = categories.map(c => ({
            Nom: c.nom,
            "Date de création": formatDate(c.created_at),
          }))
          const ws3 = XLSX.utils.json_to_sheet(categoriesData)
          XLSX.utils.book_append_sheet(workbook, ws3, "Catégories")
          totalExported += categories.length
        }

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
        downloadFile(
          excelBuffer,
          `comptaflow_export_${timestamp}.xlsx`,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      } else {
        let data: Record<string, unknown>[] = []
        let filename = ""

        if (state.dataType === "depenses") {
          const { data: depenses, error } = await supabase
            .from("depenses")
            .select("*, categories(nom)")
            .eq("user_id", user.id)
            .order("date", { ascending: false })

          if (error) throw error

          data = (depenses || []).map(d => ({
            Date: formatDate(d.date),
            Désignation: d.designation || "",
            Montant: d.montant,
            Catégorie: d.categories?.nom || "",
          }))
          filename = `depenses_${timestamp}`
        } else if (state.dataType === "retraits") {
          const { data: retraits, error } = await supabase
            .from("retraits")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })

          if (error) throw error

          data = (retraits || []).map(r => ({
            Date: formatDate(r.date),
            Désignation: r.designation || "",
            Montant: r.montant,
            Motif: r.motif || "",
          }))
          filename = `retraits_${timestamp}`
        } else if (state.dataType === "categories") {
          const { data: categories, error } = await supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)
            .order("nom")

          if (error) throw error

          data = (categories || []).map(c => ({
            Nom: c.nom,
            "Date de création": formatDate(c.created_at),
          }))
          filename = `categories_${timestamp}`
        } else if (state.dataType === "logs") {
          const { data: logs, error } = await supabase
            .from("logs")
            .select("*")
            .eq("user_id", user.id)
            .order("timestamp", { ascending: false })

          if (error) throw error

          data = (logs || []).map(l => ({
            Date: formatDate(l.timestamp),
            Action: l.action,
            Table: l.table_concernee,
            Détails: JSON.stringify(l.details),
          }))
          filename = `historique_${timestamp}`
        }

        if (data.length === 0) {
          throw new Error("Aucune donnée à exporter")
        }

        totalExported = data.length

        if (state.format === "xlsx") {
          exportToExcel(data, dataTypeConfig[state.dataType].label, filename)
        } else {
          exportToCSV(data, filename)
        }
      }

      // Log the export action
      await supabase.from("logs").insert({
        user_id: user.id,
        action: "EXPORT",
        table_concernee: state.dataType,
        details: {
          format: state.format,
          count: totalExported,
        },
      })

      setState(prev => ({
        ...prev,
        isExporting: false,
        success: true,
        exportedCount: totalExported,
      }))

      // Reset success after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, success: false }))
      }, 3000)
    } catch (error) {
      console.error("Export error:", error)
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: error instanceof Error ? error.message : "Erreur lors de l'export",
      }))
    }
  }

  const config = dataTypeConfig[state.dataType]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter des données
          </CardTitle>
          <CardDescription>
            Téléchargez vos données au format Excel ou CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de données</label>
              <Select
                value={state.dataType}
                onValueChange={(value: DataType) =>
                  setState(prev => ({ ...prev, dataType: value, error: null }))
                }
                disabled={state.isExporting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="depenses">Dépenses</SelectItem>
                  <SelectItem value="retraits">Retraits</SelectItem>
                  <SelectItem value="categories">Catégories</SelectItem>
                  <SelectItem value="logs">Historique</SelectItem>
                  <SelectItem value="all">Toutes les données</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format d&apos;export</label>
              <Select
                value={state.format}
                onValueChange={(value: ExportFormat) =>
                  setState(prev => ({ ...prev, format: value }))
                }
                disabled={state.isExporting || state.dataType === "all"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV (.csv)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {state.dataType === "all" && (
                <p className="text-xs text-muted-foreground">
                  L&apos;export complet est uniquement disponible au format Excel
                </p>
              )}
            </div>
          </div>

          {/* Selected Data Info */}
          <Card className="bg-muted/50">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">{config.label}</h4>
                <p className="text-sm text-muted-foreground">{config.description}</p>
                {config.columns.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {config.columns.map(col => (
                      <Badge key={col} variant="secondary" className="text-xs">
                        {col}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Success */}
          {state.success && (
            <Alert className="border-accent/50 bg-accent/10">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <AlertTitle>Export réussi !</AlertTitle>
              <AlertDescription>
                {state.exportedCount} enregistrements ont été exportés avec succès.
              </AlertDescription>
            </Alert>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={state.isExporting}
            className="w-full sm:w-auto"
          >
            {state.isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exporter les {config.label.toLowerCase()}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Export Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["depenses", "retraits", "categories", "logs"] as const).map(type => {
          const typeConfig = dataTypeConfig[type]
          const TypeIcon = typeConfig.icon
          return (
            <Card
              key={type}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => {
                setState(prev => ({ ...prev, dataType: type, error: null }))
              }}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <TypeIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{typeConfig.label}</h4>
                  <p className="text-xs text-muted-foreground">Exporter en Excel/CSV</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
