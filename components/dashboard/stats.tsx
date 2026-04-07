import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Wallet, Activity } from "lucide-react"
import { useSettings } from "@/components/providers/settings-provider"

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
  const { settings, t } = useSettings()

  const formatCurrency = (amount: number) => {
    const isStandard = settings.currency === "€" || settings.currency === "$" || settings.currency?.length === 3
    
    if (isStandard) {
      const currencyCode = settings.currency === "€" ? "EUR" : settings.currency === "$" ? "USD" : settings.currency
      try {
        return new Intl.NumberFormat(settings.language === "en" ? "en-US" : "fr-FR", {
          style: "currency",
          currency: currencyCode,
        }).format(amount)
      } catch {
        // Fallback below
      }
    }
    
    // Custom fallback for symbols like FCFA
    const formattedAmount = new Intl.NumberFormat(settings.language === "en" ? "en-US" : "fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    
    return settings.language === "en" 
      ? `${settings.currency} ${formattedAmount}` 
      : `${formattedAmount} ${settings.currency}`
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("dashboard.total_expenses") || "Total Dépenses"}
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(totalDepenses)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("dashboard.total_withdrawals") || "Total Retraits"}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(totalRetraits)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("common.solde") || "Solde"}
          </CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${solde >= 0 ? "text-accent" : "text-destructive"}`}>
            {formatCurrency(solde)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("common.transactions") || "Transactions"}
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {transactionCount}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
