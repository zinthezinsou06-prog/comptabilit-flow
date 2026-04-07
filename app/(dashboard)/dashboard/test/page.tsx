'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, XCircle, AlertCircle, Loader2, Play, Trash2, RefreshCw, Database, Shield, FileText, Calculator } from 'lucide-react'

interface TestResult {
  name: string
  category: string
  status: 'pending' | 'pass' | 'fail' | 'skipped'
  message: string
  duration?: number
}

interface TestData {
  categoryId?: string
  depenseId?: string
  retraitId?: string
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ passed: 0, failed: 0, skipped: 0, total: 0 })
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState('')
  const testDataRef = useRef<TestData>({})
  const supabase = createClient()

  const testCategories = [
    { id: 'auth', name: 'Authentification', icon: Shield },
    { id: 'db', name: 'Base de Données', icon: Database },
    { id: 'crud', name: 'Opérations CRUD', icon: FileText },
    { id: 'calc', name: 'Calculs & Logique', icon: Calculator },
  ]

  const tests = [
    // Authentification Tests
    {
      name: 'Connexion utilisateur',
      category: 'auth',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Utilisateur non authentifié - Veuillez vous connecter')
        return `Connecté: ${user.email}`
      },
    },
    {
      name: 'Session active',
      category: 'auth',
      fn: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Aucune session active')
        const expiresAt = new Date(session.expires_at! * 1000)
        return `Session valide jusqu'à ${expiresAt.toLocaleString('fr-FR')}`
      },
    },
    // Database Tests
    {
      name: 'Connexion Supabase',
      category: 'db',
      fn: async () => {
        const { error } = await supabase.from('categories').select('id').limit(1)
        if (error) throw new Error(`Erreur de connexion: ${error.message}`)
        return 'Connexion à la base de données OK'
      },
    },
    {
      name: 'Table Categories',
      category: 'db',
      fn: async () => {
        const { count, error } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
        if (error) throw new Error(error.message)
        return `${count ?? 0} catégorie(s) en base`
      },
    },
    {
      name: 'Table Depenses',
      category: 'db',
      fn: async () => {
        const { count, error } = await supabase
          .from('depenses')
          .select('*', { count: 'exact', head: true })
        if (error) throw new Error(error.message)
        return `${count ?? 0} dépense(s) en base`
      },
    },
    {
      name: 'Table Retraits',
      category: 'db',
      fn: async () => {
        const { count, error } = await supabase
          .from('retraits')
          .select('*', { count: 'exact', head: true })
        if (error) throw new Error(error.message)
        return `${count ?? 0} retrait(s) en base`
      },
    },
    {
      name: 'Table Logs',
      category: 'db',
      fn: async () => {
        const { count, error } = await supabase
          .from('logs')
          .select('*', { count: 'exact', head: true })
        if (error) throw new Error(error.message)
        return `${count ?? 0} log(s) en base`
      },
    },
    // CRUD Tests - Categories
    {
      name: 'CREATE - Catégorie',
      category: 'crud',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Non authentifié')
        
        const testNom = `__TEST_CAT_${Date.now()}`
        const { data, error } = await supabase
          .from('categories')
          .insert({ user_id: user.id, nom: testNom })
          .select()
          .single()

        if (error) throw new Error(error.message)
        testDataRef.current.categoryId = data.id
        return `Catégorie "${testNom}" créée (ID: ${data.id.slice(0, 8)}...)`
      },
    },
    {
      name: 'READ - Catégorie',
      category: 'crud',
      fn: async () => {
        if (!testDataRef.current.categoryId) throw new Error('Aucune catégorie de test à lire')
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', testDataRef.current.categoryId)
          .single()

        if (error) throw new Error(error.message)
        return `Catégorie lue: "${data.nom}"`
      },
    },
    {
      name: 'UPDATE - Catégorie',
      category: 'crud',
      fn: async () => {
        if (!testDataRef.current.categoryId) throw new Error('Aucune catégorie de test à modifier')
        
        const newNom = `__TEST_CAT_UPDATED_${Date.now()}`
        const { data, error } = await supabase
          .from('categories')
          .update({ nom: newNom })
          .eq('id', testDataRef.current.categoryId)
          .select()
          .single()

        if (error) throw new Error(error.message)
        return `Catégorie mise à jour: "${newNom}"`
      },
    },
    // CRUD Tests - Depenses
    {
      name: 'CREATE - Dépense',
      category: 'crud',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Non authentifié')
        
        const testMontant = 123.45
        const { data, error } = await supabase
          .from('depenses')
          .insert({
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            designation: `__TEST_DEP_${Date.now()}`,
            montant: testMontant,
            categorie_id: testDataRef.current.categoryId || null,
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        testDataRef.current.depenseId = data.id
        return `Dépense de ${testMontant}€ créée (ID: ${data.id.slice(0, 8)}...)`
      },
    },
    {
      name: 'READ - Dépense avec jointure',
      category: 'crud',
      fn: async () => {
        if (!testDataRef.current.depenseId) throw new Error('Aucune dépense de test à lire')
        
        const { data, error } = await supabase
          .from('depenses')
          .select('*, categories(nom)')
          .eq('id', testDataRef.current.depenseId)
          .single()

        if (error) throw new Error(error.message)
        const catName = data.categories?.nom || 'Sans catégorie'
        return `Dépense: ${data.montant}€ - Cat: ${catName}`
      },
    },
    {
      name: 'UPDATE - Dépense',
      category: 'crud',
      fn: async () => {
        if (!testDataRef.current.depenseId) throw new Error('Aucune dépense de test à modifier')
        
        const newMontant = 456.78
        const { data, error } = await supabase
          .from('depenses')
          .update({ montant: newMontant, designation: `__TEST_DEP_UPDATED_${Date.now()}` })
          .eq('id', testDataRef.current.depenseId)
          .select()
          .single()

        if (error) throw new Error(error.message)
        return `Dépense mise à jour: ${newMontant}€`
      },
    },
    // CRUD Tests - Retraits
    {
      name: 'CREATE - Retrait',
      category: 'crud',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Non authentifié')
        
        const testMontant = 500.00
        const { data, error } = await supabase
          .from('retraits')
          .insert({
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            designation: `__TEST_RET_${Date.now()}`,
            montant: testMontant,
            motif: 'Test automatique',
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        testDataRef.current.retraitId = data.id
        return `Retrait de ${testMontant}€ créé (ID: ${data.id.slice(0, 8)}...)`
      },
    },
    {
      name: 'READ - Retrait',
      category: 'crud',
      fn: async () => {
        if (!testDataRef.current.retraitId) throw new Error('Aucun retrait de test à lire')
        
        const { data, error } = await supabase
          .from('retraits')
          .select('*')
          .eq('id', testDataRef.current.retraitId)
          .single()

        if (error) throw new Error(error.message)
        return `Retrait lu: ${data.montant}€ - ${data.motif}`
      },
    },
    {
      name: 'UPDATE - Retrait',
      category: 'crud',
      fn: async () => {
        if (!testDataRef.current.retraitId) throw new Error('Aucun retrait de test à modifier')
        
        const newMontant = 750.00
        const { data, error } = await supabase
          .from('retraits')
          .update({ montant: newMontant, motif: 'Test mis à jour' })
          .eq('id', testDataRef.current.retraitId)
          .select()
          .single()

        if (error) throw new Error(error.message)
        return `Retrait mis à jour: ${newMontant}€`
      },
    },
    // Logs
    {
      name: 'CREATE - Log action',
      category: 'crud',
      fn: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Non authentifié')
        
        const { data, error } = await supabase
          .from('logs')
          .insert({
            user_id: user.id,
            action: 'TEST',
            table_concernee: 'test',
            enregistrement_id: testDataRef.current.depenseId || null,
            details: { test: true, timestamp: Date.now() },
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        return `Log créé avec succès`
      },
    },
    // DELETE Tests
    {
      name: 'DELETE - Dépense',
      category: 'crud',
      fn: async () => {
        if (!testDataRef.current.depenseId) throw new Error('Aucune dépense de test à supprimer')
        
        const { error } = await supabase
          .from('depenses')
          .delete()
          .eq('id', testDataRef.current.depenseId)

        if (error) throw new Error(error.message)
        const deletedId = testDataRef.current.depenseId
        testDataRef.current.depenseId = undefined
        return `Dépense supprimée (ID: ${deletedId.slice(0, 8)}...)`
      },
    },
    {
      name: 'DELETE - Retrait',
      category: 'crud',
      fn: async () => {
        if (!testDataRef.current.retraitId) throw new Error('Aucun retrait de test à supprimer')
        
        const { error } = await supabase
          .from('retraits')
          .delete()
          .eq('id', testDataRef.current.retraitId)

        if (error) throw new Error(error.message)
        const deletedId = testDataRef.current.retraitId
        testDataRef.current.retraitId = undefined
        return `Retrait supprimé (ID: ${deletedId.slice(0, 8)}...)`
      },
    },
    {
      name: 'DELETE - Catégorie',
      category: 'crud',
      fn: async () => {
        if (!testDataRef.current.categoryId) throw new Error('Aucune catégorie de test à supprimer')
        
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', testDataRef.current.categoryId)

        if (error) throw new Error(error.message)
        const deletedId = testDataRef.current.categoryId
        testDataRef.current.categoryId = undefined
        return `Catégorie supprimée (ID: ${deletedId.slice(0, 8)}...)`
      },
    },
    // Calculs & Logique
    {
      name: 'Calcul total dépenses',
      category: 'calc',
      fn: async () => {
        const { data, error } = await supabase
          .from('depenses')
          .select('montant')

        if (error) throw new Error(error.message)
        const total = data.reduce((sum, d) => sum + Number(d.montant), 0)
        return `Total des dépenses: ${total.toFixed(2)}€`
      },
    },
    {
      name: 'Calcul total retraits',
      category: 'calc',
      fn: async () => {
        const { data, error } = await supabase
          .from('retraits')
          .select('montant')

        if (error) throw new Error(error.message)
        const total = data.reduce((sum, r) => sum + Number(r.montant), 0)
        return `Total des retraits: ${total.toFixed(2)}€`
      },
    },
    {
      name: 'Calcul solde net',
      category: 'calc',
      fn: async () => {
        const [depensesRes, retraitsRes] = await Promise.all([
          supabase.from('depenses').select('montant'),
          supabase.from('retraits').select('montant'),
        ])

        if (depensesRes.error) throw new Error(depensesRes.error.message)
        if (retraitsRes.error) throw new Error(retraitsRes.error.message)

        const totalDepenses = depensesRes.data.reduce((sum, d) => sum + Number(d.montant), 0)
        const totalRetraits = retraitsRes.data.reduce((sum, r) => sum + Number(r.montant), 0)
        const solde = totalRetraits - totalDepenses

        return `Solde: ${solde >= 0 ? '+' : ''}${solde.toFixed(2)}€ (Retraits: ${totalRetraits.toFixed(2)}€ - Dépenses: ${totalDepenses.toFixed(2)}€)`
      },
    },
    {
      name: 'Dépenses par catégorie',
      category: 'calc',
      fn: async () => {
        const { data, error } = await supabase
          .from('depenses')
          .select('montant, categories(nom)')

        if (error) throw new Error(error.message)
        
        const parCategorie: Record<string, number> = {}
        data.forEach(d => {
          const catRaw = Array.isArray(d.categories) ? d.categories[0]?.nom : (d.categories as any)?.nom
          const cat = catRaw || 'Sans catégorie'
          parCategorie[cat] = (parCategorie[cat] || 0) + Number(d.montant)
        })
        
        const categories = Object.entries(parCategorie).length
        return `${categories} catégorie(s) avec dépenses calculées`
      },
    },
  ]

  async function runTests() {
    setIsRunning(true)
    setResults([])
    testDataRef.current = {}
    setProgress(0)

    let passed = 0
    let failed = 0
    let skipped = 0

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      const startTime = Date.now()
      setCurrentTest(test.name)
      setProgress(((i + 1) / tests.length) * 100)

      setResults(prev => [...prev, { 
        name: test.name, 
        category: test.category, 
        status: 'pending', 
        message: '' 
      }])

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

      // Small delay between tests for UI feedback
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setSummary({ passed, failed, skipped, total: tests.length })
    setIsRunning(false)
    setCurrentTest('')
  }

  async function cleanupTestData() {
    // Clean up any remaining test data
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('depenses').delete().like('designation', '__TEST_%')
    await supabase.from('retraits').delete().like('designation', '__TEST_%')
    await supabase.from('categories').delete().like('nom', '__TEST_%')
    await supabase.from('logs').delete().eq('action', 'TEST')
    
    testDataRef.current = {}
  }

  const successRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : 0
  const getResultsByCategory = (categoryId: string) => results.filter(r => r.category === categoryId)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tests Fonctionnels</h1>
            <p className="mt-2 text-muted-foreground">
              Suite de tests complète pour valider toutes les fonctionnalités
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={cleanupTestData}
              disabled={isRunning}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Nettoyer
            </Button>
            <Button
              onClick={runTests}
              disabled={isRunning}
              size="lg"
              className="gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'En cours...' : 'Lancer les tests'}
            </Button>
          </div>
        </div>

        {/* Progress */}
        {isRunning && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Test en cours: {currentTest}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {summary.total > 0 && !isRunning && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Résumé des Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold">{summary.total}</p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-4">
                  <p className="text-sm text-green-600">Réussis</p>
                  <p className="text-3xl font-bold text-green-600">{summary.passed}</p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-4">
                  <p className="text-sm text-red-600">Échoués</p>
                  <p className="text-3xl font-bold text-red-600">{summary.failed}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-4">
                  <p className="text-sm text-primary">Taux de réussite</p>
                  <p className="text-3xl font-bold text-primary">{successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results by Category */}
        {results.length > 0 && (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="all" className="gap-2">
                Tous ({results.length})
              </TabsTrigger>
              {testCategories.map(cat => {
                const catResults = getResultsByCategory(cat.id)
                const passedCount = catResults.filter(r => r.status === 'pass').length
                const Icon = cat.icon
                return (
                  <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {cat.name} ({passedCount}/{catResults.length})
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {results.map((result, idx) => (
                <TestResultCard key={idx} result={result} />
              ))}
            </TabsContent>

            {testCategories.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="space-y-3">
                {getResultsByCategory(cat.id).map((result, idx) => (
                  <TestResultCard key={idx} result={result} />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Status Messages */}
        {summary.total > 0 && !isRunning && summary.failed === 0 && (
          <Card className="border-green-500/50 bg-green-500/10">
            <CardContent className="flex items-center gap-3 pt-6">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-700">Tous les tests sont passés!</p>
                <p className="text-sm text-green-600">L&apos;application fonctionne correctement.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {summary.failed > 0 && !isRunning && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-700">{summary.failed} test(s) échoué(s)</p>
                <p className="text-sm text-red-600">Vérifiez les messages d&apos;erreur ci-dessus.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {results.length === 0 && !isRunning && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Play className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">Prêt à tester</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cliquez sur &quot;Lancer les tests&quot; pour vérifier toutes les fonctionnalités
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function TestResultCard({ result }: { result: TestResult }) {
  const statusColors = {
    pending: 'text-blue-500',
    pass: 'text-green-600',
    fail: 'text-red-600',
    skipped: 'text-yellow-600',
  }

  const statusBg = {
    pending: 'bg-blue-500/10',
    pass: 'bg-green-500/10',
    fail: 'bg-red-500/10',
    skipped: 'bg-yellow-500/10',
  }

  return (
    <Card className={statusBg[result.status]}>
      <CardContent className="flex items-start justify-between py-4">
        <div className="flex items-start gap-4">
          {result.status === 'pending' && <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-blue-500" />}
          {result.status === 'pass' && <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />}
          {result.status === 'fail' && <XCircle className="mt-0.5 h-5 w-5 text-red-600" />}
          {result.status === 'skipped' && <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />}

          <div className="space-y-1">
            <p className="font-medium">{result.name}</p>
            {result.message && (
              <p className={`text-sm ${result.status === 'fail' ? 'text-red-600' : 'text-muted-foreground'}`}>
                {result.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {result.category}
          </Badge>
          {result.duration !== undefined && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {result.duration}ms
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
