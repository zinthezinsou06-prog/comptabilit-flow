"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function InitPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initResult, setInitResult] = useState<{
    success: boolean
    message: string
    checks?: any[]
  } | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  async function handleInitDatabase() {
    setIsInitializing(true)
    setInitResult(null)

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      const data = await response.json()
      setInitResult(data)

      if (data.success) {
        // Run test after initialization
        setTimeout(() => {
          handleTestDatabase()
        }, 2000)
      }
    } catch (error) {
      setInitResult({
        success: false,
        message: "Erreur lors de l'initialisation: " + String(error),
      })
    } finally {
      setIsInitializing(false)
    }
  }

  async function handleTestDatabase() {
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: String(error),
      })
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Initialisation de la Base de Données</h1>
          <p className="text-muted-foreground">Configurez votre base de données Supabase pour l&apos;application</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Créer les Tables</CardTitle>
            <CardDescription>
              Initialise les tables categories, depenses, retraits, logs et user_settings dans votre base de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleInitDatabase}
              disabled={isInitializing}
              size="lg"
              className="w-full"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initialisation en cours...
                </>
              ) : (
                "Initialiser la Base de Données"
              )}
            </Button>

            {initResult && (
              <Alert className={initResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className={initResult.success ? "text-green-800" : "text-red-800"}>
                  {initResult.message}
                </AlertDescription>
              </Alert>
            )}

            {testResult && (
              <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold">Résultats du Test</h3>

                {testResult.checks && testResult.checks.map((check: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between rounded border border-border p-3">
                    <div>
                      <p className="font-medium">{check.table || check.test}</p>
                      {check.error && <p className="text-sm text-destructive">{check.error}</p>}
                    </div>
                    {check.exists !== undefined && (
                      <div className="ml-2 flex-shrink-0">
                        {check.exists ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    )}
                    {check.authenticated !== undefined && (
                      <div className="ml-2 flex-shrink-0">
                        {check.authenticated ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vérifier l&apos;État de la Base de Données</CardTitle>
            <CardDescription>
              Teste la connexion et l&apos;existence des tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestDatabase}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Tester la Base de Données
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800">
            <p>
              1. Cliquez sur &quot;Initialiser la Base de Données&quot; pour créer les tables nécessaires
            </p>
            <p>
              2. Une fois les tables créées, le test automatique vérifiera que tout fonctionne correctement
            </p>
            <p>
              3. Vous pouvez ensuite utiliser l&apos;application normalement en naviguant vers les autres pages
            </p>
            <p>
              4. Si vous rencontrez des erreurs, assurez-vous que votre intégration Supabase est correctement configurée
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
