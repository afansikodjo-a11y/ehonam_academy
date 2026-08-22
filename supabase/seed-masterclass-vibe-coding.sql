-- ════════════════════════════════════════════════════════════════
-- Masterclass Vibe Coding — enregistrement du programme vendable.
-- À exécuter UNE FOIS dans Supabase → SQL Editor.
--
-- Pourquoi c'est nécessaire :
-- Le paiement (/api/checkout) lit le PRIX directement en base, dans la
-- table public.courses, filtrée par la RLS « published = true ». Sans
-- cette ligne, le bouton « Je veux créer mon application » renverra
-- « Article introuvable ».
-- ════════════════════════════════════════════════════════════════

insert into public.courses
  (id, title, description, price, price_numeric, original_price, original_price_numeric,
   duration, students, rating, category, tag, gradient, border_color, chapters, published,
   show_duration, show_lessons, image)
values
(
  $$masterclass-vibe-coding$$,
  $$Masterclass Vibe Coding$$,
  $$Transformez votre idée en véritable application web grâce à l'intelligence artificielle, même si vous ne savez pas coder — la méthode Vibe Coding pour entrepreneurs et porteurs de projets non techniques.$$,
  $$7 500 FCFA$$, 7500, $$25 000 FCFA$$, 25000,
  $$Accès à vie$$, $$0$$, 5.0, $$Développement$$, $$Nouveau$$,
  $$from-emerald-600/20 to-orange-600/20$$, $$group-hover:border-emerald-500/50$$,
  $$[
    {"title":"Clarifier et structurer son idée","lessons":[
      {"title":"Clarifier le problème que vous voulez résoudre","duration":"—"},
      {"title":"Définir les fonctionnalités essentielles de votre application","duration":"—"},
      {"title":"Éviter les erreurs de cadrage qui bloquent la plupart des projets","duration":"—"}]},
    {"title":"Du cahier des charges au prompt","lessons":[
      {"title":"Transformer une idée en cahier des charges exploitable par l'IA","duration":"—"},
      {"title":"La structure d'un prompt qui fonctionne","duration":"—"},
      {"title":"Comment itérer et corriger le tir avec l'IA","duration":"—"}]},
    {"title":"Construire son application avec le Vibe Coding","lessons":[
      {"title":"Générer les interfaces de votre application avec l'IA","duration":"—"},
      {"title":"Construire étape par étape, sans tout faire d'un coup","duration":"—"},
      {"title":"Garder le contrôle sur ce que l'IA construit pour vous","duration":"—"}]},
    {"title":"Données et fonctionnalités intelligentes","lessons":[
      {"title":"Connecter votre application à une base de données avec l'IA","duration":"—"},
      {"title":"Ajouter des comptes utilisateurs et des permissions","duration":"—"},
      {"title":"Intégrer des fonctionnalités avancées avec l'aide de l'IA","duration":"—"}]},
    {"title":"Débogage, mise en ligne et monétisation","lessons":[
      {"title":"Comprendre et transmettre une erreur à l'IA","duration":"—"},
      {"title":"Déployer votre application en ligne","duration":"—"},
      {"title":"Les pistes pour transformer votre application en opportunité business","duration":"—"}]}
  ]$$::jsonb,
  true, false, false, $$$$
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
  show_duration          = excluded.show_duration,
  show_lessons           = excluded.show_lessons;
