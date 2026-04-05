"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface MonthlyData {
  month: string
  name: string
  depenses: number
  retraits: number
  solde: number
}

interface TrendAnalysisProps {
  monthlyData: MonthlyData[]
}

export function TrendAnalysis({ monthlyData }: TrendAnalysisProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution sur 12 mois</CardTitle>
        <CardDescription>Tendance des dépenses et retraits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          {monthlyData.some((d) => d.depenses > 0 || d.retraits > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRetraits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.18 160)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.18 160)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.22 25)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.22 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="retraits"
                  name="Retraits"
                  stroke="oklch(0.55 0.18 160)"
                  fillOpacity={1}
                  fill="url(#colorRetraits)"
                />
                <Area
                  type="monotone"
                  dataKey="depenses"
                  name="Dépenses"
                  stroke="oklch(0.55 0.22 25)"
                  fillOpacity={1}
                  fill="url(#colorDepenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
