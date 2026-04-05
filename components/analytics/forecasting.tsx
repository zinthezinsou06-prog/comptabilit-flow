"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react"

interface MonthlyData {
  month: string
  name: string
  depenses: number
  retraits: number
  solde: number
}

interface ForecastingProps {
  avgMonthlyDepenses: number
  avgMonthlyRetraits: number
  depensesTrend: number
  retraitsTrend: number
  monthlyData: MonthlyData[]
}

export function Forecasting({
  avgMonthlyDepenses,
  avgMonthlyRetraits,
  depensesTrend,
  retraitsTrend,
  monthlyData,
}: ForecastingProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Generate forecast for next 3 months
  const generateForecast = () => {
    const forecast = []
    const lastMonth = monthlyData[monthlyData.length - 1]
    
    if (!lastMonth) return []

    for (let i = 1; i <= 3; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      const monthName = date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
      
      // Apply trend adjustment (monthly trend = trend / 3)
      const monthlyDepensesTrend = depensesTrend / 100 / 3
      const monthlyRetraitsTrend = retraitsTrend / 100 / 3
      
      const projectedDepenses = avgMonthlyDepenses * (1 + monthlyDepensesTrend * i)
      const projectedRetraits = avgMonthlyRetraits * (1 + monthlyRetraitsTrend * i)
      
      forecast.push({
        name: monthName,
        depenses: Math.round(projectedDepenses),
        retraits: Math.round(projectedRetraits),
        solde: Math.round(projectedRetraits - projectedDepenses),
        isForecast: true,
      })
    }
    
    return forecast
  }

  const forecast = generateForecast()
  
  // Combine historical data with forecast
  const chartData = [
    ...monthlyData.slice(-6).map((m) => ({ ...m, isForecast: false })),
    ...forecast,
  ]

  // Calculate predictions
  const next3MonthsDepenses = forecast.reduce((sum, f) => sum + f.depenses, 0)
  const next3MonthsRetraits = forecast.reduce((sum, f) => sum + f.retraits, 0)
  const projectedSolde = next3MonthsRetraits - next3MonthsDepenses

  // Alerts and recommendations
  const alerts = []
  
  if (depensesTrend > 10) {
    alerts.push({
      type: "warning",
      message: "Vos dépenses augmentent rapidement. Considérez réduire certaines catégories.",
      icon: AlertTriangle,
    })
  }
  
  if (projectedSolde < 0) {
    alerts.push({
      type: "danger",
      message: "Prévision de solde négatif dans les 3 prochains mois. Action recommandée.",
      icon: TrendingDown,
    })
  }
  
  if (retraitsTrend > 5 && depensesTrend < retraitsTrend) {
    alerts.push({
      type: "success",
      message: "Bonne gestion! Vos revenus augmentent plus vite que vos dépenses.",
      icon: CheckCircle2,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Prévisions Financières
          <Badge variant="secondary">3 prochains mois</Badge>
        </CardTitle>
        <CardDescription>
          Projections basées sur vos tendances actuelles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Dépenses prévues</p>
            <p className="mt-1 text-2xl font-bold text-destructive">
              {formatCurrency(next3MonthsDepenses)}
            </p>
            <div className={`mt-1 flex items-center text-xs ${depensesTrend > 0 ? "text-destructive" : "text-accent"}`}>
              {depensesTrend > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              Tendance: {depensesTrend > 0 ? "+" : ""}{depensesTrend.toFixed(1)}%
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Retraits prévus</p>
            <p className="mt-1 text-2xl font-bold text-accent">
              {formatCurrency(next3MonthsRetraits)}
            </p>
            <div className={`mt-1 flex items-center text-xs ${retraitsTrend > 0 ? "text-accent" : "text-destructive"}`}>
              {retraitsTrend > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              Tendance: {retraitsTrend > 0 ? "+" : ""}{retraitsTrend.toFixed(1)}%
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Solde projeté</p>
            <p className={`mt-1 text-2xl font-bold ${projectedSolde >= 0 ? "text-accent" : "text-destructive"}`}>
              {formatCurrency(projectedSolde)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sur les 3 prochains mois
            </p>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-lg p-3 ${
                  alert.type === "danger" 
                    ? "bg-destructive/10 text-destructive" 
                    : alert.type === "warning"
                    ? "bg-warning/10 text-warning-foreground"
                    : "bg-accent/10 text-accent"
                }`}
              >
                <alert.icon className="h-5 w-5 shrink-0" />
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.01 250)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <ReferenceLine x={monthlyData.slice(-6)[monthlyData.slice(-6).length - 1]?.name} stroke="oklch(0.5 0 0)" strokeDasharray="3 3" label="Aujourd'hui" />
                <Line
                  type="monotone"
                  dataKey="retraits"
                  name="Retraits"
                  stroke="oklch(0.55 0.18 160)"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    if (payload.isForecast) {
                      return <circle cx={cx} cy={cy} r={4} fill="oklch(0.55 0.18 160)" strokeDasharray="3 3" />
                    }
                    return <circle cx={cx} cy={cy} r={4} fill="oklch(0.55 0.18 160)" />
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="depenses"
                  name="Dépenses"
                  stroke="oklch(0.55 0.22 25)"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    if (payload.isForecast) {
                      return <circle cx={cx} cy={cy} r={4} fill="oklch(0.55 0.22 25)" strokeDasharray="3 3" />
                    }
                    return <circle cx={cx} cy={cy} r={4} fill="oklch(0.55 0.22 25)" />
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Pas assez de données pour générer des prévisions
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Les prévisions sont basées sur la tendance des 3 derniers mois comparée aux 3 mois précédents. 
          Elles sont indicatives et peuvent varier selon votre comportement financier futur.
        </p>
      </CardContent>
    </Card>
  )
}
