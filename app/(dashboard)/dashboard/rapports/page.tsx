import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ReportsFilters } from "@/components/reports/reports-filters"
import { ReportsSummary } from "@/components/reports/reports-summary"
import { ReportsTable } from "@/components/reports/reports-table"
import { ReportsExport } from "@/components/reports/reports-export"

interface PageProps {
  searchParams: Promise<{
    startDate?: string
    endDate?: string
    type?: string
    category?: string
  }>
}

export default async function RapportsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const startDate = params.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]
  const endDate = params.endDate || new Date().toISOString().split("T")[0]
  const type = params.type || "all"
  const category = params.category || "all"

  // Fetch data based on filters
  let depensesQuery = supabase
    .from("depenses")
    .select("*, categories(nom)")
    .eq("user_id", user?.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })

  if (category !== "all") {
    depensesQuery = depensesQuery.eq("categorie_id", category)
  }

  const retraitsQuery = supabase
    .from("retraits")
    .select("*")
    .eq("user_id", user?.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })

  const categoriesQuery = supabase
    .from("categories")
    .select("*")
    .eq("user_id", user?.id)
    .order("nom")

  const [depensesResult, retraitsResult, categoriesResult] = await Promise.all([
    depensesQuery,
    retraitsQuery,
    categoriesQuery,
  ])

  const depenses = depensesResult.data || []
  const retraits = retraitsResult.data || []
  const categories = categoriesResult.data || []

  // Filter by type
  const filteredDepenses = type === "retraits" ? [] : depenses
  const filteredRetraits = type === "depenses" ? [] : retraits

  // Calculate totals
  const totalDepenses = filteredDepenses.reduce((sum, d) => sum + Number(d.montant), 0)
  const totalRetraits = filteredRetraits.reduce((sum, r) => sum + Number(r.montant), 0)
  const solde = totalRetraits - totalDepenses

  // Combine transactions for table
  const allTransactions = [
    ...filteredDepenses.map((d) => ({ ...d, type: "depense" as const })),
    ...filteredRetraits.map((r) => ({ ...r, type: "retrait" as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground">Analysez vos finances et exportez vos données</p>
        </div>
        <ReportsExport
          transactions={allTransactions}
          startDate={startDate}
          endDate={endDate}
          totalDepenses={totalDepenses}
          totalRetraits={totalRetraits}
          solde={solde}
        />
      </div>

      <Suspense fallback={<div className="h-[200px] animate-pulse bg-muted rounded-lg" />}>
        <ReportsFilters
          startDate={startDate}
          endDate={endDate}
          type={type}
          category={category}
          categories={categories}
        />
      </Suspense>

      <ReportsSummary
        totalDepenses={totalDepenses}
        totalRetraits={totalRetraits}
        solde={solde}
        transactionCount={allTransactions.length}
      />

      <ReportsTable transactions={allTransactions} />
    </div>
  )
}
