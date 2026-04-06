# Guide de Déploiement - Comptabilité Flow

## Prérequis

- Node.js 18+ et npm/pnpm
- Un compte Supabase
- Un compte Vercel (pour le déploiement)

## Installation Locale

### 1. Cloner le repository

```bash
git clone <votre-repo>
cd comptabilit-flow
```

### 2. Installer les dépendances

```bash
pnpm install
# ou
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Optionnel - Redirection après confirmation email
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

### 4. Obtenir les clés Supabase

1. Allez sur votre tableau de bord Supabase
2. Allez dans **Settings > API**
3. Copiez:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public)** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role (secret)** → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Démarrer le serveur de développement

```bash
pnpm dev
# ou
npm run dev
```

L'application est maintenant accessible à `http://localhost:3000`

### 6. Initialiser la base de données

1. Allez à `http://localhost:3000/dashboard/init`
2. Cliquez sur "Initialiser la Base de Données"
3. Attendez que l'initialisation se termine
4. Les tables sont créées automatiquement

## Déploiement sur Vercel

### 1. Configurer le repository Git

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connecter Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Sélectionnez votre repository
4. Cliquez sur "Import"

### 3. Configurer les variables d'environnement

Dans le dashboard Vercel:

1. Allez dans **Settings > Environment Variables**
2. Ajoutez les variables suivantes:

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://votre-domain.vercel.app/dashboard
```

3. Cliquez sur "Save"

### 4. Déployer

Vercel déploiera automatiquement à chaque push sur `main`.

Alternativement, cliquez sur le bouton "Deploy".

### 5. Initialiser la base de données en production

1. Allez sur `https://votre-domain.vercel.app/dashboard/init`
2. Cliquez sur "Initialiser la Base de Données"
3. Vérifiez que tout fonctionne correctement

## Configuration Supabase

### Politiques RLS

Les tables ont déjà des politiques RLS configurées. Vérifiez dans Supabase:

**Supabase Dashboard > SQL Editor:**

```sql
SELECT * FROM pg_policies WHERE tablename IN ('categories', 'depenses', 'retraits', 'logs');
```

### Sauvegardes

Activez les sauvegardes automatiques de Supabase:

1. Allez dans **Settings > Backups**
2. Sélectionnez une fréquence (Daily recommandé)

## Monitoring et Maintenance

### Vérifier les logs

**Vercel:**
```bash
vercel logs
```

**Supabase:**
1. Dashboard > Logs
2. Sélectionnez le type de log (Database, Auth, etc.)

### Tests

Pour tester votre déploiement:

```bash
# Localement
node scripts/test-backend.js

# Ou en production
curl https://votre-domain.vercel.app/api/test-db
```

## Troubleshooting

### Erreur: "Database not found"

1. Vérifiez que les variables d'environnement sont correctement configurées
2. Allez à `/dashboard/init` pour initialiser la base de données
3. Vérifiez dans Supabase que les tables existent

### Erreur: "RLS policy violation"

1. Assurez-vous d'être authentifié
2. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est configuré (côté serveur seulement)
3. Consultez les policies RLS dans Supabase

### Erreur: "Auth not working"

1. Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont corrects
2. Allez dans Supabase > Authentication > Providers et vérifiez que Email est activé
3. Vérifiez que les redirects email sont correctement configurées

## Performance

### Optimisations recommandées

1. **Caching**: Les pages sont cached côté serveur
2. **Images**: Les images sont optimisées automatiquement
3. **Database**: Des indexes sont créés automatiquement sur les colonnes fréquemment requêtées

### Monitoring des performances

1. Utilisez Vercel Analytics
2. Consultez les logs Supabase pour les requêtes lentes
3. Utilisez les outils de développement du navigateur

## Sécurité

### Bonnes pratiques

1. ✓ RLS est activé sur toutes les tables
2. ✓ Les clés secrètes ne sont jamais exposées au client
3. ✓ L'authentification se fait via Supabase
4. ✓ Les mots de passe sont hashés et salés

### Checkliste pré-production

- [ ] Variables d'environnement correctement configurées
- [ ] HTTPS activé (Vercel le fait automatiquement)
- [ ] Sauvegardes Supabase activées
- [ ] Monitoring configuré
- [ ] Logs d'audit activés
- [ ] Authentification 2FA configurée (optionnel)

## Support

Pour les problèmes:

1. Consultez le fichier [SETUP.md](./SETUP.md)
2. Vérifiez les logs Vercel et Supabase
3. Testez les endpoints API manuellement
4. Consultez la documentation Supabase et Vercel

## Rollback

Pour revenir à une version précédente:

**Vercel:**
1. Dashboard > Deployments
2. Sélectionnez le déploiement précédent
3. Cliquez sur "Promote to Production"

**Supabase (en cas de problème avec la BD):**
1. Utilisez une sauvegarde (Settings > Backups)
2. Exécutez le script SQL pour restaurer l'état précédent
