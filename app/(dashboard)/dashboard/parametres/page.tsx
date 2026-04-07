"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { useSettings } from "@/components/providers/settings-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Settings } from "lucide-react"

const settingsSchema = z.object({
  currency: z.string().min(1, "La monnaie est requise"),
  export_header: z.string().optional(),
  export_footer: z.string().optional(),
  language: z.string().default("fr"),
})

export default function ParametresPage() {
  const { settings, updateSettings, t } = useSettings()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      currency: settings.currency,
      export_header: settings.export_header,
      export_footer: settings.export_footer,
      language: settings.language,
    },
  })

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const { error } = await supabase
        .from("user_settings")
        .upsert({ 
          user_id: user.id, 
          currency: values.currency,
          export_header: values.export_header || "",
          export_footer: values.export_footer || "",
          language: values.language,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      updateSettings({
        currency: values.currency,
        export_header: values.export_header || "",
        export_footer: values.export_footer || "",
        language: values.language,
      })

      alert(t("settings.success"))
    } catch (error) {
      console.error(error)
      alert(t("settings.error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          {t("settings.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("settings.description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.global_preferences")}</CardTitle>
          <CardDescription>
            {t("settings.global_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="language">{t("settings.language")}</Label>
              <Select 
                defaultValue={form.getValues("language")} 
                onValueChange={(val) => form.setValue("language", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="FR / EN" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("settings.currency")}</Label>
              <Input
                id="currency"
                placeholder="ex: FCFA, €, $, MAD"
                {...form.register("currency")}
              />
              {form.formState.errors.currency && (
                <p className="text-sm text-red-500">{form.formState.errors.currency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="export_header">{t("settings.export_header")}</Label>
              <Input
                id="export_header"
                {...form.register("export_header")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="export_footer">{t("settings.export_footer")}</Label>
              <Input
                id="export_footer"
                {...form.register("export_footer")}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("common.save")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
