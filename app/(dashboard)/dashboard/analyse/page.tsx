import { createClient } from "@/lib/supabase/server"
import { AnalyticsSummary } from "@/components/analytics/analytics-summary"
import { TrendAnalysis } from "@/components/analytics/trend-analysis"
import { CategoryAnalysis } from "@/components/analytics/category-analysis"
import { Forecasting } from "@/components/analytics/forecasting"
import { FinancialIndicators } from "@/components/analytics/financial-indicators"

export default async function AnalysePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all data for analysis
  const [depensesResult, retraitsResult, categoriesResult] = await Promise.all([
    supabase
      .from("depenses")
      .select("*, categories(nom)")
      .eq("user_id", user?.id)
      .order("date", { ascending: true }),
    supabase
      .from("retraits")
      .select("*")
      .eq("user_id", user?.id)
      .order("date", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user?.id),
  ])

  const depenses = depensesResult.data || []
  const retraits = retraitsResult.data || []
  const categories = categoriesResult.data || []

  // Calculate monthly data for the last 12 months
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return date.toISOString().slice(0, 7)
  }).reverse()

  const monthlyData = last12Months.map((month) => {
    const monthDepenses = depenses
      .filter((d) => d.date.startsWith(month))
      .reduce((sum, d) => sum + Number(d.montant), 0)
    const monthRetraits = retraits
      .filter((r) => r.date.startsWith(month))
      .reduce((sum, r) => sum + Number(r.montant), 0)
    
    const [year, monthNum] = month.split("-")
    const monthName = new Date(Number(year), Number(monthNum) - 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
    
    return {
      month,
      name: monthName,
      depenses: monthDepenses,
      retraits: monthRetraits,
      solde: monthRetraits - monthDepenses,
    }
  })

  // Calculate totals
  const totalDepenses = depenses.reduce((sum, d) => sum + Number(d.montant), 0)
  const totalRetraits = retraits.reduce((sum, r) => sum + Number(r.montant), 0)
  const solde = totalRetraits - totalDepenses

  // Expenses by category
  const depensesByCategory = categories.map((cat) => {
    const catDepenses = depenses.filter((d) => d.categorie_id === cat.id)
    const total = catDepenses.reduce((sum, d) => sum + Number(d.montant), 0)
    return {
      id: cat.id,
      name: cat.nom,
      value: total,
      count: catDepenses.length,
      percentage: totalDepenses > 0 ? (total / totalDepenses) * 100 : 0,
    }
  }).filter((item) => item.value > 0).sort((a, b) => b.value - a.value)

  // Calculate averages for forecasting
  const avgMonthlyDepenses = monthlyData.length > 0 
    ? monthlyData.reduce((sum, m) => sum + m.depenses, 0) / monthlyData.filter(m => m.depenses > 0).length || 0
    : 0
  const avgMonthlyRetraits = monthlyData.length > 0 
    ? monthlyData.reduce((sum, m) => sum + m.retraits, 0) / monthlyData.filter(m => m.retraits > 0).length || 0
    : 0

  // Calculate trend (comparing last 3 months to previous 3 months)
  const last3Months = monthlyData.slice(-3)
  const prev3Months = monthlyData.slice(-6, -3)
  
  const last3DepensesAvg = last3Months.length > 0 
    ? last3Months.reduce((sum, m) => sum + m.depenses, 0) / last3Months.length 
    : 0
  const prev3DepensesAvg = prev3Months.length > 0 
    ? prev3Months.reduce((sum, m) => sum + m.depenses, 0) / prev3Months.length 
    : 0
  
  const depensesTrend = prev3DepensesAvg > 0 
    ? ((last3DepensesAvg - prev3DepensesAvg) / prev3DepensesAvg) * 100 
    : 0

  const last3RetraitsAvg = last3Months.length > 0 
    ? last3Months.reduce((sum, m) => sum + m.retraits, 0) / last3Months.length 
    : 0
  const prev3RetraitsAvg = prev3Months.length > 0 
    ? prev3Months.reduce((sum, m) => sum + m.retraits, 0) / prev3Months.length 
    : 0
  
  const retraitsTrend = prev3RetraitsAvg > 0 
    ? ((last3RetraitsAvg - prev3RetraitsAvg) / prev3RetraitsAvg) * 100 
    : 0

  // Financial indicators
  const savingsRate = totalRetraits > 0 ? ((totalRetraits - totalDepenses) / totalRetraits) * 100 : 0
  const expenseRatio = totalRetraits > 0 ? (totalDepenses / totalRetraits) * 100 : 0
  const avgTransactionDepense = depenses.length > 0 ? totalDepenses / depenses.length : 0
  const avgTransactionRetrait = retraits.length > 0 ? totalRetraits / retraits.length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analyse et Prévisions</h1>
        <p className="text-muted-foreground">Analysez vos données financières et anticipez vos dépenses</p>
      </div>

      <AnalyticsSummary
        totalDepenses={totalDepenses}
        totalRetraits={totalRetraits}
        solde={solde}
        depensesTrend={depensesTrend}
        retraitsTrend={retraitsTrend}
        transactionCount={depenses.length + retraits.length}
      />

      <FinancialIndicators
        savingsRate={savingsRate}
        expenseRatio={expenseRatio}
        avgTransactionDepense={avgTransactionDepense}
        avgTransactionRetrait={avgTransactionRetrait}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendAnalysis monthlyData={monthlyData} />
        <CategoryAnalysis categories={depensesByCategory} />
      </div>

      <Forecasting
        avgMonthlyDepenses={avgMonthlyDepenses}
        avgMonthlyRetraits={avgMonthlyRetraits}
        depensesTrend={depensesTrend}
        retraitsTrend={retraitsTrend}
        monthlyData={monthlyData}
      />
    </div>
  )
}
