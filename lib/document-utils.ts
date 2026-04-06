import type { DocumentSettings } from "@/hooks/use-document-settings"
import * as XLSX from "xlsx"

/** Generates a full printable HTML document string */
export function buildPDFHtml(
  title: string,
  bodyHtml: string,
  settings: DocumentSettings,
  recordCount?: number,
): string {
  const { header, signature } = settings
  const contactParts = [header.address, header.phone, header.email].filter(Boolean)
  const contactInfo = contactParts.join(" &nbsp;|&nbsp; ")

  const signatureHtml =
    signature.signatoryName || signature.signatoryTitle || signature.note
      ? `
        <div class="signature-block">
          <div class="signature-row">
            <div class="signatory-info">
              ${signature.signatoryName ? `<p class="signatory-name">${signature.signatoryName}</p>` : ""}
              ${signature.signatoryTitle ? `<p class="signatory-title">${signature.signatoryTitle}</p>` : ""}
            </div>
            <div class="signature-box">
              <p class="signature-label">Signature</p>
              <div class="signature-line"></div>
            </div>
          </div>
          ${signature.note ? `<p class="signature-note">${signature.note}</p>` : ""}
        </div>`
      : ""

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>${header.companyName ? `${header.companyName} - ` : ""}${title}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 24px; }
      .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a1a1a; padding-bottom: 14px; margin-bottom: 18px; }
      .company-name { font-size: 22px; font-weight: 700; color: #1a1a1a; }
      .doc-subtitle { font-size: 14px; color: #555; margin-top: 4px; }
      .contact-info { font-size: 11px; color: #666; margin-top: 6px; line-height: 1.6; }
      .logo img { max-height: 64px; max-width: 160px; object-fit: contain; }
      .doc-meta { font-size: 12px; color: #666; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
      th { background: #f2f2f2; font-weight: 600; text-align: left; padding: 8px 10px; border-bottom: 2px solid #ccc; }
      td { padding: 7px 10px; border-bottom: 1px solid #e5e5e5; }
      tr:hover td { background: #fafafa; }
      .summary-box { background: #f7f7f7; border: 1px solid #e5e5e5; border-radius: 6px; padding: 14px 16px; margin: 16px 0; }
      .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
      .summary-row.total { font-weight: 700; border-top: 1px solid #ccc; margin-top: 6px; padding-top: 8px; }
      .neg { color: #dc2626; }
      .pos { color: #16a34a; }
      /* Signature */
      .signature-block { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ccc; }
      .signature-row { display: flex; justify-content: space-between; align-items: flex-end; }
      .signatory-name { font-weight: 700; font-size: 13px; }
      .signatory-title { font-size: 11px; color: #666; margin-top: 2px; }
      .signature-box { text-align: center; }
      .signature-label { font-size: 11px; color: #999; margin-bottom: 24px; }
      .signature-line { width: 140px; border-bottom: 1px solid #999; }
      .signature-note { font-size: 10px; color: #999; font-style: italic; margin-top: 12px; }
      .doc-footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 10px; color: #aaa; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <div class="doc-header">
      <div>
        ${header.companyName ? `<div class="company-name">${header.companyName}</div>` : ""}
        ${header.subtitle ? `<div class="doc-subtitle">${header.subtitle}${title !== header.subtitle ? ` &mdash; ${title}` : ""}</div>` : `<div class="doc-subtitle">${title}</div>`}
        ${contactInfo ? `<div class="contact-info">${contactInfo}</div>` : ""}
      </div>
      ${header.logo ? `<div class="logo"><img src="${header.logo}" alt="Logo" /></div>` : ""}
    </div>

    <p class="doc-meta">
      Exporté le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}
      ${recordCount !== undefined ? ` &mdash; ${recordCount} enregistrement(s)` : ""}
    </p>

    ${bodyHtml}

    ${signatureHtml}

    <div class="doc-footer">
      ${header.companyName ? `${header.companyName} &mdash; ` : ""}Document généré par ComptaFlow
    </div>

    <script>window.onload = function () { window.print() }</script>
  </body>
</html>`
}

/** Appends a signature block to an XLSX workbook sheet */
export function appendSignatureToSheet(
  worksheet: XLSX.WorkSheet,
  settings: DocumentSettings,
  startRow: number,
): void {
  const { header, signature } = settings

  // Blank separator row
  const blankRow: Record<string, unknown> = {}
  XLSX.utils.sheet_add_json(worksheet, [blankRow], { skipHeader: true, origin: startRow })
  startRow++

  // Header row with company name
  if (header.companyName) {
    XLSX.utils.sheet_add_aoa(worksheet, [[header.companyName]], { origin: startRow })
    startRow++
  }

  // Signature line
  if (signature.signatoryName || signature.signatoryTitle) {
    XLSX.utils.sheet_add_aoa(worksheet, [["Signataire:", signature.signatoryName || ""]], { origin: startRow })
    startRow++
    if (signature.signatoryTitle) {
      XLSX.utils.sheet_add_aoa(worksheet, [["Fonction:", signature.signatoryTitle]], { origin: startRow })
      startRow++
    }
  }

  // Note
  if (signature.note) {
    XLSX.utils.sheet_add_aoa(worksheet, [["Note:", signature.note]], { origin: startRow })
    startRow++
  }

  // Generation date
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [[`Généré le: ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`]],
    { origin: startRow },
  )
}
