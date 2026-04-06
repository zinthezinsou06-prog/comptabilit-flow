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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Depense {
  id: string
  montant: number
  date: string
  designation: string | null
  categorie_id: string | null
}

interface Category {
  id: string
  nom: string
}

interface DepenseEditFormProps {
  depense: Depense
  categories: Category[]
  open: boolean
  onClose: () => void
}

export function DepenseEditForm({ depense, categories, open, onClose }: DepenseEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [montant, setMontant] = useState(depense.montant.toString())
  const [date, setDate] = useState(depense.date)
  const [categorieId, setCategorieId] = useState(depense.categorie_id || "")
  const [designation, setDesignation] = useState(depense.designation || "")
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

      const { error: updateError } = await supabase
        .from("depenses")
        .update({
          montant: parseFloat(montant),
          date,
          categorie_id: categorieId || null,
          designation: designation || null,
        })
        .eq("id", depense.id)

      if (updateError) {
        console.error("Error updating depense:", updateError)
        alert("Erreur lors de la modification: " + updateError.message)
        setIsLoading(false)
        return
      }

      // Log action
      const { error: logError } = await supabase.from("logs").insert({
        user_id: user.id,
        action: "UPDATE",
        table_concernee: "depenses",
        enregistrement_id: depense.id,
        details: { montant: parseFloat(montant), designation, categorie_id: categorieId },
      })

      if (logError) {
        console.error("Error logging action:", logError)
      }

      setIsLoading(false)
      onClose()
      router.refresh()
    } catch (error) {
      console.error("Unexpected error:", error)
      alert("Une erreur inattendue s'est produite")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la dépense</DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette dépense.
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
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Modifier"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
