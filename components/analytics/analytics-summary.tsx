import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Wallet, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface AnalyticsSummaryProps {
  totalDepenses: number
  totalRetraits: number
  solde: number
  depensesTrend: number
  retraitsTrend: number
  transactionCount: number
}

export function AnalyticsSummary({
  totalDepenses,
  totalRetraits,
  solde,
  depensesTrend,
  retraitsTrend,
  transactionCount,
}: AnalyticsSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Dépenses
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(totalDepenses)}
          </div>
          <div className={`mt-1 flex items-center text-xs ${depensesTrend > 0 ? "text-destructive" : "text-accent"}`}>
            {depensesTrend > 0 ? (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3" />
            )}
            {formatPercent(depensesTrend)} vs 3 mois précédents
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Retraits
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(totalRetraits)}
          </div>
          <div className={`mt-1 flex items-center text-xs ${retraitsTrend > 0 ? "text-accent" : "text-destructive"}`}>
            {retraitsTrend > 0 ? (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3" />
            )}
            {formatPercent(retraitsTrend)} vs 3 mois précédents
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Solde Total
          </CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${solde >= 0 ? "text-accent" : "text-destructive"}`}>
            {formatCurrency(solde)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Retraits - Dépenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Transactions
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {transactionCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total enregistrées
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
