"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"

interface Category {
  id: string
  nom: string
}

interface DepenseFormProps {
  categories: Category[]
}

export function DepenseForm({ categories }: DepenseFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [montant, setMontant] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [categorieId, setCategorieId] = useState("")
  const [designation, setDesignation] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert("Utilisateur non authentifié")
        setIsLoading(false)
        return
      }

      const { data: newDepense, error: insertError } = await supabase.from("depenses").insert({
        montant: parseFloat(montant),
        date,
        categorie_id: categorieId || null,
        designation: designation || null,
        user_id: user.id,
      }).select().single()

      if (insertError) {
        console.error("Error inserting depense:", insertError)
        alert("Erreur lors de l'ajout de la dépense: " + insertError.message)
        setIsLoading(false)
        return
      }

      // Log action
      if (newDepense?.id) {
        const { error: logError } = await supabase.from("logs").insert({
          user_id: user.id,
          action: "INSERT",
          table_concernee: "depenses",
          enregistrement_id: newDepense.id,
          details: { montant: parseFloat(montant), designation, categorie_id: categorieId },
        })

        if (logError) {
          console.error("Error logging action:", logError)
        }
      }

      setMontant("")
      setDate(new Date().toISOString().split("T")[0])
      setCategorieId("")
      setDesignation("")
      setIsLoading(false)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Unexpected error:", error)
      alert("Une erreur inattendue s'est produite")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle dépense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une dépense</DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle dépense dans votre comptabilité.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="montant">Montant (€)</Label>
            <Input
              id="montant"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categorie">Catégorie</Label>
            <Select value={categorieId} onValueChange={setCategorieId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Désignation</Label>
            <Textarea
              id="designation"
              placeholder="Désignation de la dépense..."
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
