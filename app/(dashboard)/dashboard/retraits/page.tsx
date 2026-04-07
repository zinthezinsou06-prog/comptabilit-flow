import { createClient } from "@/lib/supabase/server"
import { RetraitsList } from "@/components/retraits/retraits-list"
import { RetraitForm } from "@/components/retraits/retrait-form"
import { PageHeader } from "@/components/page-header"

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
        <PageHeader titleKey="withdrawals.title" subtitleKey="withdrawals.subtitle" />
        <RetraitForm />
      </div>

      <RetraitsList retraits={retraits || []} />
    </div>
  )
}
