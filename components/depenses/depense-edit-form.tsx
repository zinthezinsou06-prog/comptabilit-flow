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
  description: string | null
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
  const [description, setDescription] = useState(depense.description || "")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from("depenses")
      .update({
        montant: parseFloat(montant),
        date,
        categorie_id: categorieId || null,
        description: description || null,
      })
      .eq("id", depense.id)

    // Log action
    await supabase.from("logs").insert({
      user_id: user?.id,
      action: "UPDATE",
      table_name: "depenses",
      details: `Modification dépense: ${montant}€`,
    })

    setIsLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la dépense</DialogTitle>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la dépense..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
