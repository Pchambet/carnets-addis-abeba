# Supabase — Correspondance (livre d'or)

Projet Supabase `carnets-addis-abeba` (offre gratuite, région eu-west-1). Une seule table : `public.comments`.

## Comment ça marche

1. Le formulaire d'une lettre insère un commentaire avec la clé publique (anon) : `letter_id`, `parent_id`, `author`, `email` (optionnel), `content`. Rien d'autre n'est modifiable depuis le navigateur : `is_claire` vaut `false` et `approved` vaut `true` par défaut.
2. Le site relit les commentaires approuvés **sans la colonne `email`**, qui n'est jamais lisible depuis le navigateur.
3. Le webhook `comment-notify` (Database → Webhooks) appelle `https://carnets-addis-abeba.vercel.app/api/comment-notify/` (**avec le slash final**, sinon redirection 308 non suivie) en envoyant le secret dans l'en-tête `Authorization`. La route envoie un email à Claire via Resend.
4. Un cron Vercel quotidien (`vercel.json` → `/api/keep-alive/`) fait une lecture légère pour que le projet gratuit ne soit plus mis en pause pour inactivité (c'était arrivé en 2026 : livre d'or hors service).

## Migrations (`supabase/migrations/`)

| Fichier | Contenu |
|---|---|
| `001_comments.sql` | Table, index, RLS |
| `002_comment_webhook.sql` | Alternative pg_net (non utilisée en prod : le webhook a été créé depuis le Dashboard) |
| `003_approved_by_default.sql` | Publication directe |
| `004_harden_comments.sql` | Droits par colonne (email illisible, `is_claire`/`approved` non modifiables), longueurs bornées, URL du webhook corrigée |

À appliquer dans l'ordre (SQL Editor, ou MCP Supabase).

## Variables d'environnement (Vercel)

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accès public à la table |
| `RESEND_API_KEY` | Envoi des emails |
| `CLAIRE_EMAIL` | Destinataire des notifications |
| `COMMENT_WEBHOOK_SECRET` | **Obligatoire** : même valeur que l'en-tête `Authorization` du webhook ; sans lui la route répond 401 |
| `RESEND_FROM` | Optionnel. Sans domaine vérifié chez Resend, l'expéditeur `onboarding@resend.dev` ne livre **qu'à l'adresse du compte Resend** : `CLAIRE_EMAIL` doit alors être cette adresse |

## Modération

- Masquer un message : Table Editor → `comments` → décocher `approved`.
- Réponse de Claire : l'écrire depuis le site puis cocher `is_claire` sur sa ligne (badge et style).
