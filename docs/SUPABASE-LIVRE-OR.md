# Supabase — Livre d'or

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

## 3. Modérer les commentaires

Les nouveaux commentaires ont `approved = false` par défaut.

Pour les approuver :
1. Supabase → **Table Editor** → **comments**
2. Clique sur une ligne
3. Coche **approved** → Save

Pour les commentaires de Claire : coche aussi **is_claire** sur ses réponses.
