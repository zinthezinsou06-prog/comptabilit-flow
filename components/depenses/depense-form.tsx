"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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

      const { data: newDepense, error: insertError } = await supabase
        .from("depenses")
        .insert({
          montant: parseFloat(montant),
          date,
          categorie_id: categorieId || null,
          designation: designation || null,
          user_id: user.id,
        })
        .select()
        .single()

      if (insertError) {
        alert("Erreur lors de l'ajout de la dépense: " + insertError.message)
        setIsLoading(false)
        return
      }

      if (newDepense?.id) {
        await supabase.from("logs").insert({
          user_id: user.id,
          action: "INSERT",
          table_concernee: "depenses",
          enregistrement_id: newDepense.id,
          details: { montant: parseFloat(montant), designation, categorie_id: categorieId },
        })
      }

      setMontant("")
      setDate(new Date().toISOString().split("T")[0])
      setCategorieId("")
      setDesignation("")
      setIsLoading(false)
      setOpen(false)
      router.refresh()
    } catch (error) {
      alert("Une erreur inattendue s'est produite")
      setIsLoading(false)
    }
  }

  return (
    // Use Sheet (bottom sheet) instead of Dialog for better Android UX
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          <span>Nouvelle dépense</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl px-4 pb-safe"
        style={{ maxHeight: "90dvh", overflowY: "auto" }}
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left">Ajouter une dépense</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          {/* Montant — large input */}
          <div className="space-y-1.5">
            <Label htmlFor="montant" className="text-sm font-medium">
              Montant (€)
            </Label>
            <Input
              id="montant"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Catégorie</Label>
            <Select value={categorieId} onValueChange={setCategorieId}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="py-3">
                    {cat.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="designation" className="text-sm font-medium">
              Désignation
            </Label>
            <Textarea
              id="designation"
              placeholder="Description de la dépense..."
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              rows={2}
              className="text-base resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-xl"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 flex-1 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
