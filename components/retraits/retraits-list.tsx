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
import { Pencil, Trash2, Loader2, ArrowDownCircle } from "lucide-react"
import { RetraitEditForm } from "./retrait-edit-form"
import { TableExportButton } from "@/components/import-export/table-export-button"

interface Retrait {
  id: string
  montant: number
  date: string
  designation: string | null
  motif: string | null
}

interface RetraitsListProps {
  retraits: Retrait[]
}

export function RetraitsList({ retraits }: RetraitsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingRetrait, setEditingRetrait] = useState<Retrait | null>(null)
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
      const { error: deleteError } = await supabase.from("retraits").delete().eq("id", id)

      if (deleteError) {
        alert("Erreur lors de la suppression: " + deleteError.message)
        setDeletingId(null)
        return
      }

      if (user) {
        await supabase.from("logs").insert({
          user_id: user.id,
          action: "DELETE",
          table_concernee: "retraits",
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

  const totalRetraits = retraits.reduce((sum, r) => sum + Number(r.montant), 0)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Liste des retraits</CardTitle>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <TableExportButton
              data={retraits.map(r => ({
                Date: formatDate(r.date),
                Désignation: r.designation || "-",
                Motif: r.motif || "-",
                Montant: formatCurrency(r.montant),
              }))}
              filename={`retraits_${new Date().toISOString().split("T")[0]}`}
              sheetName="Retraits"
            />
            <div className="text-base font-semibold text-accent">
              +{formatCurrency(totalRetraits)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {retraits.length > 0 ? (
            <div className="divide-y divide-border">
              {retraits.map((retrait) => (
                <div key={retrait.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <ArrowDownCircle className="h-4 w-4 text-accent" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {retrait.designation || "Retrait"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {retrait.motif
                            ? `${retrait.motif} · ${formatDate(retrait.date)}`
                            : formatDate(retrait.date)
                          }
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-accent">
                        +{formatCurrency(retrait.montant)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setEditingRetrait(retrait)}
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
                          {deletingId === retrait.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 rounded-2xl sm:mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le retrait ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                          <AlertDialogCancel className="mt-0 w-full sm:w-auto">
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(retrait.id)}
                            className="w-full bg-destructive text-destructive-foreground sm:w-auto"
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
              <ArrowDownCircle className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">Aucun retrait enregistré</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingRetrait && (
        <RetraitEditForm
          retrait={editingRetrait}
          open={!!editingRetrait}
          onClose={() => setEditingRetrait(null)}
        />
      )}
    </>
  )
}
