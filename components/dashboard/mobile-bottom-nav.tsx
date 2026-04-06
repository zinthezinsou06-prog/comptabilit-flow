"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Receipt,
  ArrowDownCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react"

// Les 5 pages les plus utilisées sur mobile
const mobileNav = [
  { name: "Accueil", href: "/dashboard", icon: LayoutDashboard },
  { name: "Dépenses", href: "/dashboard/depenses", icon: Receipt },
  { name: "Retraits", href: "/dashboard/retraits", icon: ArrowDownCircle },
  { name: "Analyse", href: "/dashboard/analyse", icon: TrendingUp },
  { name: "Outils", href: "/dashboard/outils", icon: Sparkles },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 lg:hidden">
      <div className="flex items-stretch" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {mobileNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors",
                "min-h-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-all",
                  isActive && "bg-primary/15"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all",
                    isActive && "scale-110"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
