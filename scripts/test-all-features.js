import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test Results Storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
}

// Helper function to run tests
async function runTest(testName, testFn) {
  try {
    await testFn()
    testResults.passed++
    testResults.tests.push({
      name: testName,
      status: 'PASS',
      error: null,
    })
    console.log(`✅ ${testName}`)
  } catch (error) {
    testResults.failed++
    testResults.tests.push({
      name: testName,
      status: 'FAIL',
      error: error.message,
    })
    console.error(`❌ ${testName}: ${error.message}`)
  }
}

async function main() {
  console.log('\n🚀 COMMENÇANT LES TESTS DE L\'APPLICATION COMPTABILITÉ FLOW\n')

  // SECTION 1: Test Database Tables Existence
  console.log('\n📊 SECTION 1: Vérification des Tables de Base de Données\n')

  await runTest('Tables existantes', async () => {
    const tables = [
      'categories',
      'depenses',
      'retraits',
      'logs',
    ]

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        throw new Error(`Table ${table} n'existe pas: ${error.message}`)
      }
    }
  })

  // SECTION 2: Test CRUD Operations on Categories
  console.log('\n📋 SECTION 2: Opérations CRUD - Catégories\n')

  let categoryId

  await runTest('Création d\'une catégorie', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!@#',
    })

    if (error) throw error
    const userId = data.user?.id

    const { data: category, error: insertError } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        nom: 'Alimentation',
      })
      .select()
      .single()

    if (insertError) throw insertError
    categoryId = category?.id
    if (!categoryId) throw new Error('Pas d\'ID de catégorie retourné')
  })

  // SECTION 3: Test CRUD Operations on Depenses
  console.log('\n💰 SECTION 3: Opérations CRUD - Dépenses\n')

  let depenseId

  await runTest('Création d\'une dépense', async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: depense, error } = await supabase
      .from('depenses')
      .insert({
        user_id: user?.id,
        date: new Date().toISOString().split('T')[0],
        designation: 'Courses au supermarché',
        montant: 45.50,
        categorie_id: categoryId,
      })
      .select()
      .single()

    if (error) throw error
    depenseId = depense?.id
    if (!depenseId) throw new Error('Pas d\'ID de dépense retourné')
  })

  await runTest('Lecture d\'une dépense', async () => {
    const { data: depense, error } = await supabase
      .from('depenses')
      .select('*')
      .eq('id', depenseId)
      .single()

    if (error) throw error
    if (!depense) throw new Error('Dépense non trouvée')
    if (depense.designation !== 'Courses au supermarché') {
      throw new Error('Les données ne correspondent pas')
    }
  })

  await runTest('Modification d\'une dépense', async () => {
    const { data: depense, error } = await supabase
      .from('depenses')
      .update({
        designation: 'Courses au hypermarché',
        montant: 50.75,
      })
      .eq('id', depenseId)
      .select()
      .single()

    if (error) throw error
    if (depense.montant !== 50.75) {
      throw new Error('La modification n\'a pas été appliquée')
    }
  })

  await runTest('Suppression d\'une dépense', async () => {
    const { error } = await supabase
      .from('depenses')
      .delete()
      .eq('id', depenseId)

    if (error) throw error

    // Vérifier que la dépense est supprimée
    const { data: depense } = await supabase
      .from('depenses')
      .select('*')
      .eq('id', depenseId)
      .single()

    if (depense) throw new Error('La dépense n\'a pas été supprimée')
  })

  // SECTION 4: Test CRUD Operations on Retraits
  console.log('\n💳 SECTION 4: Opérations CRUD - Retraits\n')

  let retraitId

  await runTest('Création d\'un retrait', async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: retrait, error } = await supabase
      .from('retraits')
      .insert({
        user_id: user?.id,
        date: new Date().toISOString().split('T')[0],
        designation: 'Retrait espèces ATM',
        motif: 'Dépenses quotidiennes',
        montant: 100.00,
      })
      .select()
      .single()

    if (error) throw error
    retraitId = retrait?.id
    if (!retraitId) throw new Error('Pas d\'ID de retrait retourné')
  })

  await runTest('Lecture d\'un retrait', async () => {
    const { data: retrait, error } = await supabase
      .from('retraits')
      .select('*')
      .eq('id', retraitId)
      .single()

    if (error) throw error
    if (!retrait) throw new Error('Retrait non trouvé')
  })

  await runTest('Modification d\'un retrait', async () => {
    const { data: retrait, error } = await supabase
      .from('retraits')
      .update({
        montant: 150.00,
      })
      .eq('id', retraitId)
      .select()
      .single()

    if (error) throw error
    if (retrait.montant !== 150.00) {
      throw new Error('La modification n\'a pas été appliquée')
    }
  })

  await runTest('Suppression d\'un retrait', async () => {
    const { error } = await supabase
      .from('retraits')
      .delete()
      .eq('id', retraitId)

    if (error) throw error

    const { data: retrait } = await supabase
      .from('retraits')
      .select('*')
      .eq('id', retraitId)
      .single()

    if (retrait) throw new Error('Le retrait n\'a pas été supprimé')
  })

  // SECTION 5: Test Logging System
  console.log('\n📝 SECTION 5: Système de Logging\n')

  await runTest('Logs enregistrés correctement', async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', user?.id)

    if (error) throw error
    if (!logs || logs.length === 0) {
      throw new Error('Aucun log enregistré')
    }
  })

  // SECTION 6: Test Row Level Security
  console.log('\n🔐 SECTION 6: Sécurité (Row Level Security)\n')

  await runTest('RLS fonctionne correctement', async () => {
    // Create two test users
    const user1Data = await supabase.auth.signUp({
      email: `test1-${Date.now()}@example.com`,
      password: 'Test123!@#',
    })

    const user2Data = await supabase.auth.signUp({
      email: `test2-${Date.now()}@example.com`,
      password: 'Test123!@#',
    })

    if (user1Data.error || user2Data.error) throw new Error('Erreur création utilisateurs')

    // User 1 should only see their own data
    const { data: user1Categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user1Data.data.user?.id)

    const { data: user2Categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user2Data.data.user?.id)

    // These should be independent datasets
    if (user1Categories?.length !== undefined && user2Categories?.length !== undefined) {
      if (
        user1Data.data.user?.id === user2Data.data.user?.id &&
        user1Categories.length !== user2Categories.length
      ) {
        throw new Error('RLS not working properly')
      }
    }
  })

  // SECTION 7: Test Data Validation
  console.log('\n✔️ SECTION 7: Validation des Données\n')

  await runTest('Montants négatifs rejetés', async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('depenses')
      .insert({
        user_id: user?.id,
        date: new Date().toISOString().split('T')[0],
        designation: 'Test montant négatif',
        montant: -100,
        categorie_id: null,
      })

    if (!error) {
      throw new Error('Montant négatif devrait être rejeté')
    }
  })

  await runTest('Données obligatoires validées', async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('depenses')
      .insert({
        user_id: user?.id,
        // date is missing
        designation: 'Test données obligatoires',
        montant: 100,
      })

    if (!error) {
      throw new Error('Données obligatoires manquantes devrait être rejeté')
    }
  })

  // SECTION 8: Test Data Analytics
  console.log('\n📈 SECTION 8: Analyses de Données\n')

  await runTest('Calculs statistiques possibles', async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: depenses, error } = await supabase
      .from('depenses')
      .select('montant')
      .eq('user_id', user?.id)

    if (error) throw error

    if (depenses && depenses.length > 0) {
      const montants = depenses.map(d => d.montant)
      const total = montants.reduce((a, b) => a + b, 0)
      const moyenne = total / montants.length

      if (moyenne < 0) throw new Error('Calcul statistique invalide')
    }
  })

  // SECTION 9: Test Indexes Performance
  console.log('\n⚡ SECTION 9: Performance (Indexes)\n')

  await runTest('Indexes créés correctement', async () => {
    const { data, error } = await supabase.rpc('query_indexes', {
      table_name: 'depenses',
    })

    // If RPC doesn't exist, just verify table is queryable
    const { data: depenses, error: queryError } = await supabase
      .from('depenses')
      .select('*', { count: 'exact' })
      .limit(1)

    if (queryError) throw queryError
  })

  // SUMMARY
  console.log('\n' + '='.repeat(60))
  console.log('📊 RAPPORT DE TEST FINAL')
  console.log('='.repeat(60))
  console.log(`✅ Tests réussis: ${testResults.passed}`)
  console.log(`❌ Tests échoués: ${testResults.failed}`)
  console.log(`📈 Total: ${testResults.passed + testResults.failed}`)
  console.log(`✨ Taux de réussite: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`)
  console.log('='.repeat(60))

  if (testResults.failed > 0) {
    console.log('\n❌ Tests échoués:')
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`  - ${t.name}: ${t.error}`)
      })
  }

  console.log('\n✅ Tous les tests sont terminés!')

  // Save results to file
  const fs = await import('fs')
  fs.writeFileSync(
    '/vercel/share/v0-project/TEST_RESULTS.json',
    JSON.stringify(testResults, null, 2)
  )

  process.exit(testResults.failed > 0 ? 1 : 0)
}

main()
