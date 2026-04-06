"use client"

import { useState, useRef, useEffect } from "react"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  BookOpen,
  Settings,
  Receipt,
  ArrowDownCircle,
  FolderOpen,
  Upload,
  Download,
  Loader2,
  User,
  RefreshCw,
  X,
  LayoutDashboard,
  TrendingUp,
  FileBarChart,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIHelpAssistantProps {
  onClose?: () => void
}

// Help knowledge base for the assistant
const helpKnowledge = {
  dashboard: {
    keywords: ["tableau de bord", "accueil", "résumé", "vue d'ensemble", "solde", "dashboard"],
    response: `**Tableau de bord**

Le tableau de bord est votre page d'accueil dans ComptaFlow. Voici ce que vous y trouverez :

• **Cartes de résumé** : Affichent votre solde actuel, total des dépenses et total des retraits
• **Graphique d'évolution** : Montre l'évolution de vos finances sur la période sélectionnée
• **Répartition par catégorie** : Visualise comment vos dépenses sont réparties
• **Dernières transactions** : Liste vos transactions récentes

Pour filtrer les données, utilisez les boutons de période en haut (Ce mois, 3 mois, 6 mois, etc.).`,
  },
  depenses: {
    keywords: ["dépense", "dépenses", "ajouter dépense", "nouvelle dépense", "supprimer dépense", "modifier dépense"],
    response: `**Gestion des Dépenses**

Pour **ajouter** une dépense :
1. Allez dans Dépenses depuis le menu
2. Cliquez sur "Nouvelle dépense"
3. Remplissez le montant, la date, la catégorie et la désignation
4. Cliquez sur Enregistrer

Pour **modifier** : Cliquez sur l'icône crayon à côté de la dépense
Pour **supprimer** : Cliquez sur l'icône corbeille et confirmez

Vous pouvez filtrer vos dépenses par catégorie ou par période pour mieux les analyser.`,
  },
  retraits: {
    keywords: ["retrait", "retraits", "revenu", "revenus", "salaire", "entrée d'argent", "ajouter retrait"],
    response: `**Gestion des Retraits**

Dans ComptaFlow, un "retrait" représente une entrée d'argent (revenus, salaires, remboursements).

Pour **ajouter** un retrait :
1. Allez dans Retraits depuis le menu
2. Cliquez sur "Nouveau retrait"
3. Entrez le montant, la date, la désignation et le motif
4. Cliquez sur Enregistrer

Votre **solde** = Total des retraits - Total des dépenses

Un solde positif signifie que vous avez de l'épargne disponible.`,
  },
  categories: {
    keywords: ["catégorie", "catégories", "organiser", "classifier", "créer catégorie"],
    response: `**Gestion des Catégories**

Les catégories vous aident à organiser vos dépenses pour mieux les analyser.

Pour **créer** une catégorie :
1. Allez dans Catégories depuis le menu
2. Cliquez sur "Nouvelle catégorie"
3. Entrez un nom explicite
4. Cliquez sur Créer

**Conseils** :
• Utilisez des noms clairs : Alimentation, Transport, Loisirs, Santé, etc.
• Ne créez pas trop de catégories pour garder une vue claire
• Vous pouvez modifier ou supprimer une catégorie à tout moment`,
  },
  import: {
    keywords: ["import", "importer", "téléverser", "charger", "excel", "csv", "fichier"],
    response: `**Import de Données**

Pour importer des données depuis Excel ou CSV :

1. Allez dans **Paramètres** > **Import/Export**
2. Cliquez sur **Importer des données**
3. Sélectionnez le type : Dépenses, Retraits ou Catégories
4. Choisissez votre fichier (.xlsx ou .csv)
5. Vérifiez l'aperçu des données
6. Cliquez sur **Importer**

**Format requis pour les dépenses** :
| date | designation | montant | categorie |
| 2024-01-15 | Courses | 50.00 | Alimentation |

La première ligne doit contenir les en-têtes de colonnes.`,
  },
  export: {
    keywords: ["export", "exporter", "télécharger", "sauvegarder", "excel", "csv", "extraction"],
    response: `**Export de Données**

Pour exporter vos données :

**Méthode 1 - Depuis un tableau** :
1. Allez dans le tableau souhaité (Dépenses, Retraits, etc.)
2. Cliquez sur le bouton **Exporter**
3. Choisissez le format : Excel ou CSV
4. Le fichier sera téléchargé

**Méthode 2 - Export complet** :
1. Allez dans **Paramètres** > **Import/Export**
2. Cliquez sur **Exporter toutes les données**
3. Choisissez le format souhaité

Les fichiers exportés conservent toutes les colonnes et peuvent être utilisés dans d'autres applications.`,
  },
  analyse: {
    keywords: ["analyse", "analyser", "graphique", "statistiques", "tendance", "évolution"],
    response: `**Analyse et Statistiques**

ComptaFlow propose plusieurs outils d'analyse :

• **Graphiques d'évolution** : Suivez vos dépenses et retraits dans le temps
• **Répartition par catégorie** : Visualisez où va votre argent
• **Comparaison mensuelle** : Comparez vos performances mois par mois
• **Taux d'épargne** : Calculez votre capacité d'épargne

Pour accéder aux analyses détaillées, allez dans la section **Analyse** du menu.

L'**assistant financier IA** dans les Outils Avancés peut aussi analyser vos données et vous donner des conseils personnalisés.`,
  },
  outils: {
    keywords: ["outils", "ia", "assistant", "intelligence artificielle", "avancé", "prévision"],
    response: `**Outils Avancés**

La section Outils Avancés comprend :

• **Assistant Financier IA** : Posez des questions sur vos finances et recevez des conseils personnalisés
• **Prévisions** : Estimations de vos dépenses futures basées sur vos habitudes
• **Alertes** : Configuration d'alertes pour certains seuils de dépenses
• **Objectifs** : Définissez et suivez vos objectifs d'épargne

L'assistant IA peut analyser vos dépenses, suggérer des économies et répondre à vos questions financières.`,
  },
  parametres: {
    keywords: ["paramètre", "paramètres", "configuration", "profil", "compte", "mot de passe", "devise"],
    response: `**Paramètres**

Dans les paramètres, vous pouvez :

• **Profil** : Modifier votre nom, email et photo de profil
• **Sécurité** : Changer votre mot de passe
• **Préférences** : Changer la devise, le format de date, le thème
• **Import/Export** : Importer ou exporter vos données
• **Compte** : Gérer ou supprimer votre compte

Pour accéder aux paramètres, cliquez sur **Paramètres** dans le menu latéral.`,
  },
  navigation: {
    keywords: ["menu", "navigation", "où trouver", "comment accéder", "aller à"],
    response: `**Navigation dans ComptaFlow**

Le menu principal (à gauche sur ordinateur, en haut sur mobile) contient :

• **Tableau de bord** : Vue d'ensemble de vos finances
• **Dépenses** : Gérer vos dépenses
• **Retraits** : Gérer vos revenus/entrées d'argent
• **Catégories** : Organiser vos dépenses
• **Analyse** : Graphiques et statistiques
• **Outils Avancés** : Assistant IA et fonctionnalités avancées
• **Rapports** : Générer des rapports
• **Paramètres** : Configuration de l'application
• **Aide** : Vous êtes ici !

Cliquez sur n'importe quel élément pour y accéder.`,
  },
}

export function AIHelpAssistant({ onClose }: AIHelpAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const generateResponse = (query: string): string => {
    const q = query.toLowerCase()

    // Check each knowledge category
    for (const [, data] of Object.entries(helpKnowledge)) {
      if (data.keywords.some(keyword => q.includes(keyword))) {
        return data.response
      }
    }

    // Check for greetings
    if (q.includes("bonjour") || q.includes("salut") || q.includes("hello") || q.includes("coucou")) {
      return `Bonjour ! Je suis l'assistant d'aide de ComptaFlow. Je peux vous aider avec :

• La navigation dans l'application
• La gestion des dépenses et retraits
• L'import et l'export de données
• L'utilisation des catégories
• L'analyse de vos finances
• La configuration des paramètres

Posez-moi votre question et je vous guiderai !`
    }

    // Check for thanks
    if (q.includes("merci") || q.includes("thanks")) {
      return `De rien ! N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider à utiliser ComptaFlow au mieux.`
    }

    // Default response with suggestions
    return `Je n'ai pas trouvé d'information spécifique pour votre question. Voici ce que je peux vous aider à comprendre :

**Fonctionnalités principales :**
• Tableau de bord et vue d'ensemble
• Gestion des dépenses et retraits
• Import et export de données (Excel/CSV)
• Catégories et organisation
• Analyses et statistiques
• Paramètres et configuration

**Essayez de me demander :**
• "Comment ajouter une dépense ?"
• "Comment importer des données ?"
• "Comment exporter en Excel ?"
• "Comment créer une catégorie ?"

Vous pouvez aussi consulter la documentation ci-dessous pour plus de détails.`
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
    await new Promise(resolve => setTimeout(resolve, 600))

    const response = generateResponse(input.trim())

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

  // Quick action suggestions
  const quickActions = [
    { label: "Navigation", icon: LayoutDashboard },
    { label: "Ajouter une dépense", icon: Receipt },
    { label: "Importer des données", icon: Upload },
    { label: "Exporter en Excel", icon: Download },
  ]

  return (
    <>
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Assistant d&apos;aide</CardTitle>
              <CardDescription>Posez vos questions sur ComptaFlow</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              IA
            </Badge>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages Area */}
        <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground">Comment puis-je vous aider ?</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Posez-moi des questions sur l&apos;utilisation de ComptaFlow.
                Je peux vous guider sur toutes les fonctionnalités.
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
                          return <p key={i} className="font-semibold mt-2 first:mt-0">{line.replace(/\*\*/g, "")}</p>
                        }
                        if (line.startsWith("**")) {
                          const parts = line.split("**")
                          return (
                            <p key={i} className="mt-1">
                              <span className="font-semibold">{parts[1]}</span>
                              {parts[2]}
                            </p>
                          )
                        }
                        if (line.startsWith("•")) {
                          return <p key={i} className="ml-2">{line}</p>
                        }
                        if (line.startsWith("|")) {
                          return <p key={i} className="font-mono text-xs bg-background/50 px-1 rounded">{line}</p>
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
              className="min-h-[60px] resize-none"
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
    </>
  )
}
