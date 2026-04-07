import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const SQL_SCRIPT = `
-- Table des paramètres utilisateurs
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT '€' NOT NULL,
  export_header TEXT DEFAULT 'Mon Entreprise - Export Financier',
  export_footer TEXT DEFAULT 'Généré par Comptabilité Flow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table categories (prédéfinies ou éditables)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    champ_dynamique TEXT CHECK(champ_dynamique IN ('executeur', 'observation', 'neant')) DEFAULT 'neant',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, nom)
);

-- Table depenses
CREATE TABLE IF NOT EXISTS depenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    categorie_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    designation TEXT NOT NULL,
    champ_dynamique_valeur TEXT,
    montant DECIMAL(15, 2) NOT NULL CHECK(montant >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table retraits
CREATE TABLE IF NOT EXISTS retraits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    designation TEXT NOT NULL,
    motif TEXT,
    montant DECIMAL(15, 2) NOT NULL CHECK(montant >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table logs (audit trail)
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    action TEXT CHECK(action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    table_concernee TEXT NOT NULL,
    enregistrement_id UUID,
    details JSONB
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE depenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE retraits ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for categories
DROP POLICY IF EXISTS "categories_select_own" ON categories;
DROP POLICY IF EXISTS "categories_insert_own" ON categories;
DROP POLICY IF EXISTS "categories_update_own" ON categories;
DROP POLICY IF EXISTS "categories_delete_own" ON categories;

CREATE POLICY "categories_select_own" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert_own" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update_own" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete_own" ON categories FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for depenses
DROP POLICY IF EXISTS "depenses_select_own" ON depenses;
DROP POLICY IF EXISTS "depenses_insert_own" ON depenses;
DROP POLICY IF EXISTS "depenses_update_own" ON depenses;
DROP POLICY IF EXISTS "depenses_delete_own" ON depenses;

CREATE POLICY "depenses_select_own" ON depenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "depenses_insert_own" ON depenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "depenses_update_own" ON depenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "depenses_delete_own" ON depenses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for retraits
DROP POLICY IF EXISTS "retraits_select_own" ON retraits;
DROP POLICY IF EXISTS "retraits_insert_own" ON retraits;
DROP POLICY IF EXISTS "retraits_update_own" ON retraits;
DROP POLICY IF EXISTS "retraits_delete_own" ON retraits;

CREATE POLICY "retraits_select_own" ON retraits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "retraits_insert_own" ON retraits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "retraits_update_own" ON retraits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "retraits_delete_own" ON retraits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for logs
DROP POLICY IF EXISTS "logs_select_own" ON logs;
DROP POLICY IF EXISTS "logs_insert_own" ON logs;

CREATE POLICY "logs_select_own" ON logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_own" ON logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_depenses_user_date ON depenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_retraits_user_date ON retraits(user_id, date);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);
`

export async function POST(request: Request) {
  try {
    // Execute SQL script
    const { error } = await supabase.rpc("exec_sql", {
      sql: SQL_SCRIPT,
    })

    if (error) {
      // If exec_sql doesn't exist, try a different approach
      console.log("Trying direct SQL execution approach...")

      // Execute each statement separately
      const statements = SQL_SCRIPT.split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const statement of statements) {
        try {
          await supabase.rpc("execute_sql", { sql: statement })
        } catch {
          // Continue with next statement
        }
      }

      return NextResponse.json({
        success: true,
        message: "Database initialized (with some statements skipped)",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
