-- Webhook : notification email à Claire pour chaque nouveau commentaire
-- Alternative : créer le webhook depuis le Dashboard Supabase (Database → Webhooks)
-- Ce script utilise pg_net pour appeler l'API Next.js.

-- Activer l'extension pg_net (déjà activée sur la plupart des projets Supabase)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Fonction appelée par le trigger
CREATE OR REPLACE FUNCTION public.notify_comment_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url text := 'https://carnets-addis-abeba.vercel.app/api/comment-notify';
  payload jsonb;
  headers jsonb := '{"Content-Type": "application/json"}'::jsonb;
BEGIN
  -- Optionnel : ajouter le secret si configuré (Supabase → Settings → Database)
  -- ALTER DATABASE postgres SET app.comment_webhook_secret = 'ton-secret';
  IF current_setting('app.comment_webhook_secret', true) IS NOT NULL AND current_setting('app.comment_webhook_secret', true) != '' THEN
    headers := headers || jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.comment_webhook_secret', true));
  END IF;

  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'comments',
    'schema', 'public',
    'record', to_jsonb(NEW),
    'old_record', null
  );

  PERFORM net.http_post(
    url := webhook_url,
    body := payload,
    params := '{}'::jsonb,
    headers := headers
  );

  RETURN NEW;
END;
$$;

-- Trigger sur INSERT
DROP TRIGGER IF EXISTS comment_notify_trigger ON public.comments;
CREATE TRIGGER comment_notify_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_insert();
