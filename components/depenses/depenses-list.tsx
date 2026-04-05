"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { DepenseEditForm } from "./depense-edit-form"

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
      month: "long",
      year: "numeric",
    })
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from("depenses").delete().eq("id", id)
    router.refresh()
    setDeletingId(null)
  }

  const totalDepenses = depenses.reduce((sum, d) => sum + Number(d.montant), 0)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Liste des dépenses</CardTitle>
          <div className="text-lg font-semibold text-destructive">
            Total: {formatCurrency(totalDepenses)}
          </div>
        </CardHeader>
        <CardContent>
          {depenses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Désignation</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depenses.map((depense) => (
                    <TableRow key={depense.id}>
                      <TableCell>{formatDate(depense.date)}</TableCell>
                      <TableCell>{depense.categories?.nom || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {depense.designation || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        {formatCurrency(depense.montant)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingDepense(depense)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la dépense ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. La dépense sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(depense.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deletingId === depense.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Supprimer"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Aucune dépense enregistrée
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
