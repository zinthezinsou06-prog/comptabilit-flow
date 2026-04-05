"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText } from "lucide-react"

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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  function exportToCSV() {
    const headers = ["Date", "Type", "Catégorie/Source", "Description", "Montant"]
    const rows = transactions.map((t) => [
      formatDate(t.date),
      t.type === "depense" ? "Dépense" : "Retrait",
      t.type === "depense" ? t.categories?.nom || "" : t.source || "",
      t.description || "",
      t.type === "depense" ? `-${t.montant}` : `+${t.montant}`,
    ])

    // Add summary
    rows.push([])
    rows.push(["", "", "", "Total Dépenses:", `-${totalDepenses}`])
    rows.push(["", "", "", "Total Retraits:", `+${totalRetraits}`])
    rows.push(["", "", "", "Solde:", solde.toString()])

    const csvContent = [headers, ...rows].map((row) => row.join(";")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `rapport_${startDate}_${endDate}.csv`
    link.click()
  }

  function exportToPDF() {
    // Create a printable HTML version
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport ComptaFlow</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
            .summary-item { display: flex; justify-content: space-between; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .depense { color: #dc2626; }
            .retrait { color: #16a34a; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Rapport Financier</h1>
          <p>Période: ${formatDate(startDate)} - ${formatDate(endDate)}</p>
          
          <div class="summary">
            <div class="summary-item">
              <span>Total Dépenses:</span>
              <span class="depense">${formatCurrency(totalDepenses)}</span>
            </div>
            <div class="summary-item">
              <span>Total Retraits:</span>
              <span class="retrait">${formatCurrency(totalRetraits)}</span>
            </div>
            <div class="summary-item">
              <strong>Solde:</strong>
              <strong class="${solde >= 0 ? "retrait" : "depense"}">${formatCurrency(solde)}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Catégorie/Source</th>
                <th>Description</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              ${transactions
                .map(
                  (t) => `
                <tr>
                  <td>${formatDate(t.date)}</td>
                  <td>${t.type === "depense" ? "Dépense" : "Retrait"}</td>
                  <td>${t.type === "depense" ? t.categories?.nom || "-" : t.source || "-"}</td>
                  <td>${t.description || "-"}</td>
                  <td class="${t.type === "depense" ? "depense" : "retrait"}">
                    ${t.type === "depense" ? "-" : "+"}${formatCurrency(t.montant)}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exporter en CSV (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Exporter en PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
