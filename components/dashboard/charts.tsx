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
  const formatCurrency = (value: number) => {
    // Compact format for mobile axes
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k€`
    return `${value}€`
  }

  const hasData = monthlyData.some((d) => d.depenses > 0 || d.retraits > 0)
  const hasCategoryData = depensesByCategory.length > 0

  return (
    // Stack vertically on mobile, side by side on desktop
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
      {/* Monthly bar chart */}
      <Card>
        <CardHeader className="px-4 py-4">
          <CardTitle className="text-sm font-medium sm:text-base">
            Évolution mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4 sm:px-4">
          <div className="h-[200px] sm:h-[280px]">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 0, right: 4, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(value)
                    }
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.9 0.01 250)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="retraits"
                    name="Retraits"
                    fill="oklch(0.55 0.18 160)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="depenses"
                    name="Dépenses"
                    fill="oklch(0.55 0.22 25)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category pie chart */}
      <Card>
        <CardHeader className="px-4 py-4">
          <CardTitle className="text-sm font-medium sm:text-base">
            Dépenses par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4 sm:px-4">
          <div className="h-[200px] sm:h-[280px]">
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={depensesByCategory}
                    cx="50%"
                    cy="45%"
                    innerRadius="35%"
                    outerRadius="60%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {depensesByCategory.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(value)
                    }
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.9 0.01 250)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) =>
                      value.length > 12 ? value.slice(0, 12) + "…" : value
                    }
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Aucune dépense enregistrée
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
