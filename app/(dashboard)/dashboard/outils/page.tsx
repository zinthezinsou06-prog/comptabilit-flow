import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIFinancialAssistant } from "@/components/tools/ai-financial-assistant"
import { AccountingTools } from "@/components/tools/accounting-tools"
import { BudgetSimulator } from "@/components/tools/budget-simulator"
import { DataAnalyzer } from "@/components/tools/data-analyzer"
import { Bot, Calculator, TrendingUp, Database, Sparkles } from "lucide-react"

export default async function OutilsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all data for analysis tools
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

  // Calculate averages
  const avgMonthlyDepenses = monthlyData.length > 0 
    ? monthlyData.reduce((sum, m) => sum + m.depenses, 0) / monthlyData.filter(m => m.depenses > 0).length || 0
    : 0
  const avgMonthlyRetraits = monthlyData.length > 0 
    ? monthlyData.reduce((sum, m) => sum + m.retraits, 0) / monthlyData.filter(m => m.retraits > 0).length || 0
    : 0

  // Financial metrics
  const savingsRate = totalRetraits > 0 ? ((totalRetraits - totalDepenses) / totalRetraits) * 100 : 0
  const expenseRatio = totalRetraits > 0 ? (totalDepenses / totalRetraits) * 100 : 0

  const financialData = {
    totalDepenses,
    totalRetraits,
    solde: totalRetraits - totalDepenses,
    savingsRate,
    expenseRatio,
    avgMonthlyDepenses,
    avgMonthlyRetraits,
    monthlyData,
    depensesByCategory,
    transactionCount: depenses.length + retraits.length,
    depenses,
    retraits,
    categories,
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Outils Avances</h1>
        </div>
        <p className="text-muted-foreground">
          Analyse de donnees, comptabilite et prevision avec assistance IA
        </p>
      </div>

      <Tabs defaultValue="ai-assistant" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger 
            value="ai-assistant" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border rounded-lg py-3"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Assistant IA</span>
            <span className="sm:hidden">IA</span>
          </TabsTrigger>
          <TabsTrigger 
            value="accounting" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border rounded-lg py-3"
          >
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Comptabilite</span>
            <span className="sm:hidden">Compta</span>
          </TabsTrigger>
          <TabsTrigger 
            value="simulator" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border rounded-lg py-3"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Simulation</span>
            <span className="sm:hidden">Simul</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analyzer" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border rounded-lg py-3"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Analyseur</span>
            <span className="sm:hidden">Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-assistant" className="mt-6">
          <AIFinancialAssistant financialData={financialData} />
        </TabsContent>

        <TabsContent value="accounting" className="mt-6">
          <AccountingTools financialData={financialData} />
        </TabsContent>

        <TabsContent value="simulator" className="mt-6">
          <BudgetSimulator financialData={financialData} />
        </TabsContent>

        <TabsContent value="analyzer" className="mt-6">
          <DataAnalyzer financialData={financialData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
