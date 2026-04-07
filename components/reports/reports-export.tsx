import { useSettings } from "@/components/providers/settings-provider"

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
  const { settings, t } = useSettings()

  const formatCurrency = (amount: number) => {
    const isStandard = settings.currency === "€" || settings.currency === "$" || settings.currency?.length === 3
    
    if (isStandard) {
      const currencyCode = settings.currency === "€" ? "EUR" : settings.currency === "$" ? "USD" : settings.currency
      try {
        return new Intl.NumberFormat(settings.language === "en" ? "en-US" : "fr-FR", {
          style: "currency",
          currency: currencyCode,
        }).format(amount)
      } catch {
        // Fallback below
      }
    }
    
    // Custom fallback for symbols like FCFA
    const formattedAmount = new Intl.NumberFormat(settings.language === "en" ? "en-US" : "fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    
    return settings.language === "en" 
      ? `${settings.currency} ${formattedAmount}` 
      : `${formattedAmount} ${settings.currency}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(settings.language === "en" ? "en-US" : "fr-FR")
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
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport ComptaFlow - ${settings.export_header}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            body { 
              font-family: 'Inter', -apple-system, sans-serif; 
              color: #1a1a1a;
              line-height: 1.5;
              margin: 0;
              padding: 40px;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .brand-section h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 800;
              color: #2563eb;
              letter-spacing: -0.025em;
            }
            
            .brand-section p {
              margin: 4px 0 0;
              color: #6b7280;
              font-size: 14px;
            }
            
            .company-section {
              text-align: right;
            }
            
            .company-name {
              font-weight: 700;
              font-size: 18px;
              margin: 0;
            }
            
            .report-info {
              color: #6b7280;
              font-size: 14px;
              margin: 4px 0 0;
            }
            
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 40px;
            }
            
            .card {
              padding: 16px;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              background: #f9fafb;
            }
            
            .card-label {
              font-size: 12px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 8px;
              display: block;
            }
            
            .card-value {
              font-size: 20px;
              font-weight: 700;
            }
            
            .value-negative { color: #dc2626; }
            .value-positive { color: #16a34a; }
            
            table { 
              width: 100%; 
              border-collapse: separate; 
              border-spacing: 0;
              margin-top: 20px; 
            }
            
            th { 
              background: #f3f4f6;
              padding: 12px; 
              text-align: left; 
              font-size: 12px;
              font-weight: 600;
              color: #4b5563;
              text-transform: uppercase;
              border-bottom: 1px solid #e5e7eb;
            }
            
            td { 
              padding: 12px; 
              font-size: 14px;
              border-bottom: 1px solid #e5e7eb; 
            }
            
            tr:nth-child(even) { background: #fcfcfc; }
            
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
              border-top: 1px solid #f3f4f6;
              padding-top: 20px;
            }
            
            @media print {
              body { padding: 0; }
              .card { background: #fff !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-section">
              <h1>ComptaFlow</h1>
              <p>Logiciel de Gestion Comptable</p>
            </div>
            <div class="company-section">
              <p class="company-name">${settings.export_header}</p>
              <p class="report-info">Rapport Financier: ${formatDate(startDate)} - ${formatDate(endDate)}</p>
            </div>
          </div>
          
          <div class="summary-cards">
            <div class="card">
              <span class="card-label">Total Dépenses</span>
              <span class="card-value value-negative">-${formatCurrency(totalDepenses)}</span>
            </div>
            <div class="card">
              <span class="card-label">Total Retraits</span>
              <span class="card-value value-positive">+${formatCurrency(totalRetraits)}</span>
            </div>
            <div class="card">
              <span class="card-label">Solde Final</span>
              <span class="card-value ${solde >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(solde)}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Catégorie / Source</th>
                <th>Description</th>
                <th style="text-align: right">Montant</th>
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
                  <td style="text-align: right" class="${t.type === "depense" ? "value-negative" : "value-positive"}">
                    ${t.type === "depense" ? "-" : "+"}${formatCurrency(t.montant)}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>${settings.export_footer}</p>
            <p>&copy; ${new Date().getFullYear()} ComptaFlow. Tous droits réservés.</p>
          </div>

          <script>
            window.onload = function() { 
              setTimeout(() => {
                window.print(); 
                window.onafterprint = function() { window.close(); }
              }, 500);
            }
          </script>
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
          {t("reports.export") || "Exporter"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {t("reports.export_csv") || "Exporter en CSV (Excel)"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          {t("reports.export_pdf") || "Exporter en PDF"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
