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
  const [designation, setDesignation] = useState("")
  const [motif, setMotif] = useState("")
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

      const { data: newRetrait, error: insertError } = await supabase.from("retraits").insert({
        montant: parseFloat(montant),
        date,
        designation: designation || null,
        motif: motif || null,
        user_id: user.id,
      }).select().single()

      if (insertError) {
        console.error("Error inserting retrait:", insertError)
        alert("Erreur lors de l'ajout du retrait: " + insertError.message)
        setIsLoading(false)
        return
      }

      // Log action
      if (newRetrait?.id) {
        const { error: logError } = await supabase.from("logs").insert({
          user_id: user.id,
          action: "INSERT",
          table_concernee: "retraits",
          enregistrement_id: newRetrait.id,
          details: { montant: parseFloat(montant), designation, motif },
        })

        if (logError) {
          console.error("Error logging action:", logError)
        }
      }

      setMontant("")
      setDate(new Date().toISOString().split("T")[0])
      setDesignation("")
      setMotif("")
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
            <Label htmlFor="designation">Désignation</Label>
            <Input
              id="designation"
              placeholder="Ex: Virement, Paiement client, etc."
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motif">Motif</Label>
            <Textarea
              id="motif"
              placeholder="Motif du retrait..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
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
