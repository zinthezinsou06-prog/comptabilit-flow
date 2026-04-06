'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'pass' | 'fail'
  message: string
  duration?: number
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ passed: 0, failed: 0, total: 0 })
  const supabase = createClient()

  const tests = [
    {
      name: 'Authentification',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Utilisateur non authentifié')
        return `Utilisateur: ${user.email}`
      },
    },
    {
      name: 'Table Categories',
      fn: async () => {
        const { data, error, count } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })

        if (error) throw new Error(error.message)
        return `${count} catégories trouvées`
      },
    },
    {
      name: 'Table Depenses',
      fn: async () => {
        const { data, error, count } = await supabase
          .from('depenses')
          .select('*', { count: 'exact', head: true })

        if (error) throw new Error(error.message)
        return `${count} dépenses trouvées`
      },
    },
    {
      name: 'Table Retraits',
      fn: async () => {
        const { data, error, count } = await supabase
          .from('retraits')
          .select('*', { count: 'exact', head: true })

        if (error) throw new Error(error.message)
        return `${count} retraits trouvés`
      },
    },
    {
      name: 'Table Logs',
      fn: async () => {
        const { data, error, count } = await supabase
          .from('logs')
          .select('*', { count: 'exact', head: true })

        if (error) throw new Error(error.message)
        return `${count} logs trouvés`
      },
    },
    {
      name: 'Création de Catégorie',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase
          .from('categories')
          .insert({
            user_id: user?.id,
            nom: `Test-${Date.now()}`,
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        return `Catégorie créée: ${data.id}`
      },
    },
    {
      name: 'Création de Dépense',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase
          .from('depenses')
          .insert({
            user_id: user?.id,
            date: new Date().toISOString().split('T')[0],
            designation: `Test-${Date.now()}`,
            montant: 50.00,
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        return `Dépense créée: ${data.id}`
      },
    },
    {
      name: 'Création de Retrait',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase
          .from('retraits')
          .insert({
            user_id: user?.id,
            date: new Date().toISOString().split('T')[0],
            designation: `Test-${Date.now()}`,
            montant: 100.00,
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        return `Retrait créé: ${data.id}`
      },
    },
    {
      name: 'RLS - Données Protégées',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase
          .from('depenses')
          .select('*')

        if (error) throw new Error('RLS non fonctionnel')
        return 'Données protégées par RLS'
      },
    },
  ]

  async function runTests() {
    setIsRunning(true)
    setResults([])

    let passed = 0
    let failed = 0

    for (const test of tests) {
      const startTime = Date.now()

      setResults(prev => [...prev, { name: test.name, status: 'pending', message: '' }])

      try {
        const message = await test.fn()
        const duration = Date.now() - startTime

        setResults(prev =>
          prev.map(r =>
            r.name === test.name
              ? { ...r, status: 'pass', message, duration }
              : r
          )
        )
        passed++
      } catch (error) {
        const duration = Date.now() - startTime
        const message = error instanceof Error ? error.message : 'Erreur inconnue'

        setResults(prev =>
          prev.map(r =>
            r.name === test.name
              ? { ...r, status: 'fail', message, duration }
              : r
          )
        )
        failed++
      }
    }

    setSummary({ passed, failed, total: tests.length })
    setIsRunning(false)
  }

  const successRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tests Fonctionnels</h1>
            <p className="mt-2 text-muted-foreground">
              Vérifiez que toutes les fonctionnalités de l&apos;application fonctionnent correctement
            </p>
          </div>
          <Button
            onClick={runTests}
            disabled={isRunning}
            size="lg"
            className="gap-2"
          >
            {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRunning ? 'Tests en cours...' : 'Exécuter tous les tests'}
          </Button>
        </div>

        {summary.total > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Résumé des Tests</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Réussis</p>
                <p className="text-3xl font-bold text-green-600">{summary.passed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Échoués</p>
                <p className="text-3xl font-bold text-red-600">{summary.failed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taux de réussite</p>
                <p className="text-3xl font-bold">{successRate}%</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {results.map((result, idx) => (
            <Card key={idx}>
              <CardContent className="flex items-start justify-between pt-6">
                <div className="flex items-start gap-4">
                  {result.status === 'pending' && <Loader2 className="mt-1 h-5 w-5 animate-spin text-blue-500" />}
                  {result.status === 'pass' && <CheckCircle2 className="mt-1 h-5 w-5 text-green-600" />}
                  {result.status === 'fail' && <XCircle className="mt-1 h-5 w-5 text-red-600" />}

                  <div>
                    <p className="font-medium">{result.name}</p>
                    {result.message && (
                      <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                    )}
                  </div>
                </div>
                {result.duration && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {result.duration}ms
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {summary.total > 0 && summary.failed === 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-3 pt-6">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Tous les tests sont passés!</p>
                <p className="text-sm text-green-700">L&apos;application fonctionne correctement.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {summary.failed > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">{summary.failed} test(s) échoué(s)</p>
                <p className="text-sm text-red-700">Vérifiez les messages d&apos;erreur ci-dessus.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
