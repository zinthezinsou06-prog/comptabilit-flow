"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PiggyBank, PercentIcon, Receipt, Banknote } from "lucide-react"

interface FinancialIndicatorsProps {
  savingsRate: number
  expenseRatio: number
  avgTransactionDepense: number
  avgTransactionRetrait: number
}

export function FinancialIndicators({
  savingsRate,
  expenseRatio,
  avgTransactionDepense,
  avgTransactionRetrait,
}: FinancialIndicatorsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Determine savings health
  const getSavingsHealth = (rate: number) => {
    if (rate >= 20) return { label: "Excellent", color: "text-accent" }
    if (rate >= 10) return { label: "Bon", color: "text-primary" }
    if (rate >= 0) return { label: "Acceptable", color: "text-warning" }
    return { label: "Attention", color: "text-destructive" }
  }

  const savingsHealth = getSavingsHealth(savingsRate)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicateurs Financiers</CardTitle>
        <CardDescription>Analyse de votre santé financière</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Taux d&apos;épargne</span>
            </div>
            <div className={`text-2xl font-bold ${savingsHealth.color}`}>
              {savingsRate.toFixed(1)}%
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, savingsRate))} 
              className="h-2"
            />
            <p className={`text-xs ${savingsHealth.color}`}>{savingsHealth.label}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PercentIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Ratio dépenses/revenus</span>
            </div>
            <div className={`text-2xl font-bold ${expenseRatio > 100 ? "text-destructive" : expenseRatio > 80 ? "text-warning" : "text-accent"}`}>
              {expenseRatio.toFixed(1)}%
            </div>
            <Progress 
              value={Math.min(100, expenseRatio)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {expenseRatio > 100 ? "Dépenses supérieures aux revenus" : "Dépenses sous contrôle"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Dépense moyenne</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(avgTransactionDepense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Par transaction
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Retrait moyen</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(avgTransactionRetrait)}
            </div>
            <p className="text-xs text-muted-foreground">
              Par transaction
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
