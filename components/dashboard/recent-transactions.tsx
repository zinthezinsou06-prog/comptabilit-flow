import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import Link from "next/link"

interface Transaction {
  montant: number
  date: string
  type: "depense" | "retrait"
  categories?: { nom: string } | null
  designation?: string | null
  motif?: string | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
    if (date.toDateString() === yesterday.toDateString()) return "Hier"

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-4 py-4">
        <CardTitle className="text-base">Transactions récentes</CardTitle>
        <Link
          href="/dashboard/rapports"
          className="text-xs font-medium text-primary hover:underline"
        >
          Voir tout
        </Link>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {transactions.length > 0 ? (
          <div className="divide-y divide-border">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    transaction.type === "depense"
                      ? "bg-destructive/10"
                      : "bg-accent/10"
                  }`}
                >
                  {transaction.type === "depense" ? (
                    <ArrowUpCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-accent" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {transaction.type === "depense"
                      ? transaction.categories?.nom || transaction.designation || "Dépense"
                      : transaction.designation || "Retrait"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-sm font-semibold ${
                    transaction.type === "depense" ? "text-destructive" : "text-accent"
                  }`}
                >
                  {transaction.type === "depense" ? "-" : "+"}
                  {formatCurrency(transaction.montant)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Aucune transaction récente
          </div>
        )}
      </CardContent>
    </Card>
  )
}
