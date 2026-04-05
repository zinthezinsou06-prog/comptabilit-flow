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
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Évolution mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {monthlyData.some((d) => d.depenses > 0 || d.retraits > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
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
                  <Bar dataKey="retraits" name="Retraits" fill="oklch(0.55 0.18 160)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="depenses" name="Dépenses" fill="oklch(0.55 0.22 25)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dépenses par catégorie</CardTitle>
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
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.9 0.01 250)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Aucune dépense enregistrée
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
