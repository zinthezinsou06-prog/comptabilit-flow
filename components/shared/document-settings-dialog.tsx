"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Building2, PenLine, Save } from "lucide-react"
import { useDocumentSettings, type DocumentSettings } from "@/hooks/use-document-settings"

interface DocumentSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (settings: DocumentSettings) => void
}

export function DocumentSettingsDialog({ open, onOpenChange, onSave }: DocumentSettingsDialogProps) {
  const { settings, updateHeader, updateSignature } = useDocumentSettings()
  const [local, setLocal] = useState<DocumentSettings>(settings)

  // Sync local state when dialog opens
  const handleOpenChange = (val: boolean) => {
    if (val) setLocal(settings)
    onOpenChange(val)
  }

  const handleSave = () => {
    updateHeader(local.header)
    updateSignature(local.signature)
    onSave?.(local)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Paramètres du document
          </DialogTitle>
          <DialogDescription>
            Ces paramètres sont sauvegardés et réutilisés pour tous vos exports (PDF et Excel).
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="header" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="header" className="flex-1">
              <Building2 className="mr-2 h-4 w-4" />
              En-tête
            </TabsTrigger>
            <TabsTrigger value="signature" className="flex-1">
              <PenLine className="mr-2 h-4 w-4" />
              Signature
            </TabsTrigger>
          </TabsList>

          {/* Header Tab */}
          <TabsContent value="header" className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Nom de l&apos;entreprise / Titre *</Label>
              <Input
                id="companyName"
                value={local.header.companyName}
                onChange={(e) => setLocal(prev => ({ ...prev, header: { ...prev.header, companyName: e.target.value } }))}
                placeholder="Mon Entreprise"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subtitle">Sous-titre par défaut</Label>
              <Input
                id="subtitle"
                value={local.header.subtitle}
                onChange={(e) => setLocal(prev => ({ ...prev, header: { ...prev.header, subtitle: e.target.value } }))}
                placeholder="Rapport Financier"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={local.header.address}
                onChange={(e) => setLocal(prev => ({ ...prev, header: { ...prev.header, address: e.target.value } }))}
                placeholder="123 Rue Example, 75000 Paris"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={local.header.phone}
                  onChange={(e) => setLocal(prev => ({ ...prev, header: { ...prev.header, phone: e.target.value } }))}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={local.header.email}
                  onChange={(e) => setLocal(prev => ({ ...prev, header: { ...prev.header, email: e.target.value } }))}
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">URL du logo (optionnel)</Label>
              <Input
                id="logo"
                value={local.header.logo}
                onChange={(e) => setLocal(prev => ({ ...prev, header: { ...prev.header, logo: e.target.value } }))}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Image affichée en haut à droite dans les PDF.
              </p>
            </div>
          </TabsContent>

          {/* Signature Tab */}
          <TabsContent value="signature" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              La signature apparaît en bas de chaque document exporté (PDF et Excel).
            </p>

            <div className="grid gap-2">
              <Label htmlFor="signatoryName">Nom du signataire</Label>
              <Input
                id="signatoryName"
                value={local.signature.signatoryName}
                onChange={(e) => setLocal(prev => ({ ...prev, signature: { ...prev.signature, signatoryName: e.target.value } }))}
                placeholder="Jean Dupont"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="signatoryTitle">Fonction / Titre</Label>
              <Input
                id="signatoryTitle"
                value={local.signature.signatoryTitle}
                onChange={(e) => setLocal(prev => ({ ...prev, signature: { ...prev.signature, signatoryTitle: e.target.value } }))}
                placeholder="Directeur Financier"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Note de bas de page</Label>
              <Textarea
                id="note"
                value={local.signature.note}
                onChange={(e) => setLocal(prev => ({ ...prev, signature: { ...prev.signature, note: e.target.value } }))}
                placeholder="Document confidentiel - Usage interne uniquement"
                rows={3}
              />
            </div>

            {/* Preview */}
            {(local.signature.signatoryName || local.signature.signatoryTitle || local.signature.note) && (
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Aperçu de la signature</p>
                <div className="border-t pt-3 mt-1">
                  <div className="flex justify-between items-end">
                    <div className="text-sm">
                      {local.signature.signatoryName && <p className="font-semibold">{local.signature.signatoryName}</p>}
                      {local.signature.signatoryTitle && <p className="text-muted-foreground text-xs">{local.signature.signatoryTitle}</p>}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Signature</p>
                      <div className="w-24 border-b border-foreground/30 mt-3" />
                    </div>
                  </div>
                  {local.signature.note && (
                    <p className="text-xs text-muted-foreground mt-3 italic">{local.signature.note}</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
