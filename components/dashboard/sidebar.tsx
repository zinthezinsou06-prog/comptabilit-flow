"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Receipt,
  ArrowDownCircle,
  FileBarChart,
  Settings,
  FolderOpen,
  TrendingUp,
  Sparkles,
  Upload,
  HelpCircle,
} from "lucide-react"
import { useSettings } from "@/components/providers/settings-provider"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { t } = useSettings()

  const navigation = [
    { name: t("sidebar.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("sidebar.expenses"), href: "/dashboard/depenses", icon: Receipt },
    { name: t("sidebar.withdrawals"), href: "/dashboard/retraits", icon: ArrowDownCircle },
    { name: t("sidebar.categories"), href: "/dashboard/categories", icon: FolderOpen },
    { name: t("sidebar.analysis"), href: "/dashboard/analyse", icon: TrendingUp },
    { name: t("sidebar.tools"), href: "/dashboard/outils", icon: Sparkles },
    { name: "Import/Export", href: "/dashboard/import-export", icon: Upload },
    { name: "Rapports", href: "/dashboard/rapports", icon: FileBarChart },
    { name: t("sidebar.settings"), href: "/dashboard/parametres", icon: Settings },
    { name: "Aide", href: "/dashboard/aide", icon: HelpCircle },
  ]

  return (
    <aside className="hidden w-64 border-r border-border bg-card lg:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">CF</span>
          </div>
          <span className="text-lg font-semibold text-foreground">ComptaFlow</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
