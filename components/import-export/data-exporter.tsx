"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Settings2,
  Printer,
} from "lucide-react"
import * as XLSX from "xlsx"
import { useDocumentSettings } from "@/hooks/use-document-settings"
import { DocumentSettingsDialog } from "@/components/shared/document-settings-dialog"
import { buildPDFHtml, appendSignatureToSheet } from "@/lib/document-utils"

type DataType = "depenses" | "retraits" | "categories" | "logs" | "all"
type ExportFormat = "xlsx" | "csv" | "pdf"

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
    defaultFilename: "depenses",
  },
  retraits: {
    label: "Retraits",
    icon: ArrowDownCircle,
    description: "Tous vos retraits/revenus avec date, montant et motif",
    columns: ["Date", "Désignation", "Montant", "Motif"],
    defaultFilename: "retraits",
  },
  categories: {
    label: "Catégories",
    icon: FolderOpen,
    description: "Liste de toutes vos catégories de dépenses",
    columns: ["Nom", "Date de création"],
    defaultFilename: "categories",
  },
  logs: {
    label: "Historique",
    icon: History,
    description: "Journal de toutes les actions effectuées dans l'application",
    columns: ["Date", "Action", "Table", "Détails"],
    defaultFilename: "historique",
  },
  all: {
    label: "Toutes les données",
    icon: Database,
    description: "Export complet de toutes vos données (dépenses, retraits, catégories)",
    columns: [],
    defaultFilename: "export_complet",
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
  const [customFilename, setCustomFilename] = useState("")
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  const { settings } = useDocumentSettings()
  const supabase = createClient()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getFilename = () => {
    const timestamp = new Date().toISOString().split("T")[0]
    const base = customFilename.trim() || dataTypeConfig[state.dataType].defaultFilename
    return `${base}_${timestamp}`
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

    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || "").length)) + 2,
    }))
    worksheet["!cols"] = colWidths

    // Append signature block after data
    appendSignatureToSheet(worksheet, settings, data.length + 2)

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    downloadFile(
      excelBuffer,
      `${filename}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
  }

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header]
            const stringValue = String(value ?? "")
            if (
              stringValue.includes(",") ||
              stringValue.includes("\n") ||
              stringValue.includes('"')
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          })
          .join(","),
      ),
    ]

    // Append signature rows
    const { signature, header } = settings
    csvRows.push("")
    if (header.companyName) csvRows.push(`"${header.companyName}"`)
    if (signature.signatoryName) csvRows.push(`"Signataire: ${signature.signatoryName}"`)
    if (signature.signatoryTitle) csvRows.push(`"Fonction: ${signature.signatoryTitle}"`)
    if (signature.note) csvRows.push(`"${signature.note}"`)
    csvRows.push(`"Généré le: ${new Date().toLocaleDateString("fr-FR")}"`)

    downloadFile(csvRows.join("\n"), `${filename}.csv`, "text/csv;charset=utf-8;")
  }

  const exportToPDF = (data: Record<string, unknown>[], title: string, filename: string) => {
    if (data.length === 0) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const headers = Object.keys(data[0])
    const tableHtml = `
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${data
            .map(
              row =>
                `<tr>${headers.map(h => `<td>${String(row[h] ?? "-")}</td>`).join("")}</tr>`,
            )
            .join("")}
        </tbody>
      </table>`

    const html = buildPDFHtml(title, tableHtml, settings, data.length)
    printWindow.document.write(html)
    printWindow.document.close()
    // trigger download name via title
    void filename
  }

  const handleExport = async () => {
    setState(prev => ({ ...prev, isExporting: true, error: null, success: false }))

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Utilisateur non connecté")

      const filename = getFilename()
      let totalExported = 0

      if (state.dataType === "all") {
        const workbook = XLSX.utils.book_new()

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
          appendSignatureToSheet(ws1, settings, depensesData.length + 2)
          XLSX.utils.book_append_sheet(workbook, ws1, "Dépenses")
          totalExported += depenses.length
        }

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
          appendSignatureToSheet(ws2, settings, retraitsData.length + 2)
          XLSX.utils.book_append_sheet(workbook, ws2, "Retraits")
          totalExported += retraits.length
        }

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
          appendSignatureToSheet(ws3, settings, categoriesData.length + 2)
          XLSX.utils.book_append_sheet(workbook, ws3, "Catégories")
          totalExported += categories.length
        }

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
        downloadFile(
          excelBuffer,
          `${filename}.xlsx`,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
      } else {
        let data: Record<string, unknown>[] = []

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
        }

        if (data.length === 0) throw new Error("Aucune donnée à exporter")

        totalExported = data.length

        if (state.format === "xlsx") {
          exportToExcel(data, dataTypeConfig[state.dataType].label, filename)
        } else if (state.format === "csv") {
          exportToCSV(data, filename)
        } else if (state.format === "pdf") {
          exportToPDF(data, dataTypeConfig[state.dataType].label, filename)
        }
      }

      await supabase.from("logs").insert({
        user_id: user.id,
        action: "EXPORT",
        table_concernee: state.dataType,
        details: { format: state.format, count: totalExported, filename: getFilename() },
      })

      setState(prev => ({
        ...prev,
        isExporting: false,
        success: true,
        exportedCount: totalExported,
      }))

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
  const hasDocSettings = settings.header.companyName || settings.signature.signatoryName

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter des données
          </CardTitle>
          <CardDescription>
            Téléchargez vos données au format Excel, CSV ou PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document settings banner */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <div className="text-sm">
              {hasDocSettings ? (
                <span className="text-foreground">
                  En-tête : <span className="font-medium">{settings.header.companyName}</span>
                  {settings.signature.signatoryName && (
                    <> &mdash; Signataire : <span className="font-medium">{settings.signature.signatoryName}</span></>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">Aucun en-tête configuré (optionnel)</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsDialog(true)}
            >
              <Settings2 className="mr-2 h-4 w-4" />
              {hasDocSettings ? "Modifier" : "Configurer"}
            </Button>
          </div>

          {/* Data Type + Format */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de données</label>
              <Select
                value={state.dataType}
                onValueChange={(value: DataType) =>
                  setState(prev => ({
                    ...prev,
                    dataType: value,
                    error: null,
                    format: value === "all" ? "xlsx" : prev.format,
                  }))
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
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {state.dataType === "all" && (
                <p className="text-xs text-muted-foreground">
                  L&apos;export complet est uniquement disponible en Excel
                </p>
              )}
            </div>
          </div>

          {/* Custom filename */}
          <div className="space-y-2">
            <Label htmlFor="customFilename" className="text-sm font-medium">
              Nom du fichier (optionnel)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="customFilename"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder={dataTypeConfig[state.dataType].defaultFilename}
                disabled={state.isExporting}
                className="max-w-xs"
              />
              <span className="text-sm text-muted-foreground">
                _
                {new Date().toISOString().split("T")[0]}
                {state.format === "xlsx" ? ".xlsx" : state.format === "csv" ? ".csv" : ".pdf"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Laissez vide pour utiliser le nom par défaut.
            </p>
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
              onClick={() => setState(prev => ({ ...prev, dataType: type, error: null }))}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <TypeIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{typeConfig.label}</h4>
                  <p className="text-xs text-muted-foreground">Exporter en Excel/CSV/PDF</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Shared Document Settings Dialog */}
      <DocumentSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
    </div>
  )
}
