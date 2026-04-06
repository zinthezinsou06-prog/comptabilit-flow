"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, FileSpreadsheet, FileText, Settings2 } from "lucide-react"
import { useDocumentSettings } from "@/hooks/use-document-settings"
import { DocumentSettingsDialog } from "@/components/shared/document-settings-dialog"
import { buildPDFHtml } from "@/lib/document-utils"

interface Transaction {
  id: string
  montant: number
  date: string
  description?: string | null
  type: "depense" | "retrait"
  categories?: { nom: string } | null
  source?: string | null
}

interface ReportsExportProps {
  transactions: Transaction[]
  startDate: string
  endDate: string
  totalDepenses: number
  totalRetraits: number
  solde: number
}

export function ReportsExport({
  transactions,
  startDate,
  endDate,
  totalDepenses,
  totalRetraits,
  solde,
}: ReportsExportProps) {
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showFilenameDialog, setShowFilenameDialog] = useState(false)
  const [pendingFormat, setPendingFormat] = useState<"csv" | "pdf">("pdf")
  const [customFilename, setCustomFilename] = useState("")

  const { settings } = useDocumentSettings()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR")

  const defaultFilename = `rapport_${startDate}_${endDate}`

  const getFinalFilename = () =>
    (customFilename.trim() || defaultFilename)

  const triggerExport = (format: "csv" | "pdf") => {
    setPendingFormat(format)
    setCustomFilename("")
    setShowFilenameDialog(true)
  }

  function doExportCSV(filename: string) {
    const { signature, header } = settings
    const headers = ["Date", "Type", "Catégorie/Source", "Description", "Montant"]
    const rows = transactions.map(t => [
      formatDate(t.date),
      t.type === "depense" ? "Dépense" : "Retrait",
      t.type === "depense" ? t.categories?.nom || "" : t.source || "",
      t.description || "",
      t.type === "depense" ? `-${t.montant}` : `+${t.montant}`,
    ])

    rows.push([])
    rows.push(["", "", "", "Total Dépenses:", `-${totalDepenses}`])
    rows.push(["", "", "", "Total Retraits:", `+${totalRetraits}`])
    rows.push(["", "", "", "Solde:", solde.toString()])

    // Signature block
    rows.push([])
    if (header.companyName) rows.push([header.companyName])
    if (signature.signatoryName) rows.push([`Signataire: ${signature.signatoryName}`])
    if (signature.signatoryTitle) rows.push([`Fonction: ${signature.signatoryTitle}`])
    if (signature.note) rows.push([signature.note])
    rows.push([`Généré le: ${new Date().toLocaleDateString("fr-FR")}`])

    const csvContent = [headers, ...rows].map(row => row.join(";")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
  }

  function doExportPDF(filename: string) {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const summaryHtml = `
      <div class="summary-box">
        <div class="summary-row">
          <span>Période</span>
          <span>${formatDate(startDate)} &mdash; ${formatDate(endDate)}</span>
        </div>
        <div class="summary-row">
          <span>Total Dépenses</span>
          <span class="neg">${formatCurrency(totalDepenses)}</span>
        </div>
        <div class="summary-row">
          <span>Total Retraits</span>
          <span class="pos">${formatCurrency(totalRetraits)}</span>
        </div>
        <div class="summary-row total">
          <span>Solde</span>
          <span class="${solde >= 0 ? "pos" : "neg"}">${formatCurrency(solde)}</span>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Type</th><th>Catégorie / Source</th><th>Description</th><th>Montant</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              t => `
            <tr>
              <td>${formatDate(t.date)}</td>
              <td>${t.type === "depense" ? "Dépense" : "Retrait"}</td>
              <td>${t.type === "depense" ? t.categories?.nom || "-" : t.source || "-"}</td>
              <td>${t.description || "-"}</td>
              <td class="${t.type === "depense" ? "neg" : "pos"}">
                ${t.type === "depense" ? "-" : "+"}${formatCurrency(t.montant)}
              </td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>`

    const title = settings.header.subtitle || "Rapport Financier"
    const html = buildPDFHtml(title, summaryHtml, settings, transactions.length)
    printWindow.document.write(html)
    printWindow.document.close()
    void filename
  }

  const handleConfirmExport = () => {
    const filename = getFinalFilename()
    setShowFilenameDialog(false)
    if (pendingFormat === "csv") {
      doExportCSV(filename)
    } else {
      doExportPDF(filename)
    }
  }

  const hasDocSettings = settings.header.companyName || settings.signature.signatoryName

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettingsDialog(true)}
          title="Paramètres du document"
        >
          <Settings2 className="h-4 w-4" />
          {hasDocSettings && (
            <span className="ml-1 text-xs text-muted-foreground hidden sm:inline">
              {settings.header.companyName}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => triggerExport("csv")}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exporter en CSV (Excel)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => triggerExport("pdf")}>
              <FileText className="mr-2 h-4 w-4" />
              Exporter en PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
              <Settings2 className="mr-2 h-4 w-4" />
              Paramètres du document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filename Dialog */}
      <Dialog open={showFilenameDialog} onOpenChange={setShowFilenameDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              {pendingFormat === "pdf" ? "Exporter en PDF" : "Exporter en CSV"}
            </DialogTitle>
            <DialogDescription>
              Personnalisez le nom du fichier avant l&apos;export.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="reportFilename">Nom du fichier</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="reportFilename"
                  value={customFilename}
                  onChange={e => setCustomFilename(e.target.value)}
                  placeholder={defaultFilename}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  .{pendingFormat}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Laissez vide pour utiliser le nom par défaut.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilenameDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmExport}>
              {pendingFormat === "pdf" ? (
                <><FileText className="mr-2 h-4 w-4" />Générer le PDF</>
              ) : (
                <><FileSpreadsheet className="mr-2 h-4 w-4" />Télécharger CSV</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shared Document Settings Dialog */}
      <DocumentSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
    </>
  )
}
