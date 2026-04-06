"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, 
  Send, 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  User,
  RefreshCw,
} from "lucide-react"

interface FinancialData {
  totalDepenses: number
  totalRetraits: number
  solde: number
  savingsRate: number
  expenseRatio: number
  avgMonthlyDepenses: number
  avgMonthlyRetraits: number
  monthlyData: Array<{
    month: string
    name: string
    depenses: number
    retraits: number
    solde: number
  }>
  depensesByCategory: Array<{
    id: string
    name: string
    value: number
    count: number
    percentage: number
  }>
  transactionCount: number
  depenses: Array<{ id: string; montant: number; date: string; description: string; categorie_id: string }>
  retraits: Array<{ id: string; montant: number; date: string; description: string }>
  categories: Array<{ id: string; nom: string }>
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIFinancialAssistantProps {
  financialData: FinancialData
}

export function AIFinancialAssistant({ financialData }: AIFinancialAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiMode, setAiMode] = useState<"ai" | "local">("local")
  const scrollRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Generate AI-like insights based on financial data (local mode)
  const generateLocalInsights = (query: string): string => {
    const q = query.toLowerCase()
    const {
      totalDepenses,
      totalRetraits,
      solde,
      savingsRate,
      expenseRatio,
      avgMonthlyDepenses,
      avgMonthlyRetraits,
      monthlyData,
      depensesByCategory,
    } = financialData

    // Analyze spending patterns
    if (q.includes("depense") || q.includes("achat") || q.includes("argent")) {
      const topCategories = depensesByCategory.slice(0, 3)
      let response = `Voici mon analyse de vos depenses:\n\n`
      response += `**Total des depenses:** ${formatCurrency(totalDepenses)}\n`
      response += `**Moyenne mensuelle:** ${formatCurrency(avgMonthlyDepenses)}\n\n`
      
      if (topCategories.length > 0) {
        response += `**Top 3 categories de depenses:**\n`
        topCategories.forEach((cat, i) => {
          response += `${i + 1}. ${cat.name}: ${formatCurrency(cat.value)} (${cat.percentage.toFixed(1)}%)\n`
        })
        response += `\n`
      }
      
      if (expenseRatio > 90) {
        response += `**Attention:** Vos depenses representent ${expenseRatio.toFixed(1)}% de vos revenus. Je vous recommande de reduire certaines categories non essentielles.`
      } else if (expenseRatio > 70) {
        response += `**Conseil:** Vos depenses sont correctes mais pourraient etre optimisees. Visez un ratio inferieur a 70%.`
      } else {
        response += `**Excellent:** Vous maitrisez bien vos depenses avec un ratio de ${expenseRatio.toFixed(1)}%.`
      }
      
      return response
    }

    // Analyze savings
    if (q.includes("epargne") || q.includes("economie") || q.includes("economiser")) {
      let response = `Voici mon analyse de votre epargne:\n\n`
      response += `**Taux d'epargne actuel:** ${savingsRate.toFixed(1)}%\n`
      response += `**Solde total:** ${formatCurrency(solde)}\n\n`
      
      if (savingsRate >= 20) {
        response += `**Excellent!** Votre taux d'epargne de ${savingsRate.toFixed(1)}% est superieur a la recommandation de 20%. Continuez ainsi!\n\n`
        response += `**Suggestions:**\n`
        response += `- Envisagez d'investir une partie de votre epargne\n`
        response += `- Constituez un fonds d'urgence de 3-6 mois de depenses`
      } else if (savingsRate >= 10) {
        response += `**Bien!** Votre taux d'epargne est correct mais pourrait etre ameliore.\n\n`
        response += `**Suggestions pour atteindre 20%:**\n`
        response += `- Identifiez 2-3 depenses a reduire\n`
        response += `- Mettez en place un virement automatique d'epargne\n`
        response += `- Montant supplementaire mensuel suggere: ${formatCurrency((avgMonthlyRetraits * 0.2) - (avgMonthlyRetraits - avgMonthlyDepenses))}`
      } else {
        response += `**Attention!** Votre taux d'epargne est faible.\n\n`
        response += `**Plan d'action:**\n`
        response += `1. Analysez vos depenses par categorie\n`
        response += `2. Fixez-vous un objectif de ${formatCurrency(avgMonthlyRetraits * 0.1)} d'epargne mensuelle\n`
        response += `3. Eliminez les abonnements non utilises`
      }
      
      return response
    }

    // Budget recommendations
    if (q.includes("budget") || q.includes("conseil") || q.includes("recommandation")) {
      const topExpense = depensesByCategory[0]
      let response = `Voici mes recommandations budget personnalisees:\n\n`
      
      response += `**Situation actuelle:**\n`
      response += `- Revenus moyens: ${formatCurrency(avgMonthlyRetraits)}/mois\n`
      response += `- Depenses moyennes: ${formatCurrency(avgMonthlyDepenses)}/mois\n`
      response += `- Capacite d'epargne: ${formatCurrency(avgMonthlyRetraits - avgMonthlyDepenses)}/mois\n\n`
      
      response += `**Budget recommande (regle 50/30/20):**\n`
      response += `- Besoins essentiels (50%): ${formatCurrency(avgMonthlyRetraits * 0.5)}\n`
      response += `- Envies (30%): ${formatCurrency(avgMonthlyRetraits * 0.3)}\n`
      response += `- Epargne (20%): ${formatCurrency(avgMonthlyRetraits * 0.2)}\n\n`
      
      if (topExpense && topExpense.percentage > 40) {
        response += `**Point d'attention:** La categorie "${topExpense.name}" represente ${topExpense.percentage.toFixed(1)}% de vos depenses. Envisagez de la reduire.`
      }
      
      return response
    }

    // Trend analysis
    if (q.includes("tendance") || q.includes("evolution") || q.includes("trend")) {
      const last3Months = monthlyData.slice(-3)
      const prev3Months = monthlyData.slice(-6, -3)
      
      const avgRecent = last3Months.reduce((s, m) => s + m.depenses, 0) / (last3Months.length || 1)
      const avgPrev = prev3Months.reduce((s, m) => s + m.depenses, 0) / (prev3Months.length || 1)
      const trend = avgPrev > 0 ? ((avgRecent - avgPrev) / avgPrev) * 100 : 0
      
      let response = `Voici l'analyse de vos tendances:\n\n`
      response += `**Evolution des depenses:**\n`
      response += `- 3 derniers mois (moyenne): ${formatCurrency(avgRecent)}\n`
      response += `- 3 mois precedents (moyenne): ${formatCurrency(avgPrev)}\n`
      response += `- Variation: ${trend > 0 ? "+" : ""}${trend.toFixed(1)}%\n\n`
      
      if (trend > 10) {
        response += `**Alerte:** Vos depenses augmentent significativement. Analysez les causes de cette hausse.`
      } else if (trend < -10) {
        response += `**Felicitations:** Vous avez reussi a reduire vos depenses de ${Math.abs(trend).toFixed(1)}%!`
      } else {
        response += `**Stable:** Vos depenses sont relativement stables sur cette periode.`
      }
      
      return response
    }

    // Forecast
    if (q.includes("prevision") || q.includes("futur") || q.includes("prochain")) {
      const avgMonthly = avgMonthlyDepenses
      const projected3Months = avgMonthly * 3
      const projected6Months = avgMonthly * 6
      const projected12Months = avgMonthly * 12
      
      let response = `Voici mes previsions basees sur vos habitudes:\n\n`
      response += `**Depenses prevues:**\n`
      response += `- Prochain mois: ${formatCurrency(avgMonthly)}\n`
      response += `- 3 prochains mois: ${formatCurrency(projected3Months)}\n`
      response += `- 6 prochains mois: ${formatCurrency(projected6Months)}\n`
      response += `- Annee complete: ${formatCurrency(projected12Months)}\n\n`
      
      response += `**Epargne potentielle:**\n`
      const potentialSavings = (avgMonthlyRetraits - avgMonthlyDepenses) * 12
      response += `Si vous maintenez votre rythme actuel, vous pourriez epargner ${formatCurrency(potentialSavings)} sur l'annee.\n\n`
      
      response += `**Pour augmenter votre epargne de 10%:**\n`
      const targetReduction = avgMonthlyDepenses * 0.1
      response += `Reduisez vos depenses mensuelles de ${formatCurrency(targetReduction)}.`
      
      return response
    }

    // Default response
    return `Je suis votre assistant financier. Voici ce que je peux analyser pour vous:\n\n` +
           `**Vos donnees actuelles:**\n` +
           `- Solde: ${formatCurrency(solde)}\n` +
           `- Taux d'epargne: ${savingsRate.toFixed(1)}%\n` +
           `- Transactions: ${financialData.transactionCount}\n\n` +
           `**Questions que vous pouvez me poser:**\n` +
           `- "Analyse mes depenses"\n` +
           `- "Comment ameliorer mon epargne?"\n` +
           `- "Donne-moi des conseils budget"\n` +
           `- "Quelle est la tendance de mes finances?"\n` +
           `- "Quelles sont les previsions pour les prochains mois?"`
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800))

    const response = generateLocalInsights(input.trim())
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Quick action buttons
  const quickActions = [
    { label: "Analyser mes depenses", icon: TrendingDown },
    { label: "Conseils epargne", icon: PiggyBank },
    { label: "Previsions", icon: TrendingUp },
    { label: "Budget recommande", icon: Lightbulb },
  ]

  // Generate automatic insights
  const autoInsights = [
    {
      type: financialData.savingsRate >= 15 ? "success" : financialData.savingsRate >= 5 ? "warning" : "danger",
      icon: financialData.savingsRate >= 15 ? CheckCircle2 : AlertTriangle,
      text: financialData.savingsRate >= 15 
        ? `Excellent taux d'epargne de ${financialData.savingsRate.toFixed(1)}%`
        : `Taux d'epargne de ${financialData.savingsRate.toFixed(1)}% - ameliorable`,
    },
    {
      type: financialData.expenseRatio <= 80 ? "success" : financialData.expenseRatio <= 95 ? "warning" : "danger",
      icon: financialData.expenseRatio <= 80 ? CheckCircle2 : AlertTriangle,
      text: financialData.expenseRatio <= 80 
        ? `Depenses bien maitrisees (${financialData.expenseRatio.toFixed(1)}% des revenus)`
        : `Depenses elevees (${financialData.expenseRatio.toFixed(1)}% des revenus)`,
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Chat Area */}
      <Card className="lg:col-span-2">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Assistant Financier</CardTitle>
                <CardDescription>Posez vos questions sur vos finances</CardDescription>
              </div>
            </div>
            <Badge variant={aiMode === "ai" ? "default" : "secondary"} className="gap-1">
              <Sparkles className="h-3 w-3" />
              Mode {aiMode === "ai" ? "IA" : "Local"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground">Bienvenue!</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Je suis votre assistant financier. Posez-moi des questions sur vos depenses, 
                  votre epargne, ou demandez des conseils personnalises.
                </p>
                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(action.label)}
                      className="gap-2"
                    >
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content.split("\n").map((line, i) => {
                          if (line.startsWith("**") && line.endsWith("**")) {
                            return <p key={i} className="font-semibold">{line.replace(/\*\*/g, "")}</p>
                          }
                          if (line.startsWith("**")) {
                            const parts = line.split("**")
                            return (
                              <p key={i}>
                                <span className="font-semibold">{parts[1]}</span>
                                {parts[2]}
                              </p>
                            )
                          }
                          return <p key={i}>{line}</p>
                        })}
                      </div>
                      <p className="mt-1 text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                        <User className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                className="min-h-[80px] resize-none"
              />
              <div className="flex flex-col gap-2">
                <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setMessages([])}
                  title="Nouvelle conversation"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar with Auto Insights */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-warning" />
              Insights Automatiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {autoInsights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-lg p-3 ${
                  insight.type === "success"
                    ? "bg-accent/10 text-accent"
                    : insight.type === "warning"
                    ? "bg-warning/10 text-warning-foreground"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <insight.icon className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm">{insight.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resume Rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Solde actuel</span>
              <span className={`font-semibold ${financialData.solde >= 0 ? "text-accent" : "text-destructive"}`}>
                {formatCurrency(financialData.solde)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Depenses moyennes</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(financialData.avgMonthlyDepenses)}/mois
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Retraits moyens</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(financialData.avgMonthlyRetraits)}/mois
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transactions</span>
              <span className="font-semibold text-foreground">
                {financialData.transactionCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setInput(action.label)
                  handleSend()
                }}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
