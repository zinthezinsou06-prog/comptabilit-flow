"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface CategoryData {
  id: string
  name: string
  value: number
  count: number
  percentage: number
}

interface CategoryAnalysisProps {
  categories: CategoryData[]
}

const COLORS = [
  "oklch(0.45 0.12 250)",
  "oklch(0.55 0.18 160)",
  "oklch(0.55 0.22 25)",
  "oklch(0.65 0.15 80)",
  "oklch(0.5 0.15 300)",
  "oklch(0.6 0.12 200)",
  "oklch(0.5 0.2 50)",
]

export function CategoryAnalysis({ categories }: CategoryAnalysisProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par catégorie</CardTitle>
        <CardDescription>Analyse des dépenses par catégorie</CardDescription>
      </CardHeader>
      <CardContent>
        {categories.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categories.map((_, index) => (
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {categories.slice(0, 5).map((cat, index) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatCurrency(cat.value)} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress 
                    value={cat.percentage} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {cat.count} transaction{cat.count > 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Aucune dépense enregistrée
          </div>
        )}
      </CardContent>
    </Card>
  )
}
