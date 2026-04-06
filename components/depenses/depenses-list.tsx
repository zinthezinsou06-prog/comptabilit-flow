"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Loader2, Receipt } from "lucide-react"
import { DepenseEditForm } from "./depense-edit-form"
import { TableExportButton } from "@/components/import-export/table-export-button"

interface Depense {
  id: string
  montant: number
  date: string
  designation: string | null
  categorie_id: string | null
  categories: { nom: string } | null
}

interface Category {
  id: string
  nom: string
}

interface DepensesListProps {
  depenses: Depense[]
  categories: Category[]
}

export function DepensesList({ depenses, categories }: DepensesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error: deleteError } = await supabase.from("depenses").delete().eq("id", id)

      if (deleteError) {
        console.error("Error deleting depense:", deleteError)
        alert("Erreur lors de la suppression: " + deleteError.message)
        setDeletingId(null)
        return
      }

      if (user) {
        await supabase.from("logs").insert({
          user_id: user.id,
          action: "DELETE",
          table_concernee: "depenses",
          enregistrement_id: id,
          details: { deleted_at: new Date().toISOString() },
        })
      }

      router.refresh()
      setDeletingId(null)
    } catch (error) {
      console.error("Unexpected error:", error)
      alert("Une erreur inattendue s'est produite")
      setDeletingId(null)
    }
  }

  const totalDepenses = depenses.reduce((sum, d) => sum + Number(d.montant), 0)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Liste des dépenses</CardTitle>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <TableExportButton
              data={depenses.map(d => ({
                Date: formatDate(d.date),
                Catégorie: d.categories?.nom || "-",
                Désignation: d.designation || "-",
                Montant: formatCurrency(d.montant),
              }))}
              filename={`depenses_${new Date().toISOString().split("T")[0]}`}
              sheetName="Dépenses"
            />
            <div className="text-base font-semibold text-destructive">
              {formatCurrency(totalDepenses)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {depenses.length > 0 ? (
            <div className="divide-y divide-border">
              {depenses.map((depense) => (
                <div
                  key={depense.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <Receipt className="h-4 w-4 text-destructive" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {depense.designation || depense.categories?.nom || "Dépense"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {depense.categories?.nom && depense.designation
                            ? `${depense.categories.nom} · ${formatDate(depense.date)}`
                            : formatDate(depense.date)
                          }
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-destructive">
                        -{formatCurrency(depense.montant)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setEditingDepense(depense)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-muted"
                      aria-label="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive/60 transition-colors active:bg-destructive/10"
                          aria-label="Supprimer"
                        >
                          {deletingId === depense.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 rounded-2xl sm:mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la dépense ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                          <AlertDialogCancel className="mt-0 w-full sm:w-auto">
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(depense.id)}
                            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <Receipt className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">Aucune dépense enregistrée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingDepense && (
        <DepenseEditForm
          depense={editingDepense}
          categories={categories}
          open={!!editingDepense}
          onClose={() => setEditingDepense(null)}
        />
      )}
    </>
  )
}
