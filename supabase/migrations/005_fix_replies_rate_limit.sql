-- Livre d'or — correctifs (2026-10-19)
-- 1. Réponses : dans la sous-requête de 004, « parent_id » désignait p.parent_id (la colonne
--    de p, pas celle de la nouvelle ligne) : la condition n'était jamais vraie et toute
--    réponse était refusée (« new row violates row-level security policy »).
-- 2. Anti-inondation : au plus 10 messages par heure et 40 par jour sur tout le site
--    (5 messages en 7 mois jusqu'ici). Chaque message envoie un email à Claire.

DROP POLICY IF EXISTS "comments_insert_anon" ON public.comments;
CREATE POLICY "comments_insert_anon"
  ON public.comments FOR INSERT
  WITH CHECK (
    char_length(btrim(author)) BETWEEN 1 AND 80
    AND char_length(btrim(content)) BETWEEN 1 AND 5000
    AND (email IS NULL OR char_length(email) <= 254)
    AND letter_id ~ '^semaine-[0-9]{2}(-[0-9]{2})?$'
    AND (
      parent_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.comments p
        WHERE p.id = comments.parent_id AND p.letter_id = comments.letter_id
      )
    )
  );

-- SECURITY DEFINER : compter aussi les messages non approuvés, invisibles pour anon
CREATE OR REPLACE FUNCTION public.comments_rate_limit()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
BEGIN
  IF (SELECT count(*) FROM public.comments WHERE created_at > now() - interval '1 hour') >= 10
     OR (SELECT count(*) FROM public.comments WHERE created_at > now() - interval '1 day') >= 40
  THEN
    RAISE EXCEPTION 'comments_rate_limited' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.comments_rate_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS comments_rate_limit ON public.comments;
CREATE TRIGGER comments_rate_limit
  BEFORE INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.comments_rate_limit();
