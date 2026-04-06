# Comptabilité Flow - Backend Documentation

## 📚 Vue d'ensemble

Ce document décrit la configuration complète du backend de Comptabilité Flow, incluant:
- Architecture de la base de données
- Configuration de Supabase
- APIs et endpoints
- Gestion des erreurs
- Sécurité et RLS

## 🔧 Architecture Technique

### Stack Technologique
- **Framework**: Next.js 15 (App Router)
- **Base de Données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Déploiement**: Vercel
- **ORM/Query**: Supabase Client Library

### Structure des Dossiers

```
app/
├── (dashboard)/
│   └── dashboard/
│       ├── depenses/      # Gestion des dépenses
│       ├── retraits/      # Gestion des retraits
│       ├── categories/    # Gestion des catégories
│       ├── analyse/       # Analytics et prévisions
│       ├── rapports/      # Rapports et exports
│       ├── outils/        # Outils avancés
│       ├── parametres/    # Paramètres utilisateur
│       └── init/          # Initialisation BD
├── api/
│   ├── init-db/          # Création des tables
│   └── test-db/          # Test de connexion
├── auth/                  # Pages d'authentification
└── layout.tsx             # Layout principal

components/
├── depenses/              # Composants dépenses
├── retraits/              # Composants retraits
├── categories/            # Composants catégories
├── analytics/             # Composants analytics
├── tools/                 # Outils avancés
├── dashboard/             # Composants dashboard
└── ui/                    # Composants UI réutilisables

lib/
├── supabase/
│   ├── client.ts         # Client Supabase (navigateur)
│   ├── server.ts         # Client Supabase (serveur)
│   └── middleware.ts     # Middleware d'authentification

scripts/
├── 001_create_tables.sql  # Création des tables
└── 002_seed_data.sql      # Données de test
```

## 🗄️ Schéma de Base de Données

### Tables Principales

#### `auth.users`
Gérée par Supabase Auth - Contient les utilisateurs authentifiés

#### `categories`
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  champ_dynamique TEXT DEFAULT 'neant',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, nom)
);
```

**Utilisé pour**: Catégoriser les dépenses (Alimentation, Transport, etc.)

#### `depenses`
```sql
CREATE TABLE depenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  categorie_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  designation TEXT NOT NULL,
  montant DECIMAL(15, 2) NOT NULL CHECK(montant >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Utilisé pour**: Enregistrer toutes les dépenses

**Indexes**: `idx_depenses_user_date` sur (user_id, date)

#### `retraits`
```sql
CREATE TABLE retraits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  designation TEXT NOT NULL,
  motif TEXT,
  montant DECIMAL(15, 2) NOT NULL CHECK(montant >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Utilisé pour**: Enregistrer les retraits, salaires, revenus

**Indexes**: `idx_retraits_user_date` sur (user_id, date)

#### `logs`
```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT CHECK(action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_concernee TEXT NOT NULL,
  enregistrement_id UUID,
  details JSONB
);
```

**Utilisé pour**: Audit trail et historique des modifications

**Indexes**: `idx_logs_user` sur user_id

### Row Level Security (RLS)

Toutes les tables ont RLS activé avec les politiques suivantes:

```sql
-- Exemple pour la table depenses
CREATE POLICY "depenses_select_own" ON depenses 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "depenses_insert_own" ON depenses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "depenses_update_own" ON depenses 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "depenses_delete_own" ON depenses 
  FOR DELETE USING (auth.uid() = user_id);
```

## 🔌 API Endpoints

### POST /api/init-db
**Description**: Initialise la base de données en créant toutes les tables

**Request**:
```bash
curl -X POST http://localhost:3000/api/init-db
```

**Response**:
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

### GET /api/test-db
**Description**: Teste la connexion à la base de données et vérifie l'existence des tables

**Request**:
```bash
curl http://localhost:3000/api/test-db
```

**Response**:
```json
{
  "success": true,
  "checks": [
    {
      "table": "categories",
      "exists": true,
      "rowCount": 10
    },
    {
      "table": "depenses",
      "exists": true,
      "rowCount": 45
    },
    {
      "test": "Authentication",
      "authenticated": true,
      "userId": "123e4567-e89b-12d3-a456-426614174000"
    }
  ]
}
```

## 📊 Opérations Courantes

### Ajouter une Dépense

**Code**:
```typescript
const { data: { user } } = await supabase.auth.getUser()

const { data, error } = await supabase
  .from("depenses")
  .insert({
    montant: 25.50,
    date: "2024-04-06",
    categorie_id: "...",
    designation: "Café",
    user_id: user?.id,
  })
  .select()
  .single()
```

### Récupérer les Dépenses d'un Utilisateur

**Code**:
```typescript
const { data: { user } } = await supabase.auth.getUser()

const { data, error } = await supabase
  .from("depenses")
  .select("*, categories(nom)")
  .eq("user_id", user?.id)
  .order("date", { ascending: false })
```

### Calculer les Totaux

**Code**:
```typescript
const depenses = await getDepenses(userId)
const total = depenses.reduce((sum, d) => sum + d.montant, 0)
```

### Analyser les Dépenses par Catégorie

**Code**:
```typescript
const depenses = await getDepenses(userId)
const byCategory = depenses.reduce((acc, d) => {
  const cat = d.categories.nom
  acc[cat] = (acc[cat] || 0) + d.montant
  return acc
}, {})
```

## 🔒 Sécurité

### Authentification
- Gérée entièrement par Supabase Auth
- Support email/mot de passe
- Session gérée via HTTP-only cookies

### Autorisation
- Row Level Security (RLS) activé sur toutes les tables
- Chaque utilisateur ne peut accéder qu'à ses propres données
- Politiques appliquées au niveau de la base de données (plus sûr)

### Bonnes Pratiques
- ✓ Jamais de secrets côté client
- ✓ Validation des données côté serveur
- ✓ Parameterized queries (Supabase le fait automatiquement)
- ✓ HTTPS en production
- ✓ Audit trail complet via table `logs`

## 🚨 Gestion des Erreurs

### Erreurs Courantes et Solutions

#### "Table not found"
**Cause**: Tables non créées
**Solution**: Allez à `/dashboard/init` et initialisez la BD

#### "RLS policy violation"
**Cause**: Pas authentifié ou user_id invalide
**Solution**: Assurez-vous d'être authentifié avec `supabase.auth.getUser()`

#### "Unique constraint violation"
**Cause**: Doublon sur colonne UNIQUE
**Solution**: Vérifiez les contraintes dans le schéma

#### "Network error"
**Cause**: Supabase inaccessible
**Solution**: Vérifiez la variable `NEXT_PUBLIC_SUPABASE_URL`

### Gestion des Erreurs dans le Code

```typescript
try {
  const { data, error } = await supabase
    .from("depenses")
    .insert({...})
    .select()
    .single()

  if (error) {
    console.error("Insert error:", error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
} catch (err) {
  console.error("Unexpected error:", err)
  return { success: false, error: "Unexpected error" }
}
```

## 📈 Performance

### Optimisations Appliquées

1. **Indexes de Base de Données**
   - `idx_depenses_user_date`: Requêtes par utilisateur et date
   - `idx_retraits_user_date`: Requêtes par utilisateur et date
   - `idx_categories_user`: Requêtes des catégories
   - `idx_logs_user`: Requêtes des logs

2. **Caching**
   - Pages serveur statiques cachées
   - Revalidation des données dynamiques

3. **Compression**
   - Gzip activé automatiquement par Vercel
   - Images optimisées

4. **Lazy Loading**
   - Composants client chargés à la demande
   - Code splitting automatique

### Monitoring des Performances

**Supabase Dashboard**:
```
Logs > Database > Slow Queries
```

**Vercel Dashboard**:
```
Analytics > Web Vitals
```

## 🧪 Tests

### Test Manuel
```bash
# Tester les endpoints
curl http://localhost:3000/api/test-db

# Tester l'initialisation
curl -X POST http://localhost:3000/api/init-db
```

### Test Automatisé
```bash
# Exécuter les tests
node scripts/test-backend.js
```

## 📱 Intégration Mobile

L'application est entièrement responsive:
- Mobile (< 640px) ✓
- Tablette (640px - 1024px) ✓
- Desktop (> 1024px) ✓

## 🔄 Migrations Futures

### Étapes pour ajouter une nouvelle table

1. Créer la table dans `scripts/00X_migration.sql`
2. Ajouter RLS et políticas
3. Créer les indexes
4. Exécuter le script dans Supabase
5. Créer les composants React
6. Ajouter les routes API si nécessaire

### Exemple
```sql
-- scripts/003_add_budgets.sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categorie_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  montant_limite DECIMAL(15, 2) NOT NULL,
  mois DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets_select_own" ON budgets 
  FOR SELECT USING (auth.uid() = user_id);

-- ... autres policies ...

CREATE INDEX idx_budgets_user_mois ON budgets(user_id, mois);
```

## 📞 Support et Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [SQL PostgreSQL](https://www.postgresql.org/docs/)

## 📝 Checklist de Vérification

Avant de déployer en production:
- [ ] Base de données initialisée
- [ ] Toutes les tables créées avec RLS
- [ ] Variables d'environnement configurées
- [ ] Sauvegardes Supabase activées
- [ ] Monitoring activé
- [ ] Tests passent
- [ ] Documentation à jour

## 🎯 Prochaines Étapes

1. Tester l'application localement
2. Configurer Vercel
3. Déployer en production
4. Configurer les sauvegardes
5. Mettre en place le monitoring
6. Documenter les processus opérationnels
