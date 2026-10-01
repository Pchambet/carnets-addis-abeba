-- Livre d'or — durcissement (2026-10-01)
-- 1. Les emails des commentateurs ne sont plus lisibles depuis le navigateur.
-- 2. Le navigateur ne peut plus fixer is_claire ni approved (valeurs par défaut imposées).
-- 3. Longueurs bornées, letter_id valide, réponse rattachée à la même lettre.
-- 4. Le webhook de notification appelle l'URL avec slash final (trailingSlash: true
--    côté Next renvoyait une redirection 308 que le webhook ne suit pas).

-- Droits par colonne : lecture sans email, insertion limitée aux champs du formulaire
REVOKE ALL ON public.comments FROM anon, authenticated;
GRANT SELECT (id, letter_id, parent_id, author, content, is_claire, approved, created_at)
  ON public.comments TO anon, authenticated;
GRANT INSERT (letter_id, parent_id, author, email, content)
  ON public.comments TO anon, authenticated;

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
        WHERE p.id = parent_id AND p.letter_id = comments.letter_id
      )
    )
  );

-- Webhook « comment-notify » (créé depuis le Dashboard, il porte le secret) :
-- on le recrée à l'identique avec l'URL corrigée, sans écrire le secret ici.
DO $$
DECLARE
  def text;
BEGIN
  SELECT pg_get_triggerdef(t.oid) INTO def
  FROM pg_trigger t
  WHERE t.tgrelid = 'public.comments'::regclass AND t.tgname = 'comment-notify';

  IF def IS NOT NULL AND position('/api/comment-notify''' IN def) > 0 THEN
    EXECUTE 'DROP TRIGGER "comment-notify" ON public.comments';
    EXECUTE replace(def, '/api/comment-notify''', '/api/comment-notify/''');
  END IF;
END $$;
