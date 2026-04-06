import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Wallet, Activity } from "lucide-react"

interface DashboardStatsProps {
  totalDepenses: number
  totalRetraits: number
  solde: number
  transactionCount: number
}

export function DashboardStats({
  totalDepenses,
  totalRetraits,
  solde,
  transactionCount,
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      // Shorter format on mobile
      notation: Math.abs(amount) >= 10000 ? "compact" : "standard",
      maximumFractionDigits: Math.abs(amount) >= 10000 ? 1 : 2,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
            Dépenses
          </CardTitle>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-lg font-bold text-destructive leading-tight">
            {formatCurrency(totalDepenses)}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Total cumulé</p>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
            Retraits
          </CardTitle>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-lg font-bold text-accent leading-tight">
            {formatCurrency(totalRetraits)}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Total cumulé</p>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
            Solde
          </CardTitle>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="h-3.5 w-3.5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className={`text-lg font-bold leading-tight ${solde >= 0 ? "text-accent" : "text-destructive"}`}>
            {formatCurrency(solde)}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Net actuel</p>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
            Transactions
          </CardTitle>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-lg font-bold text-foreground leading-tight">
            {transactionCount}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Enregistrées</p>
        </CardContent>
      </Card>
    </div>
  )
}
