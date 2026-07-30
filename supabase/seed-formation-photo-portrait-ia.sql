-- ════════════════════════════════════════════════════════════════
-- Créer des Portraits Professionnels avec l'IA — enregistrement
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
  $$formation-photo-portrait-ia$$,
  $$Créer des Portraits Professionnels avec l'IA$$,
  $$Apprenez à créer des portraits professionnels grâce à l'intelligence artificielle — photo de profil LinkedIn, CV, réseaux sociaux, portraits artistiques et bien plus, sans appareil photo ni studio.$$,
  $$15 000 FCFA$$, 15000, $$45 000 FCFA$$, 45000,
  $$Accès à vie$$, $$0$$, 5.0, $$Photographie$$, $$Nouveau$$,
  $$from-emerald-600/20 to-orange-600/20$$, $$group-hover:border-emerald-500/50$$,
  $$[
    {"title":"L'IA et le portrait professionnel","lessons":[
      {"title":"Le potentiel de l'IA pour créer des portraits professionnels","duration":"—"},
      {"title":"Les meilleurs outils IA pour le portrait","duration":"—"},
      {"title":"Les principes d'un portrait qui inspire confiance","duration":"—"}]},
    {"title":"Maîtriser l'art du prompt portrait","lessons":[
      {"title":"Décrire une pose, une lumière et une expression avec précision","duration":"—"},
      {"title":"Garder un visage cohérent d'une génération à l'autre","duration":"—"},
      {"title":"Itérer et affiner un portrait étape par étape","duration":"—"}]},
    {"title":"Portraits professionnels & corporate","lessons":[
      {"title":"Photo de profil LinkedIn et CV qui inspire confiance","duration":"—"},
      {"title":"Portraits d'équipe et trombinoscopes d'entreprise","duration":"—"},
      {"title":"Portraits pour entrepreneurs et indépendants","duration":"—"}]},
    {"title":"Portraits réseaux sociaux & créatifs","lessons":[
      {"title":"Photo de profil Instagram, Facebook et TikTok","duration":"—"},
      {"title":"Portraits artistiques, mode et éditorial","duration":"—"},
      {"title":"Avatars et identités visuelles personnalisées","duration":"—"}]},
    {"title":"Retouche, restauration & compétence","lessons":[
      {"title":"Améliorer et restaurer d'anciennes photos avec l'IA","duration":"—"},
      {"title":"Corriger les détails et augmenter la qualité d'un portrait","duration":"—"},
      {"title":"Constituer un portfolio et vendre des séances de portraits IA","duration":"—"}]}
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
