import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

interface Transaction {
  montant: number
  date: string
  type: "depense" | "retrait"
  categories?: { nom: string } | null
  source?: string
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
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions récentes</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      transaction.type === "depense"
                        ? "bg-destructive/10"
                        : "bg-accent/10"
                    }`}
                  >
                    {transaction.type === "depense" ? (
                      <ArrowUpCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.type === "depense"
                        ? transaction.categories?.nom || "Dépense"
                        : transaction.source || "Retrait"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-lg font-semibold ${
                    transaction.type === "depense" ? "text-destructive" : "text-accent"
                  }`}
                >
                  {transaction.type === "depense" ? "-" : "+"}
                  {formatCurrency(transaction.montant)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Aucune transaction récente
          </div>
        )}
      </CardContent>
    </Card>
  )
}
