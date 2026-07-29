-- ════════════════════════════════════════════════════════════════
-- Créer des Affiches Professionnelles avec l'IA — enregistrement
-- du programme vendable.
-- À exécuter UNE FOIS dans Supabase → SQL Editor.
--
-- Pourquoi c'est nécessaire :
-- Le paiement (/api/checkout) lit le PRIX directement en base, dans la
-- table public.courses, filtrée par la RLS « published = true ». Sans
-- cette ligne, le bouton « Accéder à la formation » renverra
-- « Article introuvable ».
-- ════════════════════════════════════════════════════════════════

insert into public.courses
  (id, title, description, price, price_numeric, original_price, original_price_numeric,
   duration, students, rating, category, tag, gradient, border_color, chapters, published,
   show_duration, show_lessons, image)
values
(
  $$formation-affiche-ia$$,
  $$Créer des Affiches Professionnelles avec l'IA$$,
  $$Apprenez à créer des affiches professionnelles de différents types grâce à l'intelligence artificielle — promotions, événements, restaurants, réseaux sociaux et bien plus.$$,
  $$15 000 FCFA$$, 15000, $$45 000 FCFA$$, 45000,
  $$Accès à vie$$, $$0$$, 5.0, $$Design$$, $$Nouveau$$,
  $$from-orange-600/20 to-emerald-600/20$$, $$group-hover:border-orange-500/50$$,
  $$[
    {"title":"L'IA et la création d'affiches","lessons":[
      {"title":"Le potentiel de l'IA pour créer des affiches professionnelles","duration":"—"},
      {"title":"Les meilleurs outils IA pour la création graphique","duration":"—"},
      {"title":"Les principes d'une affiche qui capte l'attention","duration":"—"}]},
    {"title":"Maîtriser l'art du prompt visuel","lessons":[
      {"title":"La structure d'un prompt efficace pour les visuels","duration":"—"},
      {"title":"Les mots-clés qui font la différence","duration":"—"},
      {"title":"Itérer et affiner vos créations étape par étape","duration":"—"}]},
    {"title":"Affiches commerciales & promotionnelles","lessons":[
      {"title":"Affiches de promotion pour boutiques et commerces","duration":"—"},
      {"title":"Visuels publicitaires pour Facebook et Instagram","duration":"—"},
      {"title":"Affiches de soldes et offres spéciales","duration":"—"}]},
    {"title":"Affiches restaurants, événements & entreprises","lessons":[
      {"title":"Menus et affiches de restaurant","duration":"—"},
      {"title":"Affiches d'événements et flyers de formations","duration":"—"},
      {"title":"Affiches institutionnelles pour entreprises","duration":"—"}]},
    {"title":"Visuels réseaux sociaux & amélioration IA","lessons":[
      {"title":"Visuels Instagram, Facebook, TikTok et LinkedIn","duration":"—"},
      {"title":"Affiches produits et packagings","duration":"—"},
      {"title":"Retoucher et améliorer des photos existantes avec l'IA","duration":"—"}]}
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
