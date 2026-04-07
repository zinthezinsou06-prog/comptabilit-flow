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
import { Pencil, Trash2, Loader2, FolderOpen } from "lucide-react"
import { CategoryEditForm } from "./category-edit-form"
import { TableExportButton } from "@/components/import-export/table-export-button"

import { useSettings } from "@/components/providers/settings-provider"

interface Category {
  id: string
  nom: string
}

interface CategoriesListProps {
  categories: Category[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const { t } = useSettings()
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
        console.error("Error deleting category:", deleteError)
        alert((t("common.error") || "Erreur") + ": " + deleteError.message)
        setDeletingId(null)
        return
      }

      // Log action
      if (user) {
        const { error: logError } = await supabase.from("logs").insert({
          user_id: user.id,
          action: "DELETE",
          table_concernee: "categories",
          enregistrement_id: id,
          details: { deleted_at: new Date().toISOString() },
        })

        if (logError) {
          console.error("Error logging action:", logError)
        }
      }

      router.refresh()
      setDeletingId(null)
    } catch (error) {
      console.error("Unexpected error:", error)
      alert(t("common.unexpected_error") || "Une erreur inattendue s'est produite")
      setDeletingId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <CardTitle>{t("categories.title") || "Liste des catégories"}</CardTitle>
          <TableExportButton
            data={categories.map(c => ({
              Nom: c.nom,
            }))}
            filename={`categories_${new Date().toISOString().split("T")[0]}`}
            sheetName={t("categories.sheet_name") || "Catégories"}
          />
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 min-w-0"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{category.nom}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">{t("common.edit") || "Modifier"}</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">{t("common.delete") || "Supprimer"}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("categories.delete_title") || "Supprimer la catégorie ?"}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("categories.delete_description") || "Cette action est irréversible. Les dépenses liées à cette catégorie ne seront plus catégorisées."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel") || "Annuler"}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === category.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              t("common.delete") || "Supprimer"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {t("categories.no_data") || "Aucune catégorie créée"}
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
