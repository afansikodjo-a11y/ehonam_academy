# Ehonam Academy

Plateforme de **formations en ligne**, d'**accompagnement privé** et de **blog**, avec un back-office complet. Pensée pour le marché ouest/centre africain (prix en FCFA, paiement Mobile Money / Carte via Moneroo).

> Next.js 15 · React 19 · TypeScript · Tailwind CSS · Supabase

---

## ✨ Fonctionnalités

- **Catalogue de formations** dynamiques (programme par modules/leçons, page de vente, checkout).
- **Accompagnement privé** (offres de coaching 1-on-1) avec paiement direct.
- **Blog** avec **programmation des articles** (publication automatique à une date future).
- **Back-office** (`/admin`) : gestion des formations, accompagnements et articles (créer / modifier / publier / supprimer), sécurisé par Supabase Auth + RLS.
- **Connexion unifiée** (`/login`) pour tous les comptes + **mot de passe oublié** / réinitialisation.
- **Contact** : le formulaire envoie le message directement sur **WhatsApp**.
- **Thème clair/sombre** et identité visuelle (vert/orange + logo).

## 🧱 Stack technique

| Domaine | Techno |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS, lucide-react |
| Backend / BDD | Supabase (PostgreSQL, Auth, RLS) |
| Paiement | Moneroo (simulé côté client pour l'instant) |
| Langage | TypeScript |

## 🚀 Démarrage

### 1. Prérequis
- Node.js 18+ et npm
- Un projet [Supabase](https://supabase.com) (gratuit)

### 2. Installation
```bash
npm install
```

### 3. Variables d'environnement
Copier le modèle et renseigner les clés Supabase :
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://<projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon publique>
MONEROO_WEBHOOK_SECRET=<optionnel>
```
> `.env.local` est ignoré par git — ne jamais committer de secrets.

### 4. Base de données
Dans **Supabase → SQL Editor**, exécuter le contenu de [`supabase/schema.sql`](supabase/schema.sql).
Cela crée les tables, la sécurité (RLS) et un jeu de données initial :
`courses`, `coaching_offers`, `blog_posts`, `contacts`, `profiles`.

### 5. Compte administrateur
- Supabase → **Authentication → Users → Add user** (email + mot de passe + **Auto Confirm**).
- Le `schema.sql` marque `ehonam2000@gmail.com` comme admin ; pour un autre email, adapter la dernière requête du script.

### 6. Lancer en développement
```bash
npm run dev
```
→ http://localhost:3000

## 📜 Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le build |
| `npm run lint` | Lint |

## 🗂️ Structure

```
src/
  app/
    page.tsx                # Accueil (formations, accompagnement, blog)
    cours/[id]/             # Détail d'une formation + checkout
    blog/                   # Liste + article
    contact/                # Formulaire → WhatsApp
    login/                  # Connexion unifiée
    mot-de-passe-oublie/    # Demande de réinitialisation
    reset-password/         # Nouveau mot de passe
    admin/                  # Back-office (formations / accompagnements / blog)
    api/                    # Webhook Moneroo, contact
  components/               # Navbar, ThemeProvider, CheckoutModal, AdminTabs…
  lib/                      # Accès données Supabase (courses-db, coaching-db, blog-db, auth)
supabase/schema.sql         # Schéma + RLS + seed
```

## 🔐 Espace admin

- Se connecter via **/login** → redirection automatique vers `/admin` pour les administrateurs.
- Onglets : **Formations** · **Accompagnements** · **Blog**.
- Le blog gère la **programmation** : un article *Publié* avec une date future apparaît automatiquement le jour J.

## ☁️ Déploiement (Vercel)

1. Importer le repo dans Vercel.
2. Ajouter les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Supabase → **Authentication → URL Configuration** : ajouter l'URL de production et `https://<domaine>/reset-password` dans les *Redirect URLs*.
4. (Emails) Configurer un SMTP (ex. **Resend**) dans Supabase → Authentication → Emails.

## ⚠️ À savoir

- Le **paiement Moneroo est simulé** côté client (démo). Une intégration réelle doit créer la transaction via l'API Moneroo et accorder l'accès via le webhook serveur.
- L'accès `/admin` et les écritures sont aujourd'hui ouverts à tout compte **connecté**. Avant d'ouvrir des inscriptions publiques, restreindre aux comptes `is_admin`.
