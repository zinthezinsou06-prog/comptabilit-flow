import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard/stats"
import { DashboardCharts } from "@/components/dashboard/charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch summary data
  const [depensesResult, retraitsResult, categoriesResult] = await Promise.all([
    supabase
      .from("depenses")
      .select("montant, date, categorie_id, categories(nom)")
      .eq("user_id", user?.id)
      .order("date", { ascending: false }),
    supabase
      .from("retraits")
      .select("montant, date, designation, motif")
      .eq("user_id", user?.id)
      .order("date", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user?.id),
  ])

  const depenses = depensesResult.data || []
  const retraits = retraitsResult.data || []
  const categories = categoriesResult.data || []

  // Calculate totals
  const totalDepenses = depenses.reduce((sum, d) => sum + Number(d.montant), 0)
  const totalRetraits = retraits.reduce((sum, r) => sum + Number(r.montant), 0)
  const solde = totalRetraits - totalDepenses

  // Group expenses by category for chart
  const depensesByCategory = categories.map((cat) => ({
    name: cat.nom,
    value: depenses
      .filter((d) => d.categorie_id === cat.id)
      .reduce((sum, d) => sum + Number(d.montant), 0),
  })).filter((item) => item.value > 0)

  // Group by month for trend chart
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return date.toISOString().slice(0, 7)
  }).reverse()

  const monthlyData = last6Months.map((month) => {
    const monthDepenses = depenses
      .filter((d) => d.date.startsWith(month))
      .reduce((sum, d) => sum + Number(d.montant), 0)
    const monthRetraits = retraits
      .filter((r) => r.date.startsWith(month))
      .reduce((sum, r) => sum + Number(r.montant), 0)
    
    const [year, monthNum] = month.split("-")
    const monthName = new Date(Number(year), Number(monthNum) - 1).toLocaleDateString("fr-FR", { month: "short" })
    
    return {
      name: monthName,
      depenses: monthDepenses,
      retraits: monthRetraits,
    }
  })

  // Recent transactions (last 5)
  const recentDepenses = depenses.slice(0, 5).map((d) => ({
    ...d,
    type: "depense" as const,
  }))
  const recentRetraits = retraits.slice(0, 5).map((r) => ({
    ...r,
    type: "retrait" as const,
  }))
  const recentTransactions = [...recentDepenses, ...recentRetraits]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de votre comptabilité</p>
      </div>

      <DashboardStats
        totalDepenses={totalDepenses}
        totalRetraits={totalRetraits}
        solde={solde}
        transactionCount={depenses.length + retraits.length}
      />

      <DashboardCharts
        depensesByCategory={depensesByCategory}
        monthlyData={monthlyData}
      />

      <RecentTransactions transactions={recentTransactions} />
    </div>
  )
}
