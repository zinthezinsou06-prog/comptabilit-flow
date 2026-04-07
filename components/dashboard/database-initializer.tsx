"use client"

import { useInitializeDatabase } from "@/hooks/useInitializeDatabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function DatabaseInitializer() {
  const { initialized, checking, error } = useInitializeDatabase()

  if (checking) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Vérification de la base de données...</AlertTitle>
        <AlertDescription>
          Veuillez patienter pendant que nous initialisisons votre base de données.
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur d&apos;initialisation</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error}</p>
          <Link href="/dashboard/init">
            <Button size="sm" variant="outline">
              Aller à la page d&apos;initialisation
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  if (initialized) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Base de données prête</AlertTitle>
        <AlertDescription className="text-green-800">
          Votre base de données est correctement initialisée et prête à être utilisée.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
