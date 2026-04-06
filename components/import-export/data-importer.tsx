"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  Info,
} from "lucide-react"
import * as XLSX from "xlsx"

type DataType = "depenses" | "retraits" | "categories"

interface ParsedRow {
  [key: string]: string | number | null
}

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ImportState {
  file: File | null
  dataType: DataType
  parsedData: ParsedRow[]
  headers: string[]
  validationErrors: ValidationError[]
  isLoading: boolean
  isParsing: boolean
  isImporting: boolean
  importProgress: number
  importedCount: number
  step: "select" | "preview" | "importing" | "complete"
}

const dataTypeConfig = {
  depenses: {
    label: "Dépenses",
    requiredFields: ["date", "montant"],
    optionalFields: ["designation", "categorie"],
    example: [
      { date: "2024-01-15", designation: "Courses supermarché", montant: "85.50", categorie: "Alimentation" },
      { date: "2024-01-16", designation: "Essence", montant: "65.00", categorie: "Transport" },
    ],
  },
  retraits: {
    label: "Retraits",
    requiredFields: ["date", "montant"],
    optionalFields: ["designation", "motif"],
    example: [
      { date: "2024-01-01", designation: "Salaire janvier", motant: "2500.00", motif: "Salaire" },
      { date: "2024-01-15", designation: "Remboursement", montant: "150.00", motif: "Assurance" },
    ],
  },
  categories: {
    label: "Catégories",
    requiredFields: ["nom"],
    optionalFields: [],
    example: [
      { nom: "Alimentation" },
      { nom: "Transport" },
      { nom: "Loisirs" },
    ],
  },
}

export function DataImporter() {
  const [state, setState] = useState<ImportState>({
    file: null,
    dataType: "depenses",
    parsedData: [],
    headers: [],
    validationErrors: [],
    isLoading: false,
    isParsing: false,
    isImporting: false,
    importProgress: 0,
    importedCount: 0,
    step: "select",
  })

  const resetState = () => {
    setState({
      file: null,
      dataType: "depenses",
      parsedData: [],
      headers: [],
      validationErrors: [],
      isLoading: false,
      isParsing: false,
      isImporting: false,
      importProgress: 0,
      importedCount: 0,
      step: "select",
    })
  }

  const parseFile = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isParsing: true }))

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet, { raw: false })
      
      if (jsonData.length === 0) {
        throw new Error("Le fichier est vide ou ne contient pas de données valides")
      }

      const headers = Object.keys(jsonData[0] || {})

      setState(prev => ({
        ...prev,
        parsedData: jsonData,
        headers,
        isParsing: false,
        step: "preview",
      }))

      // Validate data
      validateData(jsonData, state.dataType)
    } catch (error) {
      console.error("Error parsing file:", error)
      setState(prev => ({
        ...prev,
        isParsing: false,
        validationErrors: [{
          row: 0,
          field: "file",
          message: error instanceof Error ? error.message : "Erreur lors de la lecture du fichier",
        }],
      }))
    }
  }, [state.dataType])

  const validateData = (data: ParsedRow[], dataType: DataType) => {
    const config = dataTypeConfig[dataType]
    const errors: ValidationError[] = []

    data.forEach((row, index) => {
      // Check required fields
      config.requiredFields.forEach(field => {
        const value = row[field]
        if (value === undefined || value === null || value === "") {
          errors.push({
            row: index + 2, // +2 because of header row and 0-index
            field,
            message: `Le champ "${field}" est requis`,
          })
        }
      })

      // Validate montant is a number
      if (row.montant !== undefined) {
        const montant = parseFloat(String(row.montant).replace(",", "."))
        if (isNaN(montant) || montant < 0) {
          errors.push({
            row: index + 2,
            field: "montant",
            message: "Le montant doit être un nombre positif",
          })
        }
      }

      // Validate date format
      if (row.date !== undefined) {
        const dateStr = String(row.date)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/
        if (!dateRegex.test(dateStr)) {
          // Try to parse the date
          const parsedDate = new Date(dateStr)
          if (isNaN(parsedDate.getTime())) {
            errors.push({
              row: index + 2,
              field: "date",
              message: "Format de date invalide (attendu: AAAA-MM-JJ)",
            })
          }
        }
      }
    })

    setState(prev => ({ ...prev, validationErrors: errors }))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ]
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setState(prev => ({
        ...prev,
        validationErrors: [{
          row: 0,
          field: "file",
          message: "Type de fichier non supporté. Utilisez .xlsx, .xls ou .csv",
        }],
      }))
      return
    }

    setState(prev => ({ ...prev, file, validationErrors: [] }))
    parseFile(file)
  }

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setState(prev => ({
        ...prev,
        validationErrors: [{
          row: 0,
          field: "file",
          message: "Type de fichier non supporté. Utilisez .xlsx, .xls ou .csv",
        }],
      }))
      return
    }

    setState(prev => ({ ...prev, file, validationErrors: [] }))
    parseFile(file)
  }, [parseFile])

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const formatDate = (dateStr: string): string => {
    // Handle various date formats
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0]
    }
    // Try DD/MM/YYYY format
    const parts = dateStr.split("/")
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
    }
    return dateStr
  }

  const handleImport = async () => {
    if (state.validationErrors.length > 0) return

    setState(prev => ({ ...prev, isImporting: true, step: "importing", importProgress: 0 }))

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Utilisateur non connecté")

      let importedCount = 0
      const total = state.parsedData.length

      if (state.dataType === "depenses") {
        // Get categories for mapping
        const { data: categories } = await supabase
          .from("categories")
          .select("id, nom")
          .eq("user_id", user.id)

        const categoryMap = new Map(categories?.map(c => [c.nom.toLowerCase(), c.id]) || [])

        for (let i = 0; i < state.parsedData.length; i++) {
          const row = state.parsedData[i]
          const categorieNom = String(row.categorie || "").toLowerCase()
          
          const { error } = await supabase.from("depenses").insert({
            user_id: user.id,
            date: formatDate(String(row.date)),
            designation: row.designation || null,
            montant: parseFloat(String(row.montant).replace(",", ".")),
            categorie_id: categoryMap.get(categorieNom) || null,
          })

          if (!error) importedCount++
          setState(prev => ({ ...prev, importProgress: Math.round(((i + 1) / total) * 100) }))
        }
      } else if (state.dataType === "retraits") {
        for (let i = 0; i < state.parsedData.length; i++) {
          const row = state.parsedData[i]
          
          const { error } = await supabase.from("retraits").insert({
            user_id: user.id,
            date: formatDate(String(row.date)),
            designation: row.designation || null,
            montant: parseFloat(String(row.montant).replace(",", ".")),
            motif: row.motif || null,
          })

          if (!error) importedCount++
          setState(prev => ({ ...prev, importProgress: Math.round(((i + 1) / total) * 100) }))
        }
      } else if (state.dataType === "categories") {
        for (let i = 0; i < state.parsedData.length; i++) {
          const row = state.parsedData[i]
          
          const { error } = await supabase.from("categories").insert({
            user_id: user.id,
            nom: String(row.nom),
          })

          if (!error) importedCount++
          setState(prev => ({ ...prev, importProgress: Math.round(((i + 1) / total) * 100) }))
        }
      }

      // Log the import action
      await supabase.from("logs").insert({
        user_id: user.id,
        action: "IMPORT",
        table_concernee: state.dataType,
        details: {
          file_name: state.file?.name,
          total_rows: total,
          imported_count: importedCount,
        },
      })

      setState(prev => ({
        ...prev,
        isImporting: false,
        importedCount,
        step: "complete",
      }))
    } catch (error) {
      console.error("Import error:", error)
      setState(prev => ({
        ...prev,
        isImporting: false,
        validationErrors: [{
          row: 0,
          field: "import",
          message: error instanceof Error ? error.message : "Erreur lors de l'import",
        }],
      }))
    }
  }

  const config = dataTypeConfig[state.dataType]

  return (
    <div className="space-y-6">
      {/* Data Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer des données
          </CardTitle>
          <CardDescription>
            Importez vos données depuis un fichier Excel (.xlsx) ou CSV (.csv)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de données</label>
            <Select
              value={state.dataType}
              onValueChange={(value: DataType) => {
                setState(prev => ({ ...prev, dataType: value }))
                if (prev.parsedData.length > 0) {
                  validateData(prev.parsedData, value)
                }
              }}
              disabled={state.step !== "select"}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="depenses">Dépenses</SelectItem>
                <SelectItem value="retraits">Retraits</SelectItem>
                <SelectItem value="categories">Catégories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Format attendu pour les {config.label}</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">
                <strong>Champs requis :</strong> {config.requiredFields.join(", ")}
              </p>
              {config.optionalFields.length > 0 && (
                <p className="mb-2">
                  <strong>Champs optionnels :</strong> {config.optionalFields.join(", ")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                La première ligne doit contenir les noms des colonnes.
              </p>
            </AlertDescription>
          </Alert>

          {/* Example Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(config.example[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.example.map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row).map((value, j) => (
                      <TableCell key={j} className="font-mono text-xs">
                        {String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      {state.step === "select" && (
        <Card>
          <CardContent className="pt-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-primary/50"
            >
              {state.isParsing ? (
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              ) : (
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              )}
              <p className="mt-4 text-sm text-muted-foreground">
                Glissez-déposez votre fichier ici, ou
              </p>
              <label className="mt-2">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={state.isParsing}
                />
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Parcourir</span>
                </Button>
              </label>
              <p className="mt-2 text-xs text-muted-foreground">
                Formats supportés : .xlsx, .xls, .csv
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {state.validationErrors.length > 0 && state.step !== "complete" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreurs de validation</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc pl-4">
              {state.validationErrors.slice(0, 5).map((error, i) => (
                <li key={i}>
                  {error.row > 0 && `Ligne ${error.row}: `}
                  {error.message}
                </li>
              ))}
              {state.validationErrors.length > 5 && (
                <li>... et {state.validationErrors.length - 5} autres erreurs</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview */}
      {state.step === "preview" && state.parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Aperçu des données</CardTitle>
                <CardDescription>
                  {state.parsedData.length} lignes détectées dans le fichier
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <FileText className="h-3 w-3" />
                  {state.file?.name}
                </Badge>
                <Button variant="ghost" size="icon" onClick={resetState}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {state.headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.parsedData.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      {state.headers.map((header) => (
                        <TableCell key={header} className="font-mono text-xs">
                          {String(row[header] ?? "-")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {state.parsedData.length > 10 && (
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Affichage des 10 premières lignes sur {state.parsedData.length}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={resetState}>
                Annuler
              </Button>
              <Button
                onClick={handleImport}
                disabled={state.validationErrors.length > 0 || state.isImporting}
              >
                {state.isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importer {state.parsedData.length} lignes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {state.step === "importing" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Import en cours...</span>
                <span className="text-sm text-muted-foreground">{state.importProgress}%</span>
              </div>
              <Progress value={state.importProgress} />
              <p className="text-xs text-muted-foreground text-center">
                Veuillez patienter pendant l&apos;import de vos données
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete */}
      {state.step === "complete" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-lg font-semibold">Import terminé !</h3>
              <p className="text-muted-foreground mt-1">
                {state.importedCount} {config.label.toLowerCase()} ont été importées avec succès.
              </p>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={resetState}>
                  Importer d&apos;autres données
                </Button>
                <Button onClick={() => router.push(`/dashboard/${state.dataType}`)}>
                  Voir les {config.label.toLowerCase()}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
