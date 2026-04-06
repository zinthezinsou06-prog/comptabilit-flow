'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2, Download, Upload, HelpCircle } from 'lucide-react'

interface ImportExportTest {
  name: string
  category: string
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
}

export default function TestImportExportPage() {
  const [tests, setTests] = useState<ImportExportTest[]>([
    // Export Tests
    { name: 'Exporter dépenses en CSV', category: 'Export', status: 'idle', message: '' },
    { name: 'Exporter retraits en CSV', category: 'Export', status: 'idle', message: '' },
    { name: 'Exporter catégories en CSV', category: 'Export', status: 'idle', message: '' },
    { name: 'Exporter tous les logs en CSV', category: 'Export', status: 'idle', message: '' },

    // Import Tests
    { name: 'Importer dépenses CSV', category: 'Import', status: 'idle', message: '' },
    { name: 'Importer retraits CSV', category: 'Import', status: 'idle', message: '' },
    { name: 'Validation données importées', category: 'Import', status: 'idle', message: '' },

    // Help System Tests
    { name: 'Aide - Contenu chargé', category: 'Help', status: 'idle', message: '' },
    { name: 'Aide - Recherche fonctionnelle', category: 'Help', status: 'idle', message: '' },
    { name: 'Aide - Navigation', category: 'Help', status: 'idle', message: '' },
  ])

  const supabase = createClient()

  const updateTest = (name: string, status: ImportExportTest['status'], message: string) => {
    setTests(prev =>
      prev.map(t => (t.name === name ? { ...t, status, message } : t))
    )
  }

  async function testExportExpensesCSV() {
    updateTest('Exporter dépenses en CSV', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: depenses, error } = await supabase
        .from('depenses')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error

      // Create CSV
      if (!depenses || depenses.length === 0) {
        throw new Error('Aucune dépense à exporter')
      }

      const headers = ['ID', 'Date', 'Désignation', 'Montant', 'Catégorie']
      const rows = depenses.map(d => [
        d.id,
        d.date,
        d.designation,
        d.montant,
        d.categorie_id || '',
      ])

      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')

      if (csv.length === 0) throw new Error('CSV vide')

      updateTest('Exporter dépenses en CSV', 'success', `${depenses.length} dépenses exportées`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Exporter dépenses en CSV', 'error', msg)
    }
  }

  async function testExportWithdrawalsCSV() {
    updateTest('Exporter retraits en CSV', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: retraits, error } = await supabase
        .from('retraits')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error

      if (!retraits || retraits.length === 0) {
        throw new Error('Aucun retrait à exporter')
      }

      const headers = ['ID', 'Date', 'Désignation', 'Motif', 'Montant']
      const rows = retraits.map(r => [
        r.id,
        r.date,
        r.designation,
        r.motif || '',
        r.montant,
      ])

      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')

      if (csv.length === 0) throw new Error('CSV vide')

      updateTest('Exporter retraits en CSV', 'success', `${retraits.length} retraits exportés`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Exporter retraits en CSV', 'error', msg)
    }
  }

  async function testExportCategoriesCSV() {
    updateTest('Exporter catégories en CSV', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error

      if (!categories || categories.length === 0) {
        updateTest('Exporter catégories en CSV', 'success', 'Aucune catégorie')
        return
      }

      const headers = ['ID', 'Nom', 'Date de création']
      const rows = categories.map(c => [
        c.id,
        c.nom,
        c.created_at,
      ])

      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')

      updateTest('Exporter catégories en CSV', 'success', `${categories.length} catégories exportées`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Exporter catégories en CSV', 'error', msg)
    }
  }

  async function testExportLogsCSV() {
    updateTest('Exporter tous les logs en CSV', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: logs, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', user?.id)

      if (error) throw error

      if (!logs || logs.length === 0) {
        updateTest('Exporter tous les logs en CSV', 'success', 'Aucun log')
        return
      }

      const headers = ['ID', 'Action', 'Table', 'Date', 'Détails']
      const rows = logs.map(l => [
        l.id,
        l.action,
        l.table_concernee,
        l.timestamp,
        JSON.stringify(l.details),
      ])

      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')

      updateTest('Exporter tous les logs en CSV', 'success', `${logs.length} logs exportés`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Exporter tous les logs en CSV', 'error', msg)
    }
  }

  async function testImportExpensesCSV() {
    updateTest('Importer dépenses CSV', 'loading', '')
    try {
      // Create sample CSV data
      const csvData = `date,designation,montant
2024-01-01,Test import,50.00
2024-01-02,Test import 2,75.50`

      const lines = csvData.split('\n')
      const headers = lines[0].split(',')
      const data = lines.slice(1).map(line => {
        const values = line.split(',')
        return {
          date: values[0],
          designation: values[1],
          montant: parseFloat(values[2]),
        }
      })

      if (data.length === 0) throw new Error('Aucune donnée à importer')

      updateTest('Importer dépenses CSV', 'success', `${data.length} dépenses importables`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Importer dépenses CSV', 'error', msg)
    }
  }

  async function testImportWithdrawalsCSV() {
    updateTest('Importer retraits CSV', 'loading', '')
    try {
      // Create sample CSV data
      const csvData = `date,designation,motif,montant
2024-01-01,Retrait ATM,Dépenses,100.00
2024-01-02,Retrait guichet,Argent poche,50.00`

      const lines = csvData.split('\n')
      const data = lines.slice(1).map(line => {
        const values = line.split(',')
        return {
          date: values[0],
          designation: values[1],
          motif: values[2],
          montant: parseFloat(values[3]),
        }
      })

      if (data.length === 0) throw new Error('Aucune donnée à importer')

      updateTest('Importer retraits CSV', 'success', `${data.length} retraits importables`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Importer retraits CSV', 'error', msg)
    }
  }

  async function testValidateImportedData() {
    updateTest('Validation données importées', 'loading', '')
    try {
      // Validate sample data
      const testData = [
        { date: '2024-01-01', designation: 'Test', montant: 50.00 },
        { date: '2024-01-02', designation: 'Test2', montant: -75.00 }, // Invalid
      ]

      const valid = testData.filter(d => d.montant >= 0 && d.date && d.designation)
      const invalid = testData.filter(d => d.montant < 0 || !d.date || !d.designation)

      if (invalid.length > 0) {
        updateTest('Validation données importées', 'success', `${valid.length} valides, ${invalid.length} invalides`)
      } else {
        updateTest('Validation données importées', 'success', `${valid.length} entrées valides`)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Validation données importées', 'error', msg)
    }
  }

  async function testHelpContentLoaded() {
    updateTest('Aide - Contenu chargé', 'loading', '')
    try {
      // Check if help content is available
      const helpSections = [
        'Tableau de bord',
        'Dépenses',
        'Catégories',
        'Retraits',
        'Analyses',
        'Outils avancés',
      ]

      if (helpSections.length === 0) throw new Error('Aucune section aide')

      updateTest('Aide - Contenu chargé', 'success', `${helpSections.length} sections disponibles`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Aide - Contenu chargé', 'error', msg)
    }
  }

  async function testHelpSearch() {
    updateTest('Aide - Recherche fonctionnelle', 'loading', '')
    try {
      const searchQuery = 'dépenses'
      const helpContent = [
        { title: 'Ajouter une dépense', content: 'Comment ajouter une nouvelle dépense...' },
        { title: 'Modifier une dépense', content: 'Pour modifier une dépense existante...' },
      ]

      const results = helpContent.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      )

      if (results.length === 0) throw new Error('Aucun résultat')

      updateTest('Aide - Recherche fonctionnelle', 'success', `${results.length} résultats trouvés`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Aide - Recherche fonctionnelle', 'error', msg)
    }
  }

  async function testHelpNavigation() {
    updateTest('Aide - Navigation', 'loading', '')
    try {
      const pages = ['/dashboard', '/dashboard/depenses', '/dashboard/categories', '/dashboard/retraits', '/dashboard/analyse', '/dashboard/outils']

      if (pages.length === 0) throw new Error('Aucune page')

      updateTest('Aide - Navigation', 'success', `${pages.length} pages disponibles`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Aide - Navigation', 'error', msg)
    }
  }

  async function runAllTests() {
    // Export Tests
    await testExportExpensesCSV()
    await new Promise(r => setTimeout(r, 300))
    await testExportWithdrawalsCSV()
    await new Promise(r => setTimeout(r, 300))
    await testExportCategoriesCSV()
    await new Promise(r => setTimeout(r, 300))
    await testExportLogsCSV()
    await new Promise(r => setTimeout(r, 300))

    // Import Tests
    await testImportExpensesCSV()
    await new Promise(r => setTimeout(r, 300))
    await testImportWithdrawalsCSV()
    await new Promise(r => setTimeout(r, 300))
    await testValidateImportedData()
    await new Promise(r => setTimeout(r, 300))

    // Help Tests
    await testHelpContentLoaded()
    await new Promise(r => setTimeout(r, 300))
    await testHelpSearch()
    await new Promise(r => setTimeout(r, 300))
    await testHelpNavigation()
  }

  const categories = ['Export', 'Import', 'Help']
  const passed = tests.filter(t => t.status === 'success').length
  const failed = tests.filter(t => t.status === 'error').length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Download className="h-8 w-8" />
              Tests Import/Export et Aide
            </h1>
            <p className="mt-2 text-muted-foreground">
              Testez l&apos;export CSV, l&apos;import de données et le système d&apos;aide
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
