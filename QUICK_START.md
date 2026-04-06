# ⚡ Quick Start - Démarrage en 5 minutes

## 🚀 Installation Rapide

### 1️⃣ Prérequis (2 min)
```bash
# Vérifier que vous avez:
node --version    # Node 18+
npm --version     # ou pnpm/yarn
```

### 2️⃣ Installation (2 min)
```bash
# Cloner et installer
git clone <votre-repo>
cd comptabilit-flow
pnpm install
```

### 3️⃣ Configurer Supabase (30 sec)
Créer `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

**Où trouver les clés?**
→ Supabase Dashboard > Settings > API

### 4️⃣ Démarrer (30 sec)
```bash
pnpm dev
```

Ouvrir: `http://localhost:3000`

### 5️⃣ Initialiser la BD (1 min)
1. Aller à `http://localhost:3000/dashboard/init`
2. Cliquer "Initialiser la Base de Données"
3. Attendre la confirmation ✅

---

## ✅ Vous Êtes Prêt!

### Commandes Rapides
```bash
pnpm dev        # Démarrer dev
pnpm build      # Build production
pnpm test       # Tester
```

### Premiers Pas
1. Créer un compte à `/auth/sign-up`
2. Se connecter à `/auth/login`
3. Ajouter une catégorie
4. Ajouter une dépense
5. Voir l'analyse à `/dashboard/analyse`

### Outils Avancés
Allez à `/dashboard/outils` et découvrez:
- 🤖 Assistant IA Financier
- 💼 Outils de Comptabilité
- 🎯 Simulateur de Budget
- 📊 Analyseur de Données

---

## 🆘 Problèmes?

| Problème | Solution |
|----------|----------|
| "Module not found" | `pnpm install` à nouveau |
| "Supabase URL missing" | Vérifier `.env.local` |
| "Table not found" | Aller à `/dashboard/init` |
| "RLS violation" | Vérifier que vous êtes connecté |
| "Build error" | Voir SETUP.md |

---

## 📚 Prochaines Étapes

- [ ] Lire [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- [ ] Lire [SETUP.md](./SETUP.md) pour la config complète
- [ ] Tester avec [VALIDATION.md](./VALIDATION.md)
- [ ] Découvrir les outils avec [TOOLS.md](./TOOLS.md)
- [ ] Préparer le déploiement avec [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Besoin d'aide?** → Lisez [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
