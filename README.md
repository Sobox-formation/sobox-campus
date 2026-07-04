# SOBOX Campus

🌐 **En ligne : https://sobox-campus.vercel.app**

Espace d'apprentissage et d'évaluation SOBOX — parcours de formation, supports,
quiz de validation, questionnaires soft skills et accompagnement.

Application **Next.js 16** (App Router, TypeScript, Tailwind CSS) branchée sur
**Supabase** (authentification, base PostgreSQL avec RLS, Edge Functions).

## Fonctionnalités

- **Authentification** apprenant (e-mail / mot de passe)
- **Mon parcours** : frise dynamique du parcours, déblocage progressif des étapes
- **Ma Box & ressources** : supports débloqués au fil de la progression
- **Mes évaluations** : quiz de validation (correction côté serveur via Edge Function),
  réussir un quiz débloque le module suivant
- **Tests & soft skills** : catalogue de questionnaires + restitution des résultats
  (DISC, assertivité…)

## Développement local

Prérequis : Node.js 20+.

```bash
npm install
cp .env.example .env.local   # les valeurs Supabase sont déjà renseignées
npm run dev                  # http://localhost:3000
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publishable Supabase (publique) |

## Déploiement (Vercel)

1. Pousser ce dépôt sur GitHub (organisation **Sobox**).
2. Sur [vercel.com](https://vercel.com) : **Add New… → Project** → importer le dépôt.
   Vercel détecte Next.js automatiquement.
3. Renseigner les deux variables d'environnement ci-dessus.
4. **Deploy**.
5. Dans Supabase → **Authentication → URL Configuration**, ajouter l'URL Vercel
   comme *Site URL* / *Redirect URL*.

## Architecture

- `src/app/(app)/` — pages authentifiées (layout partagé + barre latérale)
- `src/lib/` — accès aux données Supabase (parcours, quiz, soft skills)
- `src/components/` — composants d'interface (frise, lecteur de quiz, barre latérale)
