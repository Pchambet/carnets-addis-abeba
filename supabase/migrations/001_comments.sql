-- Livre d'or — Table comments
-- Exécuter dans Supabase : SQL Editor → New query → Coller ce script → Run

-- Table des commentaires
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  email TEXT,
  content TEXT NOT NULL,
  is_claire BOOLEAN DEFAULT FALSE,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes par lettre et par parent
CREATE INDEX IF NOT EXISTS idx_comments_letter_id ON public.comments(letter_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- RLS activé (Enable automatic RLS doit être coché sur le projet)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Politique : tout le monde peut lire les commentaires approuvés
CREATE POLICY "comments_select_approved"
  ON public.comments FOR SELECT
  USING (approved = TRUE);

-- Politique : tout le monde peut insérer un commentaire (sera en attente de modération)
CREATE POLICY "comments_insert_anon"
  ON public.comments FOR INSERT
  WITH CHECK (true);

-- Pas de policy UPDATE pour anon : l'approbation se fait via le dashboard
-- (Table Editor → cliquer sur une ligne → cocher "approved")
-- ou via une Edge Function avec service_role plus tard
