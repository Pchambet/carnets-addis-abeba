-- Les nouveaux commentaires sont publiés directement (approved = true par défaut)
-- Exécuter si la table existe déjà avec l'ancien défaut

ALTER TABLE public.comments ALTER COLUMN approved SET DEFAULT TRUE;

-- Optionnel : approuver tous les commentaires en attente
-- UPDATE public.comments SET approved = TRUE WHERE approved = FALSE;
