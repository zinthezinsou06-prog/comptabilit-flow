import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

interface Transaction {
  id: string
  montant: number
  date: string
  designation?: string | null
  motif?: string | null
  type: "depense" | "retrait"
  categories?: { nom: string } | null
}

interface ReportsTableProps {
  transactions: Transaction[]
}

export function ReportsTable({ transactions }: ReportsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détail des transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Catégorie/Source</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={`${transaction.type}-${transaction.id}`}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.type === "depense" ? "destructive" : "default"}
                        className={transaction.type === "retrait" ? "bg-accent text-accent-foreground" : ""}
                      >
                        {transaction.type === "depense" ? (
                          <ArrowUpCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDownCircle className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type === "depense" ? "Dépense" : "Retrait"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.type === "depense"
                        ? transaction.categories?.nom || "-"
                        : transaction.designation || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.type === "depense" 
                        ? transaction.designation || "-"
                        : transaction.motif || "-"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.type === "depense" ? "text-destructive" : "text-accent"
                      }`}
                    >
                      {transaction.type === "depense" ? "-" : "+"}
                      {formatCurrency(transaction.montant)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Aucune transaction pour cette période
          </div>
        )}
      </CardContent>
    </Card>
  )
}
