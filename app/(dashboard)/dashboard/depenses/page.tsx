import { createClient } from "@/lib/supabase/server"
import { DepensesList } from "@/components/depenses/depenses-list"
import { DepenseForm } from "@/components/depenses/depense-form"
import { PageHeader } from "@/components/page-header"

export default async function DepensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [depensesResult, categoriesResult] = await Promise.all([
    supabase
      .from("depenses")
      .select("*, categories(nom)")
      .eq("user_id", user?.id)
      .order("date", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user?.id)
      .order("nom"),
  ])

  const depenses = depensesResult.data || []
  const categories = categoriesResult.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader titleKey="expenses.title" subtitleKey="expenses.subtitle" />
        <DepenseForm categories={categories} />
      </div>

      <DepensesList depenses={depenses} categories={categories} />
    </div>
  )
}
