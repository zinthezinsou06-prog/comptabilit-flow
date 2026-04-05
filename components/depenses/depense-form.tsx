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
  const [description, setDescription] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from("depenses").insert({
      montant: parseFloat(montant),
      date,
      categorie_id: categorieId || null,
      description: description || null,
      user_id: user?.id,
    })

    // Log action
    await supabase.from("logs").insert({
      user_id: user?.id,
      action: "CREATE",
      table_name: "depenses",
      details: `Ajout dépense: ${montant}€`,
    })

    setMontant("")
    setDate(new Date().toISOString().split("T")[0])
    setCategorieId("")
    setDescription("")
    setIsLoading(false)
    setOpen(false)
    router.refresh()
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
