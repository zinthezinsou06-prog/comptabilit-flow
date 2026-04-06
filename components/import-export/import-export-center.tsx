"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download } from "lucide-react"
import { DataImporter } from "./data-importer"
import { DataExporter } from "./data-exporter"

export function ImportExportCenter() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Import / Export</h1>
        <p className="text-muted-foreground">
          Importez des données depuis Excel ou CSV, ou exportez vos données existantes
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            Importer
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <DataImporter />
        </TabsContent>

        <TabsContent value="export">
          <DataExporter />
        </TabsContent>
      </Tabs>
    </div>
  )
}
