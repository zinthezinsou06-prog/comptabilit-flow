import { createClient } from "@/lib/supabase/server"
import { CategoriesList } from "@/components/categories/categories-list"
import { CategoryForm } from "@/components/categories/category-form"

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user?.id)
    .order("nom")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
          <p className="text-muted-foreground">Gérez vos catégories de dépenses</p>
        </div>
        <CategoryForm />
      </div>

      <CategoriesList categories={categories || []} />
    </div>
  )
}
