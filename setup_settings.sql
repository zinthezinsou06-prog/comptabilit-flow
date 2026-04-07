-- Table des paramètres utilisateurs
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT '€' NOT NULL,
  export_header TEXT DEFAULT 'Mon Entreprise - Export Financier',
  export_footer TEXT DEFAULT 'Généré par Comptabilité Flow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres paramètres
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres paramètres
CREATE POLICY "Users can insert their own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres paramètres
CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);
