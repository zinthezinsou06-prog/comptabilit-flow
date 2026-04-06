import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav"

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

  return (
    <div className="flex min-h-screen min-h-dvh">
      {/* Desktop sidebar */}
      <DashboardSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader user={user} />

        {/* Main content — add bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-auto bg-background p-4 pb-24 sm:p-6 lg:pb-6">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <MobileBottomNav />
      </div>
    </div>
  )
}
