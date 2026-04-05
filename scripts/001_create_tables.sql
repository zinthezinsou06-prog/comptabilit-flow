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
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE depenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE retraits ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "categories_select_own" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert_own" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update_own" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete_own" ON categories FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for depenses
CREATE POLICY "depenses_select_own" ON depenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "depenses_insert_own" ON depenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "depenses_update_own" ON depenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "depenses_delete_own" ON depenses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for retraits
CREATE POLICY "retraits_select_own" ON retraits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "retraits_insert_own" ON retraits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "retraits_update_own" ON retraits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "retraits_delete_own" ON retraits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for logs
CREATE POLICY "logs_select_own" ON logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_own" ON logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_depenses_user_date ON depenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_retraits_user_date ON retraits(user_id, date);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id);
