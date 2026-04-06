"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "./mobile-sidebar"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 safe-area-top">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            {/* Large touch target for Android */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors active:bg-muted lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        <span className="text-base font-semibold text-foreground lg:hidden">ComptaFlow</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Large touch target */}
          <button className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm transition-colors active:bg-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden max-w-[120px] truncate text-sm md:inline-block">
              {user.email}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {user.email}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isLoading}
            className="py-3"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoading ? "Déconnexion..." : "Se déconnecter"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
