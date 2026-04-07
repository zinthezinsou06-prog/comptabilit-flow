"use client"

import { useSettings } from "@/components/providers/settings-provider"

export function PageHeader({ 
  titleKey, 
  subtitleKey 
}: { 
  titleKey: string
  subtitleKey: string 
}) {
  const { t } = useSettings()
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t(titleKey)}</h1>
      <p className="text-muted-foreground">{t(subtitleKey)}</p>
    </div>
  )
}
