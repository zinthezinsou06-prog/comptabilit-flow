# Guide de Configuration - Comptabilité Flow

## Configuration Préalable

### 1. Supabase Integration
L'application utilise Supabase pour la base de données. Assurez-vous que:
- Votre projet Supabase est connecté
- Les variables d'environnement Supabase sont correctement configurées dans votre projet Vercel

Variables d'environnement requises:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optionnel, pour les opérations côté serveur)

### 2. Initialisation de la Base de Données

Deux méthodes sont disponibles:

#### Méthode 1: Interface Web (Recommandée)
1. Connectez-vous à l'application
2. Accédez à `/dashboard/init` ou cliquez sur "Initialisation" dans le menu
3. Cliquez sur "Initialiser la Base de Données"
4. L'application crée automatiquement les tables nécessaires

#### Méthode 2: Script SQL Direct
Exécutez le script SQL dans votre Supabase dashboard:
```bash
Scripts > SQL Editor > Copiez le contenu de scripts/001_create_tables.sql
```

## Architecture de la Base de Données

### Tables Principales

#### `categories`
Stocke les catégories de dépenses de l'utilisateur.
- `id` (UUID): Clé primaire
- `user_id` (UUID): Référence à l'utilisateur
- `nom` (TEXT): Nom de la catégorie
- `champ_dynamique` (TEXT): Type de champ dynamique (executeur, observation, neant)
- `created_at` (TIMESTAMPTZ): Date de création

#### `depenses`
Enregistre toutes les dépenses.
- `id` (UUID): Clé primaire
- `user_id` (UUID): Référence à l'utilisateur
- `date` (DATE): Date de la dépense
- `categorie_id` (UUID): Référence à la catégorie
- `designation` (TEXT): Description de la dépense
- `montant` (DECIMAL): Montant en euros
- `created_at` (TIMESTAMPTZ): Date de création
- `updated_at` (TIMESTAMPTZ): Date de modification

#### `retraits`
Enregistre tous les retraits/revenus.
- `id` (UUID): Clé primaire
- `user_id` (UUID): Référence à l'utilisateur
- `date` (DATE): Date du retrait
- `designation` (TEXT): Description du retrait
- `motif` (TEXT): Motif du retrait
- `montant` (DECIMAL): Montant en euros
- `created_at` (TIMESTAMPTZ): Date de création
- `updated_at` (TIMESTAMPTZ): Date de modification

#### `logs`
Audit trail pour toutes les opérations.
- `id` (UUID): Clé primaire
- `user_id` (UUID): Référence à l'utilisateur
- `timestamp` (TIMESTAMPTZ): Moment de l'action
- `action` (TEXT): Type d'action (INSERT, UPDATE, DELETE)
- `table_concernee` (TEXT): Nom de la table affectée
- `enregistrement_id` (UUID): ID de l'enregistrement affecté
- `details` (JSONB): Détails additionnels en JSON

## Row Level Security (RLS)

Toutes les tables ont RLS activé. Les politiques de sécurité garantissent que:
- Les utilisateurs peuvent voir uniquement leurs propres données
- Les utilisateurs peuvent modifier/supprimer uniquement leurs propres enregistrements

## Fonctionnalités

### Dashboard
- **Aperçu**: Vue d'ensemble avec statistiques clés
- **Dépenses**: Gestion complète des dépenses avec catégories
- **Retraits**: Gestion des retraits et revenus
- **Catégories**: Création et gestion des catégories

### Analytics
- **Analyse**: Tendances, ratios, prévisions
- **Rapports**: Export et filtrage des données
- **Outils Avancés**: Assistant IA, analyses avancées, simulateur de budget

## Résolution des Problèmes

### Erreur: "Table not found"
- Assurez-vous d'avoir exécuté l'initialisation via `/dashboard/init`
- Vérifiez que votre compte Supabase a les droits nécessaires

### Erreur: "RLS policy violation"
- Assurez-vous que vous êtes authentifié
- Vérifiez que l'utilisateur_id dans la requête correspond à votre ID utilisateur

### L'API /init-db retourne une erreur
- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est configuré
- Assurez-vous que Supabase est correctement intégré au projet

## API Endpoints

### POST /api/init-db
Initialise la base de données. Crée les tables s'elles n'existent pas.

### GET /api/test-db
Teste la connexion et vérifie l'existence des tables.

## Structure du Projet

```
app/
  (dashboard)/
    dashboard/
      depenses/          # Gestion des dépenses
      retraits/          # Gestion des retraits
      categories/        # Gestion des catégories
      analyse/           # Analyses et prévisions
      rapports/          # Rapports et exports
      outils/            # Outils avancés
      init/              # Initialisation de la BD
  api/
    init-db/            # Endpoint d'initialisation
    test-db/            # Endpoint de test

components/
  depenses/             # Composants pour dépenses
  retraits/             # Composants pour retraits
  categories/           # Composants pour catégories
  analytics/            # Composants d'analyse
  tools/                # Outils avancés
  dashboard/            # Composants du dashboard

scripts/
  001_create_tables.sql # Script de création des tables
  002_seed_data.sql     # Script de données de test
```

## Support

Pour toute question ou problème:
1. Vérifiez que Supabase est correctement intégré
2. Consultez les logs en `/api/test-db`
3. Assurez-vous que les variables d'environnement sont correctement configurées
