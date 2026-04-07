"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import { useSettings } from "@/components/providers/settings-provider"

interface DashboardChartsProps {
  depensesByCategory: { name: string; value: number }[]
  monthlyData: { name: string; depenses: number; retraits: number }[]
}

const COLORS = [
  "oklch(0.45 0.12 250)",
  "oklch(0.55 0.18 160)",
  "oklch(0.55 0.22 25)",
  "oklch(0.65 0.15 80)",
  "oklch(0.5 0.15 300)",
]

export function DashboardCharts({ depensesByCategory, monthlyData }: DashboardChartsProps) {
  const { settings, t } = useSettings()

  const formatCurrency = (amount: number) => {
    const isStandard = settings.currency === "€" || settings.currency === "$" || settings.currency?.length === 3
    
    if (isStandard) {
      const currencyCode = settings.currency === "€" ? "EUR" : settings.currency === "$" ? "USD" : settings.currency
      try {
        return new Intl.NumberFormat(settings.language === "en" ? "en-US" : "fr-FR", {
          style: "currency",
          currency: currencyCode,
          maximumFractionDigits: 0,
        }).format(amount)
      } catch {
        // Fallback below
      }
    }
    
    // Custom fallback for symbols like FCFA
    const formattedAmount = new Intl.NumberFormat(settings.language === "en" ? "en-US" : "fr-FR", {
      maximumFractionDigits: 0,
    }).format(amount)
    
    return settings.language === "en" 
      ? `${settings.currency} ${formattedAmount}` 
      : `${formattedAmount} ${settings.currency}`
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.monthly_evolution") || "Évolution mensuelle"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {monthlyData.some((d) => d.depenses > 0 || d.retraits > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--foreground)",
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />
                  <Bar dataKey="retraits" name={t("sidebar.withdrawals") || "Retraits"} fill="oklch(0.55 0.18 160)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="depenses" name={t("sidebar.expenses") || "Dépenses"} fill="oklch(0.55 0.22 25)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {t("common.no_data") || "Aucune donnée disponible"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.expenses_by_category") || "Dépenses par catégorie"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {depensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={depensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {depensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--foreground)",
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {t("dashboard.no_expenses") || "Aucune dépense enregistrée"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
