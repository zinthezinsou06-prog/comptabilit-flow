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
} from "lucide-react"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Dépenses", href: "/dashboard/depenses", icon: Receipt },
  { name: "Retraits", href: "/dashboard/retraits", icon: ArrowDownCircle },
  { name: "Catégories", href: "/dashboard/categories", icon: FolderOpen },
  { name: "Rapports", href: "/dashboard/rapports", icon: FileBarChart },
  { name: "Paramètres", href: "/dashboard/parametres", icon: Settings },
]

export function MobileSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-card">
      <SheetHeader className="border-b border-border p-4">
        <SheetTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">CF</span>
          </div>
          <span>ComptaFlow</span>
        </SheetTitle>
      </SheetHeader>
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
    </div>
  )
}
