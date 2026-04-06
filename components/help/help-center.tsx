"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Search,
  BookOpen,
  LayoutDashboard,
  Receipt,
  ArrowDownCircle,
  FolderOpen,
  TrendingUp,
  FileBarChart,
  Settings,
  HelpCircle,
  MessageCircle,
  Sparkles,
  Upload,
  Download,
  Bot,
} from "lucide-react"
import { AIHelpAssistant } from "./ai-help-assistant"

interface HelpSection {
  id: string
  title: string
  icon: React.ElementType
  description: string
  content: HelpTopic[]
}

interface HelpTopic {
  question: string
  answer: string
  tags: string[]
}

const helpSections: HelpSection[] = [
  {
    id: "dashboard",
    title: "Tableau de bord",
    icon: LayoutDashboard,
    description: "Vue d'ensemble de vos finances",
    content: [
      {
        question: "Comment lire le tableau de bord ?",
        answer: "Le tableau de bord présente un résumé de votre situation financière. Vous y trouverez :\n\n• **Solde actuel** : La différence entre vos retraits et vos dépenses\n• **Total des dépenses** : La somme de toutes vos dépenses enregistrées\n• **Total des retraits** : La somme de tous vos retraits\n• **Graphiques** : Visualisations de l'évolution de vos finances\n\nLes cartes en haut affichent les métriques clés, tandis que les graphiques montrent les tendances sur la période sélectionnée.",
        tags: ["solde", "résumé", "finances"],
      },
      {
        question: "Que signifient les indicateurs de tendance ?",
        answer: "Les flèches et pourcentages à côté des chiffres indiquent l'évolution par rapport à la période précédente :\n\n• **Flèche verte vers le haut** : Augmentation (positif pour les retraits, négatif pour les dépenses)\n• **Flèche rouge vers le bas** : Diminution\n• **Pourcentage** : Taux de variation\n\nCes indicateurs vous aident à suivre vos progrès financiers.",
        tags: ["tendance", "évolution", "indicateurs"],
      },
      {
        question: "Comment filtrer les données du tableau de bord ?",
        answer: "Utilisez les filtres de période en haut du tableau de bord pour afficher les données :\n\n• **Ce mois** : Données du mois en cours\n• **3 mois** : Données des 3 derniers mois\n• **6 mois** : Données des 6 derniers mois\n• **Cette année** : Données de l'année en cours\n• **Personnalisé** : Sélectionnez une période spécifique",
        tags: ["filtre", "période", "date"],
      },
    ],
  },
  {
    id: "depenses",
    title: "Dépenses",
    icon: Receipt,
    description: "Gestion de vos dépenses",
    content: [
      {
        question: "Comment ajouter une nouvelle dépense ?",
        answer: "Pour ajouter une dépense :\n\n1. Allez dans la section **Dépenses** du menu\n2. Cliquez sur le bouton **Nouvelle dépense**\n3. Remplissez le formulaire :\n   • **Montant** : Le montant de la dépense (obligatoire)\n   • **Date** : La date de la dépense\n   • **Catégorie** : Sélectionnez une catégorie existante\n   • **Désignation** : Description de la dépense\n4. Cliquez sur **Enregistrer**\n\nLa dépense apparaîtra dans la liste et sera prise en compte dans vos statistiques.",
        tags: ["ajouter", "nouvelle", "créer"],
      },
      {
        question: "Comment modifier ou supprimer une dépense ?",
        answer: "Pour modifier une dépense :\n\n1. Trouvez la dépense dans la liste\n2. Cliquez sur l'icône **crayon** (modifier)\n3. Modifiez les informations souhaitées\n4. Cliquez sur **Enregistrer**\n\nPour supprimer :\n\n1. Cliquez sur l'icône **corbeille** (supprimer)\n2. Confirmez la suppression dans la boîte de dialogue\n\n**Attention** : La suppression est irréversible.",
        tags: ["modifier", "éditer", "supprimer", "effacer"],
      },
      {
        question: "Comment filtrer les dépenses par catégorie ?",
        answer: "Vous pouvez filtrer vos dépenses de plusieurs façons :\n\n• **Par catégorie** : Utilisez le menu déroulant pour sélectionner une catégorie spécifique\n• **Par date** : Utilisez le sélecteur de période\n• **Par recherche** : Tapez dans la barre de recherche pour trouver une dépense spécifique\n\nLes filtres peuvent être combinés pour affiner vos résultats.",
        tags: ["filtrer", "rechercher", "catégorie"],
      },
    ],
  },
  {
    id: "retraits",
    title: "Retraits",
    icon: ArrowDownCircle,
    description: "Gestion de vos retraits",
    content: [
      {
        question: "Qu'est-ce qu'un retrait dans ComptaFlow ?",
        answer: "Dans ComptaFlow, un **retrait** représente une entrée d'argent ou un revenu. Cela peut inclure :\n\n• Salaires\n• Remboursements\n• Virements reçus\n• Revenus divers\n\nLes retraits augmentent votre solde et sont utilisés pour calculer votre capacité d'épargne.",
        tags: ["définition", "revenu", "entrée"],
      },
      {
        question: "Comment ajouter un retrait ?",
        answer: "Pour ajouter un retrait :\n\n1. Allez dans la section **Retraits** du menu\n2. Cliquez sur **Nouveau retrait**\n3. Remplissez :\n   • **Montant** : Le montant reçu\n   • **Date** : La date du retrait\n   • **Désignation** : Description du retrait\n   • **Motif** : Raison du retrait (optionnel)\n4. Cliquez sur **Enregistrer**",
        tags: ["ajouter", "nouveau", "créer"],
      },
      {
        question: "Quelle est la différence entre retrait et dépense ?",
        answer: "• **Retrait** : Argent qui entre dans votre budget (revenus, salaires, remboursements)\n• **Dépense** : Argent qui sort de votre budget (achats, factures, abonnements)\n\nVotre **solde** = Total des retraits - Total des dépenses\n\nUn solde positif signifie que vous avez économisé de l'argent.",
        tags: ["différence", "comparaison", "solde"],
      },
    ],
  },
  {
    id: "categories",
    title: "Catégories",
    icon: FolderOpen,
    description: "Organisation des dépenses",
    content: [
      {
        question: "À quoi servent les catégories ?",
        answer: "Les catégories vous permettent d'organiser vos dépenses par type pour :\n\n• **Analyser** vos habitudes de dépenses\n• **Identifier** où va votre argent\n• **Comparer** les dépenses entre catégories\n• **Définir** des budgets par catégorie\n\nExemples de catégories : Alimentation, Transport, Loisirs, Santé, etc.",
        tags: ["organisation", "classement", "utilité"],
      },
      {
        question: "Comment créer une catégorie ?",
        answer: "Pour créer une nouvelle catégorie :\n\n1. Allez dans la section **Catégories**\n2. Cliquez sur **Nouvelle catégorie**\n3. Entrez le nom de la catégorie\n4. Cliquez sur **Créer**\n\nVous pourrez ensuite utiliser cette catégorie lors de l'ajout de dépenses.",
        tags: ["créer", "ajouter", "nouvelle"],
      },
      {
        question: "Puis-je supprimer une catégorie utilisée ?",
        answer: "**Attention** : Si vous supprimez une catégorie qui est utilisée par des dépenses :\n\n• Les dépenses associées ne seront pas supprimées\n• Ces dépenses n'auront plus de catégorie assignée\n• Elles apparaîtront comme \"Sans catégorie\"\n\nIl est recommandé de réassigner les dépenses à une autre catégorie avant la suppression.",
        tags: ["supprimer", "effacer", "dépenses"],
      },
    ],
  },
  {
    id: "analyse",
    title: "Analyse",
    icon: TrendingUp,
    description: "Analyses et graphiques",
    content: [
      {
        question: "Quels types de graphiques sont disponibles ?",
        answer: "ComptaFlow propose plusieurs visualisations :\n\n• **Graphique linéaire** : Évolution des dépenses et retraits dans le temps\n• **Graphique en barres** : Comparaison mensuelle\n• **Graphique circulaire** : Répartition par catégorie\n• **Graphique en aires** : Évolution du solde\n\nChaque graphique peut être filtré par période.",
        tags: ["graphiques", "visualisation", "statistiques"],
      },
      {
        question: "Comment interpréter les analyses ?",
        answer: "Les analyses vous aident à comprendre vos finances :\n\n• **Tendances** : Identifiez les mois où vous dépensez plus ou moins\n• **Répartition** : Voyez quelles catégories consomment le plus\n• **Comparaison** : Comparez vos performances mois par mois\n• **Prévisions** : Estimez vos dépenses futures basées sur l'historique\n\nUtilisez ces informations pour ajuster votre budget.",
        tags: ["interpréter", "comprendre", "utiliser"],
      },
    ],
  },
  {
    id: "outils",
    title: "Outils Avancés",
    icon: Sparkles,
    description: "Assistant IA et fonctionnalités avancées",
    content: [
      {
        question: "Comment fonctionne l'assistant financier IA ?",
        answer: "L'assistant financier IA analyse vos données et peut :\n\n• **Répondre** à vos questions sur vos finances\n• **Analyser** vos habitudes de dépenses\n• **Suggérer** des conseils d'épargne personnalisés\n• **Prédire** vos dépenses futures\n• **Alerter** sur les dépenses inhabituelles\n\nPosez simplement votre question dans le chat et l'assistant vous répondra.",
        tags: ["IA", "assistant", "intelligence artificielle"],
      },
      {
        question: "Quelles questions puis-je poser à l'assistant ?",
        answer: "Vous pouvez demander :\n\n• \"Analyse mes dépenses du mois dernier\"\n• \"Comment puis-je économiser plus ?\"\n• \"Quel est mon budget recommandé ?\"\n• \"Quelles sont mes prévisions pour le prochain mois ?\"\n• \"Dans quelle catégorie je dépense le plus ?\"\n\nL'assistant adapte ses réponses à vos données réelles.",
        tags: ["questions", "demander", "interaction"],
      },
    ],
  },
  {
    id: "import-export",
    title: "Import / Export",
    icon: Upload,
    description: "Importation et exportation de données",
    content: [
      {
        question: "Comment importer des données ?",
        answer: "Pour importer des données depuis un fichier Excel ou CSV :\n\n1. Allez dans **Paramètres** > **Import/Export**\n2. Cliquez sur **Importer des données**\n3. Sélectionnez le type de données (dépenses, retraits, catégories)\n4. Choisissez votre fichier (.xlsx ou .csv)\n5. Vérifiez l'aperçu des données\n6. Cliquez sur **Importer**\n\nLe format attendu sera affiché avec des exemples.",
        tags: ["importer", "Excel", "CSV", "télécharger"],
      },
      {
        question: "Quel format utiliser pour l'import ?",
        answer: "**Pour les dépenses** :\n• Colonnes : date, designation, montant, categorie\n• Format date : AAAA-MM-JJ (ex: 2024-01-15)\n• Montant : nombre décimal (ex: 50.00)\n\n**Pour les retraits** :\n• Colonnes : date, designation, montant, motif\n\n**Pour les catégories** :\n• Colonnes : nom\n\nLa première ligne doit contenir les en-têtes.",
        tags: ["format", "colonnes", "structure"],
      },
      {
        question: "Comment exporter mes données ?",
        answer: "Pour exporter vos données :\n\n1. Allez dans le tableau souhaité (Dépenses, Retraits, etc.)\n2. Cliquez sur le bouton **Exporter**\n3. Choisissez le format : **Excel (.xlsx)** ou **CSV (.csv)**\n4. Le fichier sera téléchargé automatiquement\n\nVous pouvez aussi exporter toutes vos données depuis **Paramètres** > **Import/Export**.",
        tags: ["exporter", "télécharger", "sauvegarder"],
      },
    ],
  },
  {
    id: "rapports",
    title: "Rapports",
    icon: FileBarChart,
    description: "Génération de rapports",
    content: [
      {
        question: "Quels rapports puis-je générer ?",
        answer: "ComptaFlow propose plusieurs types de rapports :\n\n• **Rapport mensuel** : Résumé du mois avec dépenses, retraits et solde\n• **Rapport par catégorie** : Analyse détaillée par catégorie\n• **Rapport annuel** : Vue d'ensemble de l'année\n• **Rapport comparatif** : Comparaison entre périodes\n\nChaque rapport peut être exporté en PDF ou imprimé.",
        tags: ["rapport", "génération", "types"],
      },
      {
        question: "Comment personnaliser un rapport ?",
        answer: "Avant de générer un rapport, vous pouvez :\n\n• **Sélectionner la période** : Dates de début et fin\n• **Choisir les catégories** : Inclure ou exclure certaines catégories\n• **Ajouter des notes** : Commentaires personnalisés\n• **Configurer le format** : Orientation, taille de page\n\nLe rapport sera généré avec vos préférences.",
        tags: ["personnaliser", "configurer", "options"],
      },
    ],
  },
  {
    id: "parametres",
    title: "Paramètres",
    icon: Settings,
    description: "Configuration de l'application",
    content: [
      {
        question: "Comment modifier mon profil ?",
        answer: "Pour modifier votre profil :\n\n1. Allez dans **Paramètres**\n2. Section **Profil**\n3. Modifiez vos informations :\n   • Nom d'utilisateur\n   • Email\n   • Photo de profil\n4. Cliquez sur **Enregistrer**\n\nVotre mot de passe peut être modifié séparément dans la section **Sécurité**.",
        tags: ["profil", "compte", "informations"],
      },
      {
        question: "Comment changer la devise ?",
        answer: "Pour changer la devise affichée :\n\n1. Allez dans **Paramètres**\n2. Section **Préférences**\n3. Sélectionnez votre devise dans le menu déroulant\n4. Les montants seront automatiquement formatés\n\n**Note** : Cela ne convertit pas les montants, seulement l'affichage.",
        tags: ["devise", "monnaie", "format"],
      },
      {
        question: "Comment supprimer mon compte ?",
        answer: "**Attention** : Cette action est irréversible !\n\nPour supprimer votre compte :\n\n1. Allez dans **Paramètres**\n2. Section **Compte**\n3. Cliquez sur **Supprimer le compte**\n4. Confirmez avec votre mot de passe\n5. Validez la suppression\n\nToutes vos données seront définitivement effacées.",
        tags: ["supprimer", "effacer", "compte"],
      },
    ],
  },
]

const faqItems = [
  {
    question: "L'application est-elle gratuite ?",
    answer: "Oui, ComptaFlow est entièrement gratuit. Toutes les fonctionnalités sont accessibles sans frais.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, vos données sont stockées de manière sécurisée et chiffrées. Nous utilisons les meilleures pratiques de sécurité pour protéger vos informations financières.",
  },
  {
    question: "Puis-je utiliser l'application sur mobile ?",
    answer: "Oui, ComptaFlow est responsive et fonctionne parfaitement sur smartphone et tablette via votre navigateur web.",
  },
  {
    question: "Comment contacter le support ?",
    answer: "Utilisez l'assistant IA intégré pour obtenir de l'aide instantanée. Pour les problèmes techniques, vous pouvez nous contacter via la section Paramètres.",
  },
]

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showAssistant, setShowAssistant] = useState(false)

  const filteredSections = helpSections.map(section => ({
    ...section,
    content: section.content.filter(
      topic =>
        topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  })).filter(section => section.content.length > 0 || searchQuery === "")

  const allResults = searchQuery
    ? helpSections.flatMap(section =>
        section.content
          .filter(
            topic =>
              topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              topic.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
              topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map(topic => ({ ...topic, sectionTitle: section.title, sectionIcon: section.icon }))
      )
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Centre d&apos;aide</h1>
          <p className="text-muted-foreground">
            Documentation et assistance pour utiliser ComptaFlow
          </p>
        </div>
        <Button onClick={() => setShowAssistant(!showAssistant)} className="gap-2">
          <Bot className="h-4 w-4" />
          {showAssistant ? "Masquer l'assistant" : "Assistant IA"}
        </Button>
      </div>

      {/* AI Assistant Panel */}
      {showAssistant && (
        <Card className="border-primary/20">
          <AIHelpAssistant onClose={() => setShowAssistant(false)} />
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'aide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" />
              Résultats de recherche
              <Badge variant="secondary">{allResults.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allResults.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {allResults.map((result, index) => (
                  <AccordionItem key={index} value={`search-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <result.sectionIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{result.question}</span>
                        <Badge variant="outline" className="ml-2">
                          {result.sectionTitle}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        {result.answer.split("\n").map((line, i) => (
                          <p key={i} className="mb-2">
                            {line.startsWith("•") ? (
                              <span className="flex gap-2">
                                <span>•</span>
                                <span>{line.substring(2)}</span>
                              </span>
                            ) : line.startsWith("**") ? (
                              <strong>{line.replace(/\*\*/g, "")}</strong>
                            ) : (
                              line
                            )}
                          </p>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {result.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <HelpCircle className="mx-auto mb-2 h-8 w-8" />
                <p>Aucun résultat trouvé pour &quot;{searchQuery}&quot;</p>
                <p className="text-sm mt-1">Essayez avec d&apos;autres mots-clés ou posez votre question à l&apos;assistant IA</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="documentation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documentation" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documentation" className="space-y-4">
          {/* Quick Navigation */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {helpSections.map((section) => (
              <Card
                key={section.id}
                className={`cursor-pointer transition-colors hover:border-primary/50 ${
                  activeSection === section.id ? "border-primary" : ""
                }`}
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Section Content */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {(activeSection
                ? filteredSections.filter(s => s.id === activeSection)
                : filteredSections
              ).map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <section.icon className="h-5 w-5 text-primary" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {section.content.map((topic, index) => (
                        <AccordionItem key={index} value={`${section.id}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {topic.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                              {topic.answer.split("\n").map((line, i) => (
                                <p key={i} className="mb-2">
                                  {line.startsWith("•") ? (
                                    <span className="flex gap-2">
                                      <span>•</span>
                                      <span>{line.substring(2)}</span>
                                    </span>
                                  ) : line.startsWith("**") && line.endsWith("**") ? (
                                    <strong>{line.replace(/\*\*/g, "")}</strong>
                                  ) : line.includes("**") ? (
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                                      }}
                                    />
                                  ) : (
                                    line
                                  )}
                                </p>
                              ))}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {topic.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Questions fréquentes
              </CardTitle>
              <CardDescription>
                Réponses aux questions les plus courantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
