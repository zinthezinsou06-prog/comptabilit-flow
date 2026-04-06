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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

type DataType = "depenses" | "retraits" | "categories" | "logs" | "all"
type ExportFormat = "xlsx" | "csv" | "pdf"

interface PDFCustomHeader {
  companyName: string
  subtitle: string
  address: string
  phone: string
  email: string
  logo: string
}

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
  
  const [showPdfDialog, setShowPdfDialog] = useState(false)
  const [pdfHeader, setPdfHeader] = useState<PDFCustomHeader>({
    companyName: "Mon Entreprise",
    subtitle: "Export de données",
    address: "",
    phone: "",
    email: "",
    logo: "",
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

  const exportToPDF = (data: Record<string, unknown>[], title: string) => {
    if (data.length === 0) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const headers = Object.keys(data[0])
    const headerContactInfo = [
      pdfHeader.address,
      pdfHeader.phone,
      pdfHeader.email,
    ].filter(Boolean).join(" | ")

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pdfHeader.companyName} - ${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { 
              border-bottom: 2px solid #333; 
              padding-bottom: 15px; 
              margin-bottom: 20px; 
            }
            .header-top {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .company-info h1 { 
              color: #333; 
              margin: 0; 
              font-size: 24px; 
            }
            .company-info h2 { 
              color: #666; 
              margin: 5px 0 0 0; 
              font-size: 16px; 
              font-weight: normal;
            }
            .contact-info { 
              color: #666; 
              font-size: 12px; 
              margin-top: 8px;
            }
            .logo img { 
              max-height: 60px; 
              max-width: 150px; 
            }
            .date-export { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 15px;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: bold; }
            .total-row { font-weight: bold; background: #f0f0f0; }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 11px;
              color: #999;
            }
            @media print { 
              body { padding: 0; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-top">
              <div class="company-info">
                <h1>${pdfHeader.companyName}</h1>
                <h2>${pdfHeader.subtitle} - ${title}</h2>
                ${headerContactInfo ? `<div class="contact-info">${headerContactInfo}</div>` : ""}
              </div>
              ${pdfHeader.logo ? `<div class="logo"><img src="${pdfHeader.logo}" alt="Logo" /></div>` : ""}
            </div>
          </div>
          
          <p class="date-export">Exporté le ${new Date().toLocaleDateString("fr-FR")} - ${data.length} enregistrement(s)</p>

          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(h => `<td>${String(row[h] ?? "-")}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}
            ${pdfHeader.companyName ? ` - ${pdfHeader.companyName}` : ""}
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    setShowPdfDialog(false)
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
        } else if (state.format === "csv") {
          exportToCSV(data, filename)
        } else if (state.format === "pdf") {
          exportToPDF(data, dataTypeConfig[state.dataType].label)
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
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      PDF (Personnalisable)
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

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2">
            {state.format === "pdf" && (
              <Button
                variant="outline"
                onClick={() => setShowPdfDialog(true)}
                disabled={state.isExporting}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Personnaliser l&apos;en-tête
              </Button>
            )}
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
          </div>
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

      {/* Dialog de personnalisation PDF */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Personnaliser l&apos;en-tête PDF
            </DialogTitle>
            <DialogDescription>
              Configurez l&apos;en-tête de votre document PDF avant l&apos;export.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Nom de l&apos;entreprise / Titre</Label>
              <Input
                id="companyName"
                value={pdfHeader.companyName}
                onChange={(e) => setPdfHeader(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Mon Entreprise"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Sous-titre du document</Label>
              <Input
                id="subtitle"
                value={pdfHeader.subtitle}
                onChange={(e) => setPdfHeader(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Export de données"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={pdfHeader.address}
                onChange={(e) => setPdfHeader(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Rue Example, 75000 Paris"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={pdfHeader.phone}
                  onChange={(e) => setPdfHeader(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={pdfHeader.email}
                  onChange={(e) => setPdfHeader(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="logo">URL du logo (optionnel)</Label>
              <Input
                id="logo"
                value={pdfHeader.logo}
                onChange={(e) => setPdfHeader(prev => ({ ...prev, logo: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Entrez l&apos;URL d&apos;une image pour l&apos;afficher en haut à droite du document.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPdfDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleExport}>
              <Printer className="mr-2 h-4 w-4" />
              Générer le PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
