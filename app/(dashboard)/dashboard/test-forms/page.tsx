'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface FormTest {
  name: string
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
}

export default function TestFormsPage() {
  const [tests, setTests] = useState<FormTest[]>([
    { name: 'Ajouter une catégorie', status: 'idle', message: '' },
    { name: 'Modifier une catégorie', status: 'idle', message: '' },
    { name: 'Supprimer une catégorie', status: 'idle', message: '' },
    { name: 'Ajouter une dépense', status: 'idle', message: '' },
    { name: 'Modifier une dépense', status: 'idle', message: '' },
    { name: 'Supprimer une dépense', status: 'idle', message: '' },
    { name: 'Ajouter un retrait', status: 'idle', message: '' },
    { name: 'Modifier un retrait', status: 'idle', message: '' },
    { name: 'Supprimer un retrait', status: 'idle', message: '' },
    { name: 'Validation des montants', status: 'idle', message: '' },
    { name: 'Validation des données obligatoires', status: 'idle', message: '' },
  ])

  const supabase = createClient()

  const updateTest = (name: string, status: FormTest['status'], message: string) => {
    setTests(prev =>
      prev.map(t => (t.name === name ? { ...t, status, message } : t))
    )
  }

  async function testAddCategory() {
    updateTest('Ajouter une catégorie', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const categoryName = `TestCat-${Date.now()}`

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user?.id,
          nom: categoryName,
        })
        .select()
        .single()

      if (error) throw error
      window.categoryId = data.id
      updateTest('Ajouter une catégorie', 'success', `Créée: ${data.id}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Ajouter une catégorie', 'error', msg)
    }
  }

  async function testModifyCategory() {
    updateTest('Modifier une catégorie', 'loading', '')
    try {
      if (!window.categoryId) {
        throw new Error('Aucune catégorie créée. Exécutez le test précédent.')
      }

      const { data, error } = await supabase
        .from('categories')
        .update({ nom: `TestCat-Updated-${Date.now()}` })
        .eq('id', window.categoryId)
        .select()
        .single()

      if (error) throw error
      updateTest('Modifier une catégorie', 'success', `Modifiée: ${data.nom}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Modifier une catégorie', 'error', msg)
    }
  }

  async function testDeleteCategory() {
    updateTest('Supprimer une catégorie', 'loading', '')
    try {
      if (!window.categoryId) {
        throw new Error('Aucune catégorie créée. Exécutez le premier test.')
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', window.categoryId)

      if (error) throw error
      delete window.categoryId
      updateTest('Supprimer une catégorie', 'success', 'Supprimée avec succès')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Supprimer une catégorie', 'error', msg)
    }
  }

  async function testAddExpense() {
    updateTest('Ajouter une dépense', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('depenses')
        .insert({
          user_id: user?.id,
          date: new Date().toISOString().split('T')[0],
          designation: `TestExp-${Date.now()}`,
          montant: 45.50,
        })
        .select()
        .single()

      if (error) throw error
      window.depenseId = data.id
      updateTest('Ajouter une dépense', 'success', `Créée: ${data.id}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Ajouter une dépense', 'error', msg)
    }
  }

  async function testModifyExpense() {
    updateTest('Modifier une dépense', 'loading', '')
    try {
      if (!window.depenseId) {
        throw new Error('Aucune dépense créée. Exécutez le test précédent.')
      }

      const { data, error } = await supabase
        .from('depenses')
        .update({ montant: 75.25 })
        .eq('id', window.depenseId)
        .select()
        .single()

      if (error) throw error
      updateTest('Modifier une dépense', 'success', `Modifiée: ${data.montant}€`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Modifier une dépense', 'error', msg)
    }
  }

  async function testDeleteExpense() {
    updateTest('Supprimer une dépense', 'loading', '')
    try {
      if (!window.depenseId) {
        throw new Error('Aucune dépense créée. Exécutez le premier test.')
      }

      const { error } = await supabase
        .from('depenses')
        .delete()
        .eq('id', window.depenseId)

      if (error) throw error
      delete window.depenseId
      updateTest('Supprimer une dépense', 'success', 'Supprimée avec succès')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Supprimer une dépense', 'error', msg)
    }
  }

  async function testAddRetrait() {
    updateTest('Ajouter un retrait', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('retraits')
        .insert({
          user_id: user?.id,
          date: new Date().toISOString().split('T')[0],
          designation: `TestRet-${Date.now()}`,
          montant: 100.00,
        })
        .select()
        .single()

      if (error) throw error
      window.retraitId = data.id
      updateTest('Ajouter un retrait', 'success', `Créé: ${data.id}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Ajouter un retrait', 'error', msg)
    }
  }

  async function testModifyRetrait() {
    updateTest('Modifier un retrait', 'loading', '')
    try {
      if (!window.retraitId) {
        throw new Error('Aucun retrait créé. Exécutez le test précédent.')
      }

      const { data, error } = await supabase
        .from('retraits')
        .update({ montant: 150.00 })
        .eq('id', window.retraitId)
        .select()
        .single()

      if (error) throw error
      updateTest('Modifier un retrait', 'success', `Modifié: ${data.montant}€`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Modifier un retrait', 'error', msg)
    }
  }

  async function testDeleteRetrait() {
    updateTest('Supprimer un retrait', 'loading', '')
    try {
      if (!window.retraitId) {
        throw new Error('Aucun retrait créé. Exécutez le premier test.')
      }

      const { error } = await supabase
        .from('retraits')
        .delete()
        .eq('id', window.retraitId)

      if (error) throw error
      delete window.retraitId
      updateTest('Supprimer un retrait', 'success', 'Supprimé avec succès')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Supprimer un retrait', 'error', msg)
    }
  }

  async function testValidateAmounts() {
    updateTest('Validation des montants', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Test negative amount
      const { error } = await supabase
        .from('depenses')
        .insert({
          user_id: user?.id,
          date: new Date().toISOString().split('T')[0],
          designation: 'Test montant négatif',
          montant: -100,
        })

      if (!error) {
        throw new Error('Montant négatif devrait être rejeté')
      }
      updateTest('Validation des montants', 'success', 'Validation correcte')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Validation des montants', 'error', msg)
    }
  }

  async function testValidateRequired() {
    updateTest('Validation des données obligatoires', 'loading', '')
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Test missing date
      const { error } = await supabase
        .from('depenses')
        .insert({
          user_id: user?.id,
          designation: 'Test données manquantes',
          montant: 100,
        })

      if (!error) {
        throw new Error('Date manquante devrait être rejetée')
      }
      updateTest('Validation des données obligatoires', 'success', 'Validation correcte')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      updateTest('Validation des données obligatoires', 'error', msg)
    }
  }

  async function runAllTests() {
    await testAddCategory()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testModifyCategory()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testDeleteCategory()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testAddExpense()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testModifyExpense()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testDeleteExpense()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testAddRetrait()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testModifyRetrait()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testDeleteRetrait()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testValidateAmounts()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testValidateRequired()
  }

  const passed = tests.filter(t => t.status === 'success').length
  const failed = tests.filter(t => t.status === 'error').length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tests des Formulaires</h1>
            <p className="mt-2 text-muted-foreground">
              Testez les opérations CRUD (Créer, Lire, Modifier, Supprimer)
            </p>
          </div>
          <Button onClick={runAllTests} size="lg" className="gap-2">
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

        <div className="space-y-3">
          {tests.map((test, idx) => (
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
    </div>
  )
}

declare global {
  interface Window {
    categoryId?: string
    depenseId?: string
    retraitId?: string
  }
}
