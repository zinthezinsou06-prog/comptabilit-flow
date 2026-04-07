"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts"
import {
  TrendingUp,
  Target,
  Calendar,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  RefreshCw,
  PlayCircle,
  PauseCircle,
} from "lucide-react"

interface FinancialData {
  totalDepenses: number
  totalRetraits: number
  solde: number
  savingsRate: number
  expenseRatio: number
  avgMonthlyDepenses: number
  avgMonthlyRetraits: number
  monthlyData: Array<{
    month: string
    name: string
    depenses: number
    retraits: number
    solde: number
  }>
  depensesByCategory: Array<{
    id: string
    name: string
    value: number
    count: number
    percentage: number
  }>
  transactionCount: number
  depenses: Array<{ id: string; montant: number; date: string; description: string; categorie_id: string }>
  retraits: Array<{ id: string; montant: number; date: string; description: string }>
  categories: Array<{ id: string; nom: string }>
}

interface BudgetSimulatorProps {
  financialData: FinancialData
}

export function BudgetSimulator({ financialData }: BudgetSimulatorProps) {
  // Scenario states
  const [expenseReduction, setExpenseReduction] = useState(0)
  const [incomeIncrease, setIncomeIncrease] = useState(0)
  const [savingsGoal, setSavingsGoal] = useState("")
  const [timelineMonths, setTimelineMonths] = useState(12)
  const [isSimulating, setIsSimulating] = useState(false)

  // Category adjustments
  const [categoryAdjustments, setCategoryAdjustments] = useState<Record<string, number>>({})

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate projections based on adjustments
  const projections = useMemo(() => {
    const baseMonthlyExpense = financialData.avgMonthlyDepenses
    const baseMonthlyIncome = financialData.avgMonthlyRetraits
    
    // Apply global adjustments
    const adjustedExpenses = baseMonthlyExpense * (1 - expenseReduction / 100)
    const adjustedIncome = baseMonthlyIncome * (1 + incomeIncrease / 100)
    
    // Calculate category-specific reductions
    const categoryReductions = Object.entries(categoryAdjustments).reduce((sum, [categoryId, reduction]) => {
      return sum + (financialData.depensesByCategory.find(c => c.id === categoryId)?.value || 0) * (reduction / 100)
    }, 0)
    
    const finalMonthlyExpenses = adjustedExpenses - (categoryReductions / 12)
    const monthlySavings = adjustedIncome - finalMonthlyExpenses
    const newSavingsRate = adjustedIncome > 0 ? (monthlySavings / adjustedIncome) * 100 : 0
    
    // Generate projection data
    const projectionData = []
    let cumulativeSavings = financialData.solde
    
    for (let i = 1; i <= timelineMonths; i++) {
      cumulativeSavings += monthlySavings
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      const monthName = date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
      
      projectionData.push({
        month: i,
        name: monthName,
        savings: Math.round(cumulativeSavings),
        baseline: Math.round(financialData.solde + (financialData.avgMonthlyRetraits - financialData.avgMonthlyDepenses) * i),
        depenses: Math.round(finalMonthlyExpenses),
        revenus: Math.round(adjustedIncome),
      })
    }
    
    // Calculate goal achievement
    const goalAmount = parseFloat(savingsGoal) || 0
    const monthsToGoal = monthlySavings > 0 
      ? Math.ceil((goalAmount - financialData.solde) / monthlySavings)
      : Infinity
    
    return {
      adjustedExpenses: finalMonthlyExpenses,
      adjustedIncome,
      monthlySavings,
      newSavingsRate,
      projectionData,
      totalSavingsAtEnd: cumulativeSavings,
      monthsToGoal: monthsToGoal > 0 ? monthsToGoal : null,
      improvementFromBaseline: cumulativeSavings - (financialData.solde + (financialData.avgMonthlyRetraits - financialData.avgMonthlyDepenses) * timelineMonths),
    }
  }, [financialData, expenseReduction, incomeIncrease, categoryAdjustments, timelineMonths, savingsGoal])

  // Scenario comparison data
  const scenarioComparison = [
    {
      name: "Actuel",
      epargne: financialData.avgMonthlyRetraits - financialData.avgMonthlyDepenses,
      depenses: financialData.avgMonthlyDepenses,
      revenus: financialData.avgMonthlyRetraits,
    },
    {
      name: "Simule",
      epargne: projections.monthlySavings,
      depenses: projections.adjustedExpenses,
      revenus: projections.adjustedIncome,
    },
  ]

  const resetSimulation = () => {
    setExpenseReduction(0)
    setIncomeIncrease(0)
    setCategoryAdjustments({})
    setSavingsGoal("")
  }

  const applyPreset = (preset: "conservative" | "moderate" | "aggressive") => {
    switch (preset) {
      case "conservative":
        setExpenseReduction(5)
        setIncomeIncrease(0)
        break
      case "moderate":
        setExpenseReduction(10)
        setIncomeIncrease(5)
        break
      case "aggressive":
        setExpenseReduction(20)
        setIncomeIncrease(10)
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Simulateur de Budget</h2>
          <p className="text-sm text-muted-foreground">
            Ajustez les parametres pour voir l&apos;impact sur vos finances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetSimulation}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reinitialiser
          </Button>
          <Button 
            size="sm" 
            onClick={() => setIsSimulating(!isSimulating)}
            className="gap-1"
          >
            {isSimulating ? (
              <>
                <PauseCircle className="h-4 w-4" />
                Arreter
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Simuler
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preset Scenarios */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Scenarios Predefinies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => applyPreset("conservative")}>
              Prudent (-5% depenses)
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("moderate")}>
              Modere (-10% / +5%)
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("aggressive")}>
              Ambitieux (-20% / +10%)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Adjustment Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Parametres de Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Expense Reduction */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Reduction des depenses</Label>
                <Badge variant={expenseReduction > 0 ? "default" : "secondary"}>
                  -{expenseReduction}%
                </Badge>
              </div>
              <Slider
                value={[expenseReduction]}
                onValueChange={([value]) => setExpenseReduction(value)}
                max={50}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Economie: {formatCurrency(financialData.avgMonthlyDepenses * expenseReduction / 100)}/mois
              </p>
            </div>

            {/* Income Increase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Augmentation des revenus</Label>
                <Badge variant={incomeIncrease > 0 ? "default" : "secondary"}>
                  +{incomeIncrease}%
                </Badge>
              </div>
              <Slider
                value={[incomeIncrease]}
                onValueChange={([value]) => setIncomeIncrease(value)}
                max={50}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Gain: {formatCurrency(financialData.avgMonthlyRetraits * incomeIncrease / 100)}/mois
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Horizon de projection</Label>
                <Badge variant="secondary">
                  {timelineMonths} mois
                </Badge>
              </div>
              <Slider
                value={[timelineMonths]}
                onValueChange={([value]) => setTimelineMonths(value)}
                min={3}
                max={36}
                step={3}
                className="w-full"
              />
            </div>

            {/* Savings Goal */}
            <div className="space-y-2">
              <Label className="text-sm">Objectif d&apos;epargne</Label>
              <Input
                type="number"
                placeholder="Ex: 10000"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
              />
              {projections.monthsToGoal && projections.monthsToGoal < Infinity && (
                <p className="text-xs text-accent">
                  Objectif atteint en {projections.monthsToGoal} mois
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resultats de la Simulation</CardTitle>
            <CardDescription>
              Comparaison entre votre situation actuelle et le scenario simule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="comparison">
              <TabsList className="mb-4">
                <TabsTrigger value="comparison">Comparaison</TabsTrigger>
                <TabsTrigger value="projection">Projection</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison">
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Depenses mensuelles</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold">{formatCurrency(projections.adjustedExpenses)}</span>
                        {expenseReduction > 0 && (
                          <span className="flex items-center text-xs text-accent">
                            <ArrowDownRight className="h-3 w-3" />
                            -{expenseReduction}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Revenus mensuels</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold">{formatCurrency(projections.adjustedIncome)}</span>
                        {incomeIncrease > 0 && (
                          <span className="flex items-center text-xs text-accent">
                            <ArrowUpRight className="h-3 w-3" />
                            +{incomeIncrease}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Epargne mensuelle</p>
                      <span className={`text-lg font-bold ${projections.monthlySavings >= 0 ? "text-accent" : "text-destructive"}`}>
                        {formatCurrency(projections.monthlySavings)}
                      </span>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Taux d&apos;epargne</p>
                      <span className={`text-lg font-bold ${projections.newSavingsRate >= 20 ? "text-accent" : projections.newSavingsRate >= 10 ? "text-warning" : "text-destructive"}`}>
                        {projections.newSavingsRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Comparison Chart */}
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scenarioComparison}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "oklch(1 0 0)",
                            border: "1px solid oklch(0.9 0.01 250)",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenus" name="Revenus" fill="oklch(0.55 0.18 160)" />
                        <Bar dataKey="depenses" name="Depenses" fill="oklch(0.55 0.22 25)" />
                        <Bar dataKey="epargne" name="Epargne" fill="oklch(0.45 0.12 250)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Insights */}
                  {(expenseReduction > 0 || incomeIncrease > 0) && (
                    <div className="rounded-lg bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Impact de vos ajustements</p>
                          <p className="text-sm text-muted-foreground">
                            Avec ce scenario, vous epargneriez{" "}
                            <span className="font-semibold text-accent">
                              {formatCurrency(projections.monthlySavings - (financialData.avgMonthlyRetraits - financialData.avgMonthlyDepenses))}
                            </span>{" "}
                            de plus par mois, soit{" "}
                            <span className="font-semibold text-accent">
                              {formatCurrency((projections.monthlySavings - (financialData.avgMonthlyRetraits - financialData.avgMonthlyDepenses)) * 12)}
                            </span>{" "}
                            supplementaires par an.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="projection">
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Epargne dans {timelineMonths} mois</p>
                      <span className="text-lg font-bold text-accent">
                        {formatCurrency(projections.totalSavingsAtEnd)}
                      </span>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Gain vs situation actuelle</p>
                      <span className={`text-lg font-bold ${projections.improvementFromBaseline >= 0 ? "text-accent" : "text-destructive"}`}>
                        {projections.improvementFromBaseline >= 0 ? "+" : ""}{formatCurrency(projections.improvementFromBaseline)}
                      </span>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">Epargne totale projetee</p>
                      <span className="text-lg font-bold">
                        {formatCurrency(projections.monthlySavings * timelineMonths)}
                      </span>
                    </div>
                  </div>

                  {/* Projection Chart */}
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={projections.projectionData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "oklch(1 0 0)",
                            border: "1px solid oklch(0.9 0.01 250)",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Legend />
                        {savingsGoal && (
                          <ReferenceLine 
                            y={parseFloat(savingsGoal)} 
                            stroke="oklch(0.7 0.15 80)" 
                            strokeDasharray="5 5" 
                            label={{ value: "Objectif", position: "right" }}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey="savings"
                          name="Scenario simule"
                          stroke="oklch(0.55 0.18 160)"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="baseline"
                          name="Scenario actuel"
                          stroke="oklch(0.5 0.02 250)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Category-specific adjustments */}
      {financialData.depensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Percent className="h-4 w-4 text-primary" />
              Ajustements par Categorie
            </CardTitle>
            <CardDescription>
              Ajustez les depenses par categorie pour une simulation plus precise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {financialData.depensesByCategory.slice(0, 6).map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{category.name}</Label>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(category.value)} ({category.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[categoryAdjustments[category.id] || 0]}
                      onValueChange={([value]) => 
                        setCategoryAdjustments(prev => ({ ...prev, [category.id]: value }))
                      }
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs w-12 text-right">
                      -{categoryAdjustments[category.id] || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
