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
import { Plus, Loader2 } from "lucide-react"

export function RetraitForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [montant, setMontant] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [source, setSource] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from("retraits").insert({
      montant: parseFloat(montant),
      date,
      source: source || null,
      description: description || null,
      user_id: user?.id,
    })

    // Log action
    await supabase.from("logs").insert({
      user_id: user?.id,
      action: "CREATE",
      table_name: "retraits",
      details: `Ajout retrait: ${montant}€`,
    })

    setMontant("")
    setDate(new Date().toISOString().split("T")[0])
    setSource("")
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
          Nouveau retrait
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un retrait</DialogTitle>
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
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="Ex: Banque, Client, etc."
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description du retrait..."
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
