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
import { History } from "lucide-react"

interface Log {
  id: string
  action: string
  table_name: string
  details: string | null
  created_at: string
}

interface AuditLogProps {
  logs: Log[]
}

export function AuditLog({ logs }: AuditLogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-accent text-accent-foreground"
      case "UPDATE":
        return "bg-primary text-primary-foreground"
      case "DELETE":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "CREATE":
        return "Création"
      case "UPDATE":
        return "Modification"
      case "DELETE":
        return "Suppression"
      default:
        return action
    }
  }

  const getTableLabel = (tableName: string) => {
    switch (tableName) {
      case "depenses":
        return "Dépenses"
      case "retraits":
        return "Retraits"
      case "categories":
        return "Catégories"
      default:
        return tableName
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Journal d&apos;audit
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getTableLabel(log.table_name)}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.details || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Aucune action enregistrée
          </div>
        )}
      </CardContent>
    </Card>
  )
}
