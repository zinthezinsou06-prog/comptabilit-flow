"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileSpreadsheet, FileText, Settings2 } from "lucide-react"

interface Transaction {
  id: string
  montant: number
  date: string
  description?: string | null
  type: "depense" | "retrait"
  categories?: { nom: string } | null
  source?: string | null
}

interface PDFCustomHeader {
  companyName: string
  subtitle: string
  address: string
  phone: string
  email: string
  logo: string
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
  const [showPdfDialog, setShowPdfDialog] = useState(false)
  const [pdfHeader, setPdfHeader] = useState<PDFCustomHeader>({
    companyName: "Mon Entreprise",
    subtitle: "Rapport Financier",
    address: "",
    phone: "",
    email: "",
    logo: "",
  })

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

    const headerContactInfo = [
      pdfHeader.address,
      pdfHeader.phone,
      pdfHeader.email,
    ].filter(Boolean).join(" | ")

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pdfHeader.companyName} - ${pdfHeader.subtitle}</title>
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
            .period { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 15px;
            }
            .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
            .summary-item { display: flex; justify-content: space-between; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .depense { color: #dc2626; }
            .retrait { color: #16a34a; }
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
                <h2>${pdfHeader.subtitle}</h2>
                ${headerContactInfo ? `<div class="contact-info">${headerContactInfo}</div>` : ""}
              </div>
              ${pdfHeader.logo ? `<div class="logo"><img src="${pdfHeader.logo}" alt="Logo" /></div>` : ""}
            </div>
          </div>
          
          <p class="period">Période: ${formatDate(startDate)} - ${formatDate(endDate)}</p>
          
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

  return (
    <>
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
          <DropdownMenuItem onClick={() => setShowPdfDialog(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Exporter en PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
                placeholder="Rapport Financier"
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
            <Button onClick={exportToPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Générer le PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
