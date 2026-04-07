"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { fr } from '@/lib/i18n/fr'
import { en } from '@/lib/i18n/en'

export interface UserSettings {
  currency: string
  export_header: string
  export_footer: string
  language: string
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => void
  t: (key: string) => string
}

const defaultSettings: UserSettings = {
  currency: '€',
  export_header: 'Mon Entreprise - Export Financier',
  export_footer: 'Généré par Comptabilité Flow',
  language: 'fr',
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  t: (key) => key,
})

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode
  initialSettings?: UserSettings | null
}) {
  const [settings, setSettings] = useState<UserSettings>(
    initialSettings || defaultSettings
  )

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const t = (key: string): string => {
    const dict = settings.language === 'en' ? en : fr;
    return getNestedValue(dict, key) || key;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, t }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
