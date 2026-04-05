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
import { RetraitEditForm } from "./retrait-edit-form"

interface Retrait {
  id: string
  montant: number
  date: string
  source: string | null
  description: string | null
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
      month: "long",
      year: "numeric",
    })
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from("retraits").delete().eq("id", id)
    router.refresh()
    setDeletingId(null)
  }

  const totalRetraits = retraits.reduce((sum, r) => sum + Number(r.montant), 0)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Liste des retraits</CardTitle>
          <div className="text-lg font-semibold text-accent">
            Total: {formatCurrency(totalRetraits)}
          </div>
        </CardHeader>
        <CardContent>
          {retraits.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retraits.map((retrait) => (
                    <TableRow key={retrait.id}>
                      <TableCell>{formatDate(retrait.date)}</TableCell>
                      <TableCell>{retrait.source || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {retrait.description || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-accent">
                        +{formatCurrency(retrait.montant)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingRetrait(retrait)}
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
                                <AlertDialogTitle>Supprimer le retrait ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Le retrait sera définitivement supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(retrait.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deletingId === retrait.id ? (
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
              Aucun retrait enregistré
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
