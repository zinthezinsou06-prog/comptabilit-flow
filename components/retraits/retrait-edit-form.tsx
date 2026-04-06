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
import { Loader2 } from "lucide-react"

interface Retrait {
  id: string
  montant: number
  date: string
  designation: string | null
  motif: string | null
}

interface RetraitEditFormProps {
  retrait: Retrait
  open: boolean
  onClose: () => void
}

export function RetraitEditForm({ retrait, open, onClose }: RetraitEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [montant, setMontant] = useState(retrait.montant.toString())
  const [date, setDate] = useState(retrait.date)
  const [designation, setDesignation] = useState(retrait.designation || "")
  const [motif, setMotif] = useState(retrait.motif || "")
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
        .from("retraits")
        .update({
          montant: parseFloat(montant),
          date,
          designation: designation || null,
          motif: motif || null,
        })
        .eq("id", retrait.id)

      if (updateError) {
        console.error("Error updating retrait:", updateError)
        alert("Erreur lors de la modification: " + updateError.message)
        setIsLoading(false)
        return
      }

      // Log action
      const { error: logError } = await supabase.from("logs").insert({
        user_id: user.id,
        action: "UPDATE",
        table_concernee: "retraits",
        enregistrement_id: retrait.id,
        details: { montant: parseFloat(montant), designation, motif },
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
          <DialogTitle>Modifier le retrait</DialogTitle>
          <DialogDescription>
            Modifiez les informations de ce retrait.
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
