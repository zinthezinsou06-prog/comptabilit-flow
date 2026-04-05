"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter, RotateCcw } from "lucide-react"

interface Category {
  id: string
  nom: string
}

interface ReportsFiltersProps {
  startDate: string
  endDate: string
  type: string
  category: string
  categories: Category[]
}

export function ReportsFilters({
  startDate,
  endDate,
  type,
  category,
  categories,
}: ReportsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    router.push(`/dashboard/rapports?${params.toString()}`)
  }

  function resetFilters() {
    router.push("/dashboard/rapports")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Date de fin</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => updateFilters({ type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="depenses">Dépenses uniquement</SelectItem>
                <SelectItem value="retraits">Retraits uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={category} onValueChange={(value) => updateFilters({ category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={resetFilters} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
