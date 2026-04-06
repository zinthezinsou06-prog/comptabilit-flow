"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  Database,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpDown,
  BarChart2,
  Activity,
  Layers,
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

interface DataAnalyzerProps {
  financialData: FinancialData
}

export function DataAnalyzer({ financialData }: DataAnalyzerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"3m" | "6m" | "12m">("12m")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [sortBy, setSortBy] = useState<"amount" | "date" | "count">("amount")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Filter data by period
  const filteredData = useMemo(() => {
    const monthsToFilter = selectedPeriod === "3m" ? 3 : selectedPeriod === "6m" ? 6 : 12
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToFilter)
    
    const filteredDepenses = financialData.depenses.filter(d => new Date(d.date) >= cutoffDate)
    const filteredRetraits = financialData.retraits.filter(r => new Date(r.date) >= cutoffDate)
    const filteredMonthly = financialData.monthlyData.slice(-monthsToFilter)
    
    return {
      depenses: filteredDepenses,
      retraits: filteredRetraits,
      monthlyData: filteredMonthly,
      totalDepenses: filteredDepenses.reduce((sum, d) => sum + Number(d.montant), 0),
      totalRetraits: filteredRetraits.reduce((sum, r) => sum + Number(r.montant), 0),
    }
  }, [financialData, selectedPeriod])

  // Statistical analysis
  const statistics = useMemo(() => {
    const depenseAmounts = filteredData.depenses.map(d => Number(d.montant))
    const retraitAmounts = filteredData.retraits.map(r => Number(r.montant))
    
    const calcStats = (amounts: number[]) => {
      if (amounts.length === 0) return { avg: 0, median: 0, stdDev: 0, min: 0, max: 0 }
      
      const sorted = [...amounts].sort((a, b) => a - b)
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
      const median = sorted[Math.floor(sorted.length / 2)]
      const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length
      const stdDev = Math.sqrt(variance)
      
      return {
        avg,
        median,
        stdDev,
        min: sorted[0] || 0,
        max: sorted[sorted.length - 1] || 0,
      }
    }
    
    return {
      depenses: calcStats(depenseAmounts),
      retraits: calcStats(retraitAmounts),
    }
  }, [filteredData])

  // Day of week analysis
  const dayOfWeekAnalysis = useMemo(() => {
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    const dayData = days.map((day, index) => {
      const dayDepenses = filteredData.depenses.filter(d => new Date(d.date).getDay() === index)
      const dayRetraits = filteredData.retraits.filter(r => new Date(r.date).getDay() === index)
      
      return {
        day,
        depenses: dayDepenses.reduce((sum, d) => sum + Number(d.montant), 0),
        retraits: dayRetraits.reduce((sum, r) => sum + Number(r.montant), 0),
        count: dayDepenses.length + dayRetraits.length,
      }
    })
    
    return dayData
  }, [filteredData])

  // Monthly comparison for radar chart
  const radarData = useMemo(() => {
    return financialData.depensesByCategory.slice(0, 6).map(cat => ({
      category: cat.name.length > 10 ? cat.name.substring(0, 10) + "..." : cat.name,
      value: cat.percentage,
      fullMark: 100,
    }))
  }, [financialData.depensesByCategory])

  // Scatter data for amount vs frequency
  const scatterData = useMemo(() => {
    return financialData.depensesByCategory.map(cat => ({
      x: cat.count,
      y: cat.value / cat.count || 0,
      z: cat.value,
      name: cat.name,
    }))
  }, [financialData.depensesByCategory])

  // Sorted transactions
  const sortedTransactions = useMemo(() => {
    const transactions = [
      ...filteredData.depenses.map(d => ({
        ...d,
        type: "depense" as const,
        montant: Number(d.montant),
        categoryName: financialData.categories.find(c => c.id === d.categorie_id)?.nom || "Sans categorie",
      })),
      ...filteredData.retraits.map(r => ({
        ...r,
        type: "retrait" as const,
        montant: Number(r.montant),
        categoryName: "-",
        categorie_id: "",
      })),
    ]
    
    const sorted = [...transactions].sort((a, b) => {
      if (sortBy === "amount") return b.montant - a.montant
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime()
      return 0
    })
    
    return sortOrder === "asc" ? sorted.reverse() : sorted
  }, [filteredData, financialData.categories, sortBy, sortOrder])

  // Export function
  const exportData = () => {
    const csvContent = [
      ["Date", "Type", "Montant", "Description", "Categorie"].join(","),
      ...sortedTransactions.map(t => 
        [t.date, t.type, t.montant, `"${t.description}"`, t.categoryName].join(",")
      )
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as "3m" | "6m" | "12m")}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 derniers mois</SelectItem>
              <SelectItem value="6m">6 derniers mois</SelectItem>
              <SelectItem value="12m">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={exportData}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Depenses</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(filteredData.totalDepenses)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive/20" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {filteredData.depenses.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Retraits</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(filteredData.totalRetraits)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent/20" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {filteredData.retraits.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Depense Moyenne</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(statistics.depenses.avg)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary/20" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Mediane: {formatCurrency(statistics.depenses.median)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ecart-type</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(statistics.depenses.stdDev)}
                </p>
              </div>
              <Layers className="h-8 w-8 text-primary/20" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Volatilite des depenses
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="charts" className="gap-2">
            <BarChart2 className="h-4 w-4" />
            Graphiques
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <Database className="h-4 w-4" />
            Donnees
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <Activity className="h-4 w-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Day of Week Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activite par Jour de la Semaine</CardTitle>
                <CardDescription>Repartition des transactions sur la semaine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayOfWeekAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" />
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
                      <Bar dataKey="depenses" name="Depenses" fill="oklch(0.55 0.22 25)" />
                      <Bar dataKey="retraits" name="Retraits" fill="oklch(0.55 0.18 160)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profil des Depenses</CardTitle>
                <CardDescription>Repartition par categorie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" className="text-xs" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Pourcentage"
                          dataKey="value"
                          stroke="oklch(0.45 0.12 250)"
                          fill="oklch(0.45 0.12 250)"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Pas assez de donnees
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Scatter Plot */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Frequence vs Montant Moyen</CardTitle>
                <CardDescription>Analyse des categories par nombre de transactions et montant moyen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {scatterData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name="Transactions" 
                          label={{ value: "Nombre de transactions", position: "bottom" }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name="Montant moyen"
                          tickFormatter={(v) => formatCurrency(v)}
                          label={{ value: "Montant moyen", angle: -90, position: "insideLeft" }}
                        />
                        <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                        <Tooltip
                          formatter={(value: number, name) => {
                            if (name === "Montant moyen") return formatCurrency(value)
                            return value
                          }}
                          contentStyle={{
                            backgroundColor: "oklch(1 0 0)",
                            border: "1px solid oklch(0.9 0.01 250)",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Scatter 
                          name="Categories" 
                          data={scatterData} 
                          fill="oklch(0.45 0.12 250)"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Pas assez de donnees
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Historique des Transactions</CardTitle>
                  <CardDescription>
                    {sortedTransactions.length} transactions sur la periode
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as "amount" | "date" | "count")}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">Montant</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Categorie</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTransactions.slice(0, 50).map((transaction) => (
                      <TableRow key={`${transaction.type}-${transaction.id}`}>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "retrait" ? "default" : "destructive"}>
                            {transaction.type === "retrait" ? "Retrait" : "Depense"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.description || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {transaction.categoryName}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          transaction.type === "retrait" ? "text-accent" : "text-destructive"
                        }`}>
                          {transaction.type === "retrait" ? "+" : "-"}{formatCurrency(transaction.montant)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {sortedTransactions.length > 50 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Affichage des 50 premieres transactions. Exportez pour voir tout.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Statistics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistiques des Depenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Moyenne</span>
                    <span className="font-semibold">{formatCurrency(statistics.depenses.avg)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mediane</span>
                    <span className="font-semibold">{formatCurrency(statistics.depenses.median)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ecart-type</span>
                    <span className="font-semibold">{formatCurrency(statistics.depenses.stdDev)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Minimum</span>
                    <span className="font-semibold">{formatCurrency(statistics.depenses.min)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Maximum</span>
                    <span className="font-semibold">{formatCurrency(statistics.depenses.max)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistiques des Retraits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Moyenne</span>
                    <span className="font-semibold">{formatCurrency(statistics.retraits.avg)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mediane</span>
                    <span className="font-semibold">{formatCurrency(statistics.retraits.median)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ecart-type</span>
                    <span className="font-semibold">{formatCurrency(statistics.retraits.stdDev)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Minimum</span>
                    <span className="font-semibold">{formatCurrency(statistics.retraits.min)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Maximum</span>
                    <span className="font-semibold">{formatCurrency(statistics.retraits.max)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Insights Detectes</CardTitle>
                <CardDescription>Patterns identifies dans vos donnees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* High spending day */}
                  {(() => {
                    const maxDay = dayOfWeekAnalysis.reduce((max, d) => 
                      d.depenses > max.depenses ? d : max
                    , dayOfWeekAnalysis[0])
                    return (
                      <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                        <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Jour de depenses elevees</p>
                          <p className="text-sm text-muted-foreground">
                            Vous depensez le plus le <span className="font-semibold">{maxDay.day}</span> 
                            ({formatCurrency(maxDay.depenses)} en moyenne)
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Category concentration */}
                  {financialData.depensesByCategory[0] && (
                    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                      <Layers className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Concentration des depenses</p>
                        <p className="text-sm text-muted-foreground">
                          La categorie <span className="font-semibold">{financialData.depensesByCategory[0].name}</span> represente 
                          {" "}{financialData.depensesByCategory[0].percentage.toFixed(1)}% de vos depenses totales
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Volatility insight */}
                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                    <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Volatilite</p>
                      <p className="text-sm text-muted-foreground">
                        {statistics.depenses.stdDev > statistics.depenses.avg * 0.5 
                          ? "Vos depenses sont tres variables. Etablir un budget fixe pourrait vous aider."
                          : "Vos depenses sont relativement stables et previsibles."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
