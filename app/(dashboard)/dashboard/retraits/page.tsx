import { createClient } from "@/lib/supabase/server"
import { RetraitsList } from "@/components/retraits/retraits-list"
import { RetraitForm } from "@/components/retraits/retrait-form"

export default async function RetraitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: retraits } = await supabase
    .from("retraits")
    .select("*")
    .eq("user_id", user?.id)
    .order("date", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Retraits</h1>
          <p className="text-muted-foreground">Gérez vos retraits et entrées d&apos;argent</p>
        </div>
        <RetraitForm />
      </div>

      <RetraitsList retraits={retraits || []} />
    </div>
  )
}
