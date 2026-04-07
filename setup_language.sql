-- Ajouter la colonne language si elle n'existe pas
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr' NOT NULL;
