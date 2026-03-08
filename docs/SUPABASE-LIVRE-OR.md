# Supabase — Correspondance (commentaires)

## 1. Créer la table et les politiques RLS

1. Va sur [supabase.com](https://supabase.com) → ton projet **carnets-addis-abeba**
2. Menu gauche : **SQL Editor** → **New query**
3. Copie-colle le contenu de `supabase/migrations/001_comments.sql`
4. Clique sur **Run** (ou Cmd+Enter)

La table `comments` et les politiques RLS sont créées.

## 2. Variables d'environnement

Les variables sont dans `.env.local` (déjà configuré avec ton projet) :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Pour Vercel/production : ajoute ces variables dans les paramètres du projet.

## 3. Commentaires et modération

Les commentaires sont **publiés directement** (pas de modération obligatoire). Si tu dois masquer un message :
1. Supabase → **Table Editor** → **comments**
2. Clique sur la ligne → décoche **approved** → Save

**Pour les réponses de Claire :** coche **is_claire** sur ses messages pour le badge et le style.

---

## 4. Notification email à Claire (optionnel)

À chaque nouveau commentaire, Claire peut recevoir un email de notification.

### Prérequis

1. **[Resend](https://resend.com)** : crée un compte, vérifie ton domaine (ou utilise `onboarding@resend.dev` pour les tests), récupère une API key.
2. Variables d'environnement sur **Vercel** :
   - `RESEND_API_KEY` — clé API Resend
   - `CLAIRE_EMAIL` — email de Claire (ex. `claire.stellio@gmail.com`)
   - `COMMENT_WEBHOOK_SECRET` (optionnel) — secret partagé pour sécuriser le webhook
   - `RESEND_FROM` (optionnel) — expéditeur, ex. `Carnets <noreply@tondomaine.com>`

### Option A : Dashboard Supabase (recommandé)

1. Supabase → **Database** → **Webhooks** → **Create a new hook**
2. Nom : `comment-notify`
3. Table : `public.comments`
4. Events : cocher **Insert**
5. Type : **HTTP Request**
6. URL : `https://carnets-addis-abeba.vercel.app/api/comment-notify`
7. Headers : ajouter `Authorization: Bearer TON_COMMENT_WEBHOOK_SECRET` (si tu as configuré `COMMENT_WEBHOOK_SECRET`)
8. Create webhook

### Option B : Migration SQL (trigger pg_net)

Exécute `supabase/migrations/002_comment_webhook.sql` dans le SQL Editor. Le trigger appelle l’API à chaque INSERT sur `comments`.

Pour ajouter le secret (recommandé en prod) :
```sql
ALTER DATABASE postgres SET app.comment_webhook_secret = 'ton-secret';
```
