"use client"

import { useState, useEffect } from "react"

export interface DocumentHeader {
  companyName: string
  subtitle: string
  address: string
  phone: string
  email: string
  logo: string
}

export interface DocumentSignature {
  signatoryName: string
  signatoryTitle: string
  note: string
}

export interface DocumentSettings {
  header: DocumentHeader
  signature: DocumentSignature
}

const STORAGE_KEY = "comptaflow_document_settings"

const defaultSettings: DocumentSettings = {
  header: {
    companyName: "",
    subtitle: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
  },
  signature: {
    signatoryName: "",
    signatoryTitle: "",
    note: "",
  },
}

export function useDocumentSettings() {
  const [settings, setSettings] = useState<DocumentSettings>(defaultSettings)
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as DocumentSettings
        setSettings(parsed)
      }
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  const updateSettings = (updated: DocumentSettings) => {
    setSettings(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const updateHeader = (header: Partial<DocumentHeader>) => {
    const updated = { ...settings, header: { ...settings.header, ...header } }
    updateSettings(updated)
  }

  const updateSignature = (signature: Partial<DocumentSignature>) => {
    const updated = { ...settings, signature: { ...settings.signature, ...signature } }
    updateSettings(updated)
  }

  return { settings, updateHeader, updateSignature, loaded }
}
