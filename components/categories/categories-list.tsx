"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Pencil, Trash2, Loader2, FolderOpen } from "lucide-react"
import { CategoryEditForm } from "./category-edit-form"
import { TableExportButton } from "@/components/import-export/table-export-button"

interface Category {
  id: string
  nom: string
}

interface CategoriesListProps {
  categories: Category[]
}

// Palette de couleurs pour les catégories
const categoryColors = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
  "bg-yellow-100 text-yellow-600",
  "bg-red-100 text-red-600",
]

export function CategoriesList({ categories }: CategoriesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error: deleteError } = await supabase.from("categories").delete().eq("id", id)

      if (deleteError) {
        alert("Erreur lors de la suppression: " + deleteError.message)
        setDeletingId(null)
        return
      }

      if (user) {
        await supabase.from("logs").insert({
          user_id: user.id,
          action: "DELETE",
          table_concernee: "categories",
          enregistrement_id: id,
          details: { deleted_at: new Date().toISOString() },
        })
      }

      router.refresh()
      setDeletingId(null)
    } catch (error) {
      alert("Une erreur inattendue s'est produite")
      setDeletingId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 py-4">
          <CardTitle className="text-base">
            Catégories
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({categories.length})
            </span>
          </CardTitle>
          <TableExportButton
            data={categories.map(c => ({ Nom: c.nom }))}
            filename={`categories_${new Date().toISOString().split("T")[0]}`}
            sheetName="Catégories"
          />
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {categories.length > 0 ? (
            <div className="divide-y divide-border">
              {categories.map((category, index) => {
                const colorClass = categoryColors[index % categoryColors.length]
                return (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                      <FolderOpen className="h-4 w-4" />
                    </div>

                    <span className="flex-1 text-sm font-medium text-foreground">
                      {category.nom}
                    </span>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => setEditingCategory(category)}
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
                            {deletingId === category.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 rounded-2xl sm:mx-auto">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Les dépenses associées ne seront plus catégorisées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                            <AlertDialogCancel className="mt-0 w-full sm:w-auto">
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="w-full bg-destructive text-destructive-foreground sm:w-auto"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <FolderOpen className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">Aucune catégorie créée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingCategory && (
        <CategoryEditForm
          category={editingCategory}
          open={!!editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </>
  )
}
