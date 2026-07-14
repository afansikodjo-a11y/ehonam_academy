-- ════════════════════════════════════════════════════════════════
-- Vibe Coding Mastery — enregistrement du programme vendable
-- À exécuter UNE FOIS dans Supabase → SQL Editor.
--
-- Pourquoi c'est nécessaire :
-- Le paiement (/api/checkout) lit le PRIX directement en base, dans la
-- table public.courses, filtrée par la RLS « published = true ». Sans
-- cette ligne, le bouton « Rejoindre le bootcamp » renverra
-- « Article introuvable ».
--
-- La ligne est publiée (published = true) pour que le checkout la trouve,
-- mais elle est masquée du catalogue de l'accueil côté application
-- (voir le filtre VIBE_COURSE_ID dans src/app/page.tsx).
-- ════════════════════════════════════════════════════════════════

insert into public.courses
  (id, title, description, price, price_numeric, original_price, original_price_numeric,
   duration, students, rating, category, tag, gradient, border_color, chapters, published,
   show_duration, show_lessons, image)
values
(
  $$vibe-coding-mastery$$,
  $$Vibe Coding Mastery$$,
  $$Le bootcamp pour concevoir et lancer vos applications et SaaS en pilotant l'IA — Antigravity, Claude Code, Gemini, Supabase, Vercel, Git & GitHub — sans écrire de code manuellement.$$,
  $$19 000 FCFA$$, 19000, $$85 000 FCFA$$, 85000,
  $$Accès à vie$$, $$320$$, 4.9, $$Développement$$, $$Nouveau$$,
  $$from-emerald-600/20 to-orange-600/20$$, $$group-hover:border-emerald-500/50$$,
  $$[
    {"title":"Fondations & Écosystème IA","lessons":[
      {"title":"Prise en main d'Antigravity pour le co-développement","duration":"—"},
      {"title":"Lancement rapide de Claude Code dans votre terminal","duration":"—"},
      {"title":"Modèles Gemini : paramètres avancés de contexte","duration":"—"}]},
    {"title":"L'Art du Prompting Structurel","lessons":[
      {"title":"Rédaction de documents de spécifications pour l'IA","duration":"—"},
      {"title":"Guidage itératif étape par étape (prompt chaining)","duration":"—"},
      {"title":"Gestion du contexte et des jetons (token management)","duration":"—"}]},
    {"title":"Débogage & Résolution Contextuelle","lessons":[
      {"title":"Lecture et transmission des logs de la console","duration":"—"},
      {"title":"Technique du « sandboxing » pour tester les modules","duration":"—"},
      {"title":"Briser les boucles d'erreurs récurrentes de l'IA","duration":"—"}]},
    {"title":"Déploiement Cloud & Supabase","lessons":[
      {"title":"Déploiement automatisé en production sur Vercel","duration":"—"},
      {"title":"Base de données SQL et authentification avec Supabase","duration":"—"},
      {"title":"Intégration et sécurisation des webhooks de paiement","duration":"—"}]}
  ]$$::jsonb,
  true, false, true, $$$$
)
on conflict (id) do update set
  title                  = excluded.title,
  description            = excluded.description,
  price                  = excluded.price,
  price_numeric          = excluded.price_numeric,
  original_price         = excluded.original_price,
  original_price_numeric = excluded.original_price_numeric,
  duration               = excluded.duration,
  tag                    = excluded.tag,
  gradient               = excluded.gradient,
  border_color           = excluded.border_color,
  chapters               = excluded.chapters,
  published              = true,
  show_duration          = excluded.show_duration;
