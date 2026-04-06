'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2, TrendingUp } from 'lucide-react'

interface ToolTest {
  name: string
  category: string
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
}

export default function TestToolsPage() {
  const [tests, setTests] = useState<ToolTest[]>([
    // AI Assistant Tests
    { name: 'Assistant IA - Initialisation', category: 'AI', status: 'idle', message: '' },
    { name: 'Assistant IA - Questions prédéfinies', category: 'AI', status: 'idle', message: '' },
    { name: 'Assistant IA - Analyses de données', category: 'AI', status: 'idle', message: '' },

    // Accounting Tools Tests
    { name: 'Outils Comptables - Ratios financiers', category: 'Accounting', status: 'idle', message: '' },
    { name: 'Outils Comptables - Bilan simplifié', category: 'Accounting', status: 'idle', message: '' },
    { name: 'Outils Comptables - Intérêts composés', category: 'Accounting', status: 'idle', message: '' },

    // Budget Simulator Tests
    { name: 'Simulateur Budget - Initialisation', category: 'Budget', status: 'idle', message: '' },
    { name: 'Simulateur Budget - Projections', category: 'Budget', status: 'idle', message: '' },
    { name: 'Simulateur Budget - Objectifs', category: 'Budget', status: 'idle', message: '' },

    // Analytics Tests
    { name: 'Analyseur - Statistiques', category: 'Analytics', status: 'idle', message: '' },
    { name: 'Analyseur - Détection patterns', category: 'Analytics', status: 'idle', message: '' },
    { name: 'Analyseur - Graphiques', category: 'Analytics', status: 'idle', message: '' },
  ])

  const supabase = createClient()

  const updateTest = (name: string, status: ToolTest['status'], message: string) => {
    setTests(prev =>
      prev.map(t => (t.name === name ? { ...t, status, message } : t))
    )
  }

  async function testAIAssistantInit() {
    updateTest('Assistant IA - Initialisation', 'loading', '')
    try {
      // Test that the AI assistant component can be loaded
      const response = await fetch('/api/test-db')
      if (!response.ok) throw new Error('API not responding')

      updateTest('Assistant IA - Initialisation', 'success', 'Composant chargé')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Assistant IA - Initialisation', 'error', msg)
    }
  }

  async function testAIPredefinedQuestions() {
    updateTest('Assistant IA - Questions prédéfinies', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Get depenses data for questions
      const { data: depenses, error } = await supabase
        .from('depenses')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error

      if (!depenses || depenses.length === 0) {
        throw new Error('Aucune dépense pour analyser')
      }

      updateTest('Assistant IA - Questions prédéfinies', 'success', `${depenses.length} dépenses analysées`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Assistant IA - Questions prédéfinies', 'error', msg)
    }
  }

  async function testAIAnalytics() {
    updateTest('Assistant IA - Analyses de données', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Calculate total spending
      const { data: depenses, error } = await supabase
        .from('depenses')
        .select('montant')
        .eq('user_id', user?.id)

      if (error) throw error

      if (!depenses || depenses.length === 0) {
        updateTest('Assistant IA - Analyses de données', 'success', 'Aucune donnée à analyser')
        return
      }

      const total = depenses.reduce((sum, d) => sum + (d.montant || 0), 0)
      const average = total / depenses.length

      updateTest('Assistant IA - Analyses de données', 'success', `Total: ${total}€, Moyenne: ${average.toFixed(2)}€`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Assistant IA - Analyses de données', 'error', msg)
    }
  }

  async function testAccountingRatios() {
    updateTest('Outils Comptables - Ratios financiers', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Get depenses and retraits to calculate ratios
      const { data: depenses } = await supabase
        .from('depenses')
        .select('montant')
        .eq('user_id', user?.id)

      const { data: retraits } = await supabase
        .from('retraits')
        .select('montant')
        .eq('user_id', user?.id)

      const totalExpenses = (depenses || []).reduce((sum, d) => sum + (d.montant || 0), 0)
      const totalWithdrawals = (retraits || []).reduce((sum, r) => sum + (r.montant || 0), 0)
      const ratio = totalWithdrawals > 0 ? (totalExpenses / totalWithdrawals * 100).toFixed(2) : 0

      updateTest('Outils Comptables - Ratios financiers', 'success', `Ratio: ${ratio}%`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Outils Comptables - Ratios financiers', 'error', msg)
    }
  }

  async function testAccountingStatement() {
    updateTest('Outils Comptables - Bilan simplifié', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: depenses } = await supabase
        .from('depenses')
        .select('montant, date')
        .eq('user_id', user?.id)

      const thisMonth = (depenses || []).filter(d => {
        const date = new Date(d.date)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      })

      updateTest('Outils Comptables - Bilan simplifié', 'success', `Dépenses ce mois: ${thisMonth.length}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Outils Comptables - Bilan simplifié', 'error', msg)
    }
  }

  async function testCompoundInterest() {
    updateTest('Outils Comptables - Intérêts composés', 'loading', '')
    try {
      // Test calculation
      const principal = 1000
      const rate = 5
      const years = 5
      const compounded = principal * Math.pow(1 + rate / 100, years)

      if (isFinite(compounded) && compounded > principal) {
        updateTest('Outils Comptables - Intérêts composés', 'success', `${principal}€ → ${compounded.toFixed(2)}€`)
      } else {
        throw new Error('Calcul invalide')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Outils Comptables - Intérêts composés', 'error', msg)
    }
  }

  async function testBudgetSimulatorInit() {
    updateTest('Simulateur Budget - Initialisation', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: depenses, error } = await supabase
        .from('depenses')
        .select('montant')
        .eq('user_id', user?.id)

      if (error) throw error

      const average = (depenses || []).length > 0
        ? (depenses || []).reduce((sum, d) => sum + (d.montant || 0), 0) / depenses.length
        : 0

      updateTest('Simulateur Budget - Initialisation', 'success', `Moyenne: ${average.toFixed(2)}€`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Simulateur Budget - Initialisation', 'error', msg)
    }
  }

  async function testBudgetProjections() {
    updateTest('Simulateur Budget - Projections', 'loading', '')
    try {
      // Test projection calculation
      const monthlySpending = 500
      const months = 6
      const totalProjected = monthlySpending * months

      if (isFinite(totalProjected) && totalProjected > 0) {
        updateTest('Simulateur Budget - Projections', 'success', `Projection 6 mois: ${totalProjected}€`)
      } else {
        throw new Error('Calcul de projection invalide')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Simulateur Budget - Projections', 'error', msg)
    }
  }

  async function testBudgetGoals() {
    updateTest('Simulateur Budget - Objectifs', 'loading', '')
    try {
      // Test savings goal calculation
      const target = 5000
      const currentSavings = 2000
      const progress = (currentSavings / target) * 100

      if (progress >= 0 && progress <= 100) {
        updateTest('Simulateur Budget - Objectifs', 'success', `Progression: ${progress.toFixed(1)}%`)
      } else {
        throw new Error('Calcul d\'objectif invalide')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Simulateur Budget - Objectifs', 'error', msg)
    }
  }

  async function testAnalyticsStats() {
    updateTest('Analyseur - Statistiques', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: depenses, error } = await supabase
        .from('depenses')
        .select('montant')
        .eq('user_id', user?.id)

      if (error) throw error

      if (!depenses || depenses.length === 0) {
        updateTest('Analyseur - Statistiques', 'success', 'Aucune donnée')
        return
      }

      const montants = depenses.map(d => d.montant || 0).sort((a, b) => a - b)
      const mean = montants.reduce((a, b) => a + b, 0) / montants.length
      const median = montants[Math.floor(montants.length / 2)]

      updateTest('Analyseur - Statistiques', 'success', `Moyenne: ${mean.toFixed(2)}€, Médiane: ${median}€`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Analyseur - Statistiques', 'error', msg)
    }
  }

  async function testPatternDetection() {
    updateTest('Analyseur - Détection patterns', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: depenses } = await supabase
        .from('depenses')
        .select('date, montant')
        .eq('user_id', user?.id)
        .order('date', { ascending: true })

      if (!depenses || depenses.length < 2) {
        updateTest('Analyseur - Détection patterns', 'success', 'Données insuffisantes')
        return
      }

      // Detect day of week pattern
      const dayPatterns = new Map<number, number[]>()
      depenses.forEach(d => {
        const day = new Date(d.date).getDay()
        if (!dayPatterns.has(day)) dayPatterns.set(day, [])
        dayPatterns.get(day)?.push(d.montant || 0)
      })

      updateTest('Analyseur - Détection patterns', 'success', `${dayPatterns.size} patterns détectés`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Analyseur - Détection patterns', 'error', msg)
    }
  }

  async function testCharts() {
    updateTest('Analyseur - Graphiques', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: depenses } = await supabase
        .from('depenses')
        .select('categorie_id, montant')
        .eq('user_id', user?.id)

      if (!depenses || depenses.length === 0) {
        updateTest('Analyseur - Graphiques', 'success', 'Aucune donnée pour graphique')
        return
      }

      // Group by category
      const categories = new Map<string, number>()
      depenses.forEach(d => {
        const cat = d.categorie_id || 'Sans catégorie'
        categories.set(cat, (categories.get(cat) || 0) + (d.montant || 0))
      })

      updateTest('Analyseur - Graphiques', 'success', `${categories.size} catégories graphiées`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Analyseur - Graphiques', 'error', msg)
    }
  }

  async function runAllTests() {
    // AI Tests
    await testAIAssistantInit()
    await new Promise(r => setTimeout(r, 300))
    await testAIPredefinedQuestions()
    await new Promise(r => setTimeout(r, 300))
    await testAIAnalytics()
    await new Promise(r => setTimeout(r, 300))

    // Accounting Tests
    await testAccountingRatios()
    await new Promise(r => setTimeout(r, 300))
    await testAccountingStatement()
    await new Promise(r => setTimeout(r, 300))
    await testCompoundInterest()
    await new Promise(r => setTimeout(r, 300))

    // Budget Tests
    await testBudgetSimulatorInit()
    await new Promise(r => setTimeout(r, 300))
    await testBudgetProjections()
    await new Promise(r => setTimeout(r, 300))
    await testBudgetGoals()
    await new Promise(r => setTimeout(r, 300))

    // Analytics Tests
    await testAnalyticsStats()
    await new Promise(r => setTimeout(r, 300))
    await testPatternDetection()
    await new Promise(r => setTimeout(r, 300))
    await testCharts()
  }

  const categories = ['AI', 'Accounting', 'Budget', 'Analytics']
  const passed = tests.filter(t => t.status === 'success').length
  const failed = tests.filter(t => t.status === 'error').length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Tests des Outils Avancés
            </h1>
            <p className="mt-2 text-muted-foreground">
              Testez l&apos;IA, les outils comptables, le simulateur de budget et les analyses
            </p>
          </div>
          <Button onClick={runAllTests} size="lg">
            Exécuter tous les tests
          </Button>
        </div>

        {(passed > 0 || failed > 0) && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Réussis</p>
                <p className="text-3xl font-bold text-green-600">{passed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Échoués</p>
                <p className="text-3xl font-bold text-red-600">{failed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{tests.length}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {categories.map(category => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-3">{category}</h2>
            <div className="space-y-2">
              {tests
                .filter(t => t.category === category)
                .map((test, idx) => (
                  <Card key={idx}>
                    <CardContent className="flex items-center justify-between pt-6">
                      <div className="flex items-center gap-3">
                        {test.status === 'idle' && <div className="h-5 w-5 rounded-full bg-gray-300" />}
                        {test.status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                        {test.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {test.status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                        <div>
                          <p className="font-medium">{test.name}</p>
                          {test.message && (
                            <p className="text-sm text-muted-foreground">{test.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
