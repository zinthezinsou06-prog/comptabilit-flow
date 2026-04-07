import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SettingsProvider } from "@/components/providers/settings-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let settings = null
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
    
    if (!error) {
      settings = data
    } else {
      console.error("Erreur lors de la récupération des paramètres:", error.message)
    }
  } catch (err) {
    console.error("Erreur inattendue:", err)
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
          <SettingsProvider initialSettings={settings}>
            {children}
          </SettingsProvider>
        </main>
      </div>
    </div>
  )
}
