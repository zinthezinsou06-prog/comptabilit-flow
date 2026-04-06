"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  PieChart,
  Percent,
  Target,
  Scale,
  DollarSign,
  Wallet,
  CreditCard,
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

interface AccountingToolsProps {
  financialData: FinancialData
}

export function AccountingTools({ financialData }: AccountingToolsProps) {
  const [compoundAmount, setCompoundAmount] = useState("")
  const [compoundRate, setCompoundRate] = useState("5")
  const [compoundYears, setCompoundYears] = useState("10")
  const [compoundMonthly, setCompoundMonthly] = useState("0")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Calculate financial ratios
  const calculateRatios = () => {
    const { totalDepenses, totalRetraits, avgMonthlyDepenses, avgMonthlyRetraits, monthlyData } = financialData
    
    // Liquidity ratio (current assets / current liabilities)
    const liquidityRatio = totalRetraits > 0 ? totalRetraits / totalDepenses : 0
    
    // Savings ratio
    const savingsRatio = totalRetraits > 0 ? (totalRetraits - totalDepenses) / totalRetraits : 0
    
    // Expense volatility (standard deviation of monthly expenses)
    const avgExpense = avgMonthlyDepenses
    const variance = monthlyData.reduce((sum, m) => {
      return sum + Math.pow(m.depenses - avgExpense, 2)
    }, 0) / (monthlyData.length || 1)
    const volatility = Math.sqrt(variance)
    const volatilityRatio = avgExpense > 0 ? volatility / avgExpense : 0
    
    // Income stability
    const avgIncome = avgMonthlyRetraits
    const incomeVariance = monthlyData.reduce((sum, m) => {
      return sum + Math.pow(m.retraits - avgIncome, 2)
    }, 0) / (monthlyData.length || 1)
    const incomeVolatility = Math.sqrt(incomeVariance)
    const incomeStability = avgIncome > 0 ? 1 - (incomeVolatility / avgIncome) : 0
    
    // Emergency fund months (solde / avgMonthlyDepenses)
    const emergencyFundMonths = avgMonthlyDepenses > 0 ? financialData.solde / avgMonthlyDepenses : 0
    
    return {
      liquidityRatio,
      savingsRatio,
      volatilityRatio,
      incomeStability: Math.max(0, Math.min(1, incomeStability)),
      emergencyFundMonths: Math.max(0, emergencyFundMonths),
    }
  }

  const ratios = calculateRatios()

  // Compound interest calculator
  const calculateCompoundInterest = () => {
    const principal = parseFloat(compoundAmount) || 0
    const rate = parseFloat(compoundRate) / 100 || 0
    const years = parseInt(compoundYears) || 0
    const monthlyContrib = parseFloat(compoundMonthly) || 0
    
    let total = principal
    const yearlyData = []
    
    for (let year = 1; year <= years; year++) {
      // Add monthly contributions
      for (let month = 0; month < 12; month++) {
        total += monthlyContrib
        total *= (1 + rate / 12)
      }
      yearlyData.push({
        year,
        total: Math.round(total),
        contributions: principal + (monthlyContrib * 12 * year),
        interest: Math.round(total) - (principal + (monthlyContrib * 12 * year)),
      })
    }
    
    return {
      finalAmount: Math.round(total),
      totalContributions: principal + (monthlyContrib * 12 * years),
      totalInterest: Math.round(total) - (principal + (monthlyContrib * 12 * years)),
      yearlyData,
    }
  }

  const compoundResult = calculateCompoundInterest()

  // Generate balance sheet
  const generateBalanceSheet = () => {
    const { monthlyData, depensesByCategory } = financialData
    const currentMonth = monthlyData[monthlyData.length - 1] || { depenses: 0, retraits: 0, solde: 0 }
    const previousMonth = monthlyData[monthlyData.length - 2] || { depenses: 0, retraits: 0, solde: 0 }
    
    return {
      assets: {
        solde: financialData.solde,
        monthlyIncome: currentMonth.retraits,
      },
      liabilities: {
        monthlyExpenses: currentMonth.depenses,
        avgExpenses: financialData.avgMonthlyDepenses,
      },
      changes: {
        incomeChange: previousMonth.retraits > 0 
          ? ((currentMonth.retraits - previousMonth.retraits) / previousMonth.retraits) * 100 
          : 0,
        expenseChange: previousMonth.depenses > 0 
          ? ((currentMonth.depenses - previousMonth.depenses) / previousMonth.depenses) * 100 
          : 0,
      },
      topExpenses: depensesByCategory.slice(0, 5),
    }
  }

  const balanceSheet = generateBalanceSheet()

  // Get ratio status
  const getRatioStatus = (value: number, thresholds: { good: number; warning: number; reverse?: boolean }) => {
    if (thresholds.reverse) {
      if (value <= thresholds.good) return { label: "Bon", color: "text-accent", bg: "bg-accent/10" }
      if (value <= thresholds.warning) return { label: "Attention", color: "text-warning", bg: "bg-warning/10" }
      return { label: "Critique", color: "text-destructive", bg: "bg-destructive/10" }
    }
    if (value >= thresholds.good) return { label: "Bon", color: "text-accent", bg: "bg-accent/10" }
    if (value >= thresholds.warning) return { label: "Attention", color: "text-warning", bg: "bg-warning/10" }
    return { label: "Critique", color: "text-destructive", bg: "bg-destructive/10" }
  }

  return (
    <Tabs defaultValue="ratios" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
        <TabsTrigger value="ratios" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Ratios Financiers</span>
          <span className="sm:hidden">Ratios</span>
        </TabsTrigger>
        <TabsTrigger value="balance" className="gap-2">
          <Scale className="h-4 w-4" />
          <span className="hidden sm:inline">Bilan</span>
          <span className="sm:hidden">Bilan</span>
        </TabsTrigger>
        <TabsTrigger value="calculator" className="gap-2">
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">Calculateurs</span>
          <span className="sm:hidden">Calc</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ratios" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Liquidity Ratio */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4 text-primary" />
                Ratio de Liquidite
              </CardTitle>
              <CardDescription>Retraits / Depenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getRatioStatus(ratios.liquidityRatio, { good: 1.2, warning: 1 }).color}`}>
                    {ratios.liquidityRatio.toFixed(2)}x
                  </span>
                  <Badge className={getRatioStatus(ratios.liquidityRatio, { good: 1.2, warning: 1 }).bg}>
                    {getRatioStatus(ratios.liquidityRatio, { good: 1.2, warning: 1 }).label}
                  </Badge>
                </div>
                <Progress value={Math.min(100, ratios.liquidityRatio * 50)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Objectif: &gt; 1.2x (vos revenus couvrent bien vos depenses)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Savings Ratio */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-4 w-4 text-primary" />
                Taux d&apos;Epargne
              </CardTitle>
              <CardDescription>Epargne / Revenus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getRatioStatus(ratios.savingsRatio * 100, { good: 20, warning: 10 }).color}`}>
                    {(ratios.savingsRatio * 100).toFixed(1)}%
                  </span>
                  <Badge className={getRatioStatus(ratios.savingsRatio * 100, { good: 20, warning: 10 }).bg}>
                    {getRatioStatus(ratios.savingsRatio * 100, { good: 20, warning: 10 }).label}
                  </Badge>
                </div>
                <Progress value={Math.max(0, ratios.savingsRatio * 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Objectif: &gt; 20% (regle des finances personnelles)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Expense Volatility */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="h-4 w-4 text-primary" />
                Volatilite Depenses
              </CardTitle>
              <CardDescription>Ecart-type / Moyenne</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getRatioStatus(ratios.volatilityRatio * 100, { good: 20, warning: 40, reverse: true }).color}`}>
                    {(ratios.volatilityRatio * 100).toFixed(1)}%
                  </span>
                  <Badge className={getRatioStatus(ratios.volatilityRatio * 100, { good: 20, warning: 40, reverse: true }).bg}>
                    {getRatioStatus(ratios.volatilityRatio * 100, { good: 20, warning: 40, reverse: true }).label}
                  </Badge>
                </div>
                <Progress value={Math.min(100, 100 - ratios.volatilityRatio * 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Objectif: &lt; 20% (depenses stables et previsibles)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Income Stability */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Stabilite des Revenus
              </CardTitle>
              <CardDescription>Regularite des entrees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getRatioStatus(ratios.incomeStability * 100, { good: 80, warning: 60 }).color}`}>
                    {(ratios.incomeStability * 100).toFixed(1)}%
                  </span>
                  <Badge className={getRatioStatus(ratios.incomeStability * 100, { good: 80, warning: 60 }).bg}>
                    {getRatioStatus(ratios.incomeStability * 100, { good: 80, warning: 60 }).label}
                  </Badge>
                </div>
                <Progress value={ratios.incomeStability * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Objectif: &gt; 80% (revenus reguliers)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Fund */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-primary" />
                Fonds d&apos;Urgence
              </CardTitle>
              <CardDescription>Mois de depenses couverts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getRatioStatus(ratios.emergencyFundMonths, { good: 6, warning: 3 }).color}`}>
                    {ratios.emergencyFundMonths.toFixed(1)} mois
                  </span>
                  <Badge className={getRatioStatus(ratios.emergencyFundMonths, { good: 6, warning: 3 }).bg}>
                    {getRatioStatus(ratios.emergencyFundMonths, { good: 6, warning: 3 }).label}
                  </Badge>
                </div>
                <Progress value={Math.min(100, (ratios.emergencyFundMonths / 6) * 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Objectif: 6 mois de depenses en reserve
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Expense Ratio */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Percent className="h-4 w-4 text-primary" />
                Ratio de Depenses
              </CardTitle>
              <CardDescription>Depenses / Revenus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getRatioStatus(financialData.expenseRatio, { good: 70, warning: 90, reverse: true }).color}`}>
                    {financialData.expenseRatio.toFixed(1)}%
                  </span>
                  <Badge className={getRatioStatus(financialData.expenseRatio, { good: 70, warning: 90, reverse: true }).bg}>
                    {getRatioStatus(financialData.expenseRatio, { good: 70, warning: 90, reverse: true }).label}
                  </Badge>
                </div>
                <Progress value={Math.min(100, 100 - financialData.expenseRatio + 30)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Objectif: &lt; 70% (garder 30% pour l&apos;epargne)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="balance" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Income Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Compte de Resultat
              </CardTitle>
              <CardDescription>Revenus et depenses du mois en cours</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Poste</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Variation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Revenus (Retraits)</TableCell>
                    <TableCell className="text-right text-accent font-semibold">
                      {formatCurrency(balanceSheet.assets.monthlyIncome)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={balanceSheet.changes.incomeChange >= 0 ? "text-accent" : "text-destructive"}>
                        {balanceSheet.changes.incomeChange >= 0 ? "+" : ""}
                        {balanceSheet.changes.incomeChange.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Depenses</TableCell>
                    <TableCell className="text-right text-destructive font-semibold">
                      -{formatCurrency(balanceSheet.liabilities.monthlyExpenses)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={balanceSheet.changes.expenseChange <= 0 ? "text-accent" : "text-destructive"}>
                        {balanceSheet.changes.expenseChange >= 0 ? "+" : ""}
                        {balanceSheet.changes.expenseChange.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Resultat Net</TableCell>
                    <TableCell className={`text-right font-bold ${
                      balanceSheet.assets.monthlyIncome - balanceSheet.liabilities.monthlyExpenses >= 0 
                        ? "text-accent" 
                        : "text-destructive"
                    }`}>
                      {formatCurrency(balanceSheet.assets.monthlyIncome - balanceSheet.liabilities.monthlyExpenses)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Balance Sheet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Bilan Simplifie
              </CardTitle>
              <CardDescription>Situation patrimoniale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-accent mb-3">ACTIFS</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Solde disponible</span>
                      <span className="font-medium">{formatCurrency(balanceSheet.assets.solde)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenu mensuel moyen</span>
                      <span className="font-medium">{formatCurrency(financialData.avgMonthlyRetraits)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm font-semibold">Total Actifs</span>
                      <span className="font-bold text-accent">{formatCurrency(balanceSheet.assets.solde)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-destructive mb-3">PASSIFS</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Depenses moyennes mensuelles</span>
                      <span className="font-medium">{formatCurrency(balanceSheet.liabilities.avgExpenses)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm font-semibold">Total Engagements</span>
                      <span className="font-bold text-destructive">{formatCurrency(balanceSheet.liabilities.avgExpenses)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Patrimoine Net</span>
                    <span className={`font-bold text-lg ${balanceSheet.assets.solde >= 0 ? "text-accent" : "text-destructive"}`}>
                      {formatCurrency(balanceSheet.assets.solde)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Expenses */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Repartition des Depenses
              </CardTitle>
              <CardDescription>Top 5 des categories de depenses</CardDescription>
            </CardHeader>
            <CardContent>
              {balanceSheet.topExpenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categorie</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Part</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceSheet.topExpenses.map((expense, index) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {index + 1}
                            </span>
                            {expense.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(expense.value)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={expense.percentage} className="w-16 h-2" />
                            <span className="text-sm">{expense.percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {expense.count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucune depense enregistree
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="calculator" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Calculateur d&apos;Interets Composes
            </CardTitle>
            <CardDescription>
              Simulez la croissance de votre epargne avec les interets composes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">Capital initial</Label>
                  <Input
                    id="principal"
                    type="number"
                    placeholder="1000"
                    value={compoundAmount}
                    onChange={(e) => setCompoundAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly">Versement mensuel</Label>
                  <Input
                    id="monthly"
                    type="number"
                    placeholder="100"
                    value={compoundMonthly}
                    onChange={(e) => setCompoundMonthly(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Taux d&apos;interet annuel (%)</Label>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="5"
                    value={compoundRate}
                    onChange={(e) => setCompoundRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years">Duree (annees)</Label>
                  <Input
                    id="years"
                    type="number"
                    placeholder="10"
                    value={compoundYears}
                    onChange={(e) => setCompoundYears(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Montant final</span>
                    <span className="text-2xl font-bold text-accent">
                      {formatCurrency(compoundResult.finalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total des versements</span>
                    <span className="font-semibold">
                      {formatCurrency(compoundResult.totalContributions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Interets gagnes</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(compoundResult.totalInterest)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="h-3 flex-1 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ 
                            width: `${compoundResult.finalAmount > 0 
                              ? (compoundResult.totalContributions / compoundResult.finalAmount) * 100 
                              : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {compoundResult.finalAmount > 0 
                          ? ((compoundResult.totalInterest / compoundResult.finalAmount) * 100).toFixed(0) 
                          : 0}% d&apos;interets
                      </span>
                    </div>
                  </div>
                </div>

                {compoundResult.yearlyData.length > 0 && (
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="font-semibold mb-3">Evolution par annee</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {compoundResult.yearlyData.map((year) => (
                        <div key={year.year} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Annee {year.year}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(year.total)}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-primary text-xs">
                              +{formatCurrency(year.interest)} interets
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
