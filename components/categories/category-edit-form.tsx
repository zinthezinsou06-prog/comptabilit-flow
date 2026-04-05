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
import { Loader2 } from "lucide-react"

interface Category {
  id: string
  nom: string
  description: string | null
}

interface CategoryEditFormProps {
  category: Category
  open: boolean
  onClose: () => void
}

export function CategoryEditForm({ category, open, onClose }: CategoryEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [nom, setNom] = useState(category.nom)
  const [description, setDescription] = useState(category.description || "")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    await supabase
      .from("categories")
      .update({
        nom,
        description: description || null,
      })
      .eq("id", category.id)

    setIsLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              placeholder="Ex: Alimentation, Transport, etc."
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la catégorie..."
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
