-- ════════════════════════════════════════════════════════════════
-- Ehonam Academy — schéma Supabase
-- À exécuter dans Supabase → SQL Editor (une seule fois).
-- ════════════════════════════════════════════════════════════════

-- ─── Table des formations ───────────────────────────────────────
create table if not exists public.courses (
  id            text primary key,
  title         text not null,
  description   text not null default '',
  price         text not null default '',
  price_numeric integer not null default 0,
  original_price text not null default '',
  duration      text not null default '',
  students      text not null default '0',
  rating        numeric not null default 5,
  category      text not null default '',
  tag           text,
  gradient      text not null default 'from-emerald-600/20 to-teal-600/20',
  border_color  text not null default 'group-hover:border-emerald-500/50',
  chapters      jsonb not null default '[]'::jsonb,
  published     boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.courses add column if not exists show_duration boolean not null default true;
alter table public.courses add column if not exists show_lessons boolean not null default true;

alter table public.courses enable row level security;

-- Lecture publique : tout le monde voit les formations publiées
drop policy if exists "Public read published courses" on public.courses;
create policy "Public read published courses"
  on public.courses for select
  using ( published = true );

-- Les admins connectés voient tout (y compris les brouillons)
drop policy if exists "Authenticated read all courses" on public.courses;
create policy "Authenticated read all courses"
  on public.courses for select to authenticated using ( true );

-- Écriture réservée aux admins connectés
drop policy if exists "Authenticated insert courses" on public.courses;
create policy "Authenticated insert courses"
  on public.courses for insert to authenticated with check ( true );

drop policy if exists "Authenticated update courses" on public.courses;
create policy "Authenticated update courses"
  on public.courses for update to authenticated using ( true ) with check ( true );

drop policy if exists "Authenticated delete courses" on public.courses;
create policy "Authenticated delete courses"
  on public.courses for delete to authenticated using ( true );

-- ─── Table des messages de contact (optionnelle) ────────────────
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

-- N'importe qui peut envoyer un message ; seuls les admins les lisent
drop policy if exists "Anyone can insert contact" on public.contacts;
create policy "Anyone can insert contact"
  on public.contacts for insert with check ( true );

drop policy if exists "Authenticated read contacts" on public.contacts;
create policy "Authenticated read contacts"
  on public.contacts for select to authenticated using ( true );

-- ─── Droits d'accès (GRANT) ─────────────────────────────────────
-- RLS contrôle les LIGNES ; il faut aussi accorder l'accès à la TABLE.
grant select on public.courses to anon;
grant select, insert, update, delete on public.courses to authenticated;
grant insert on public.contacts to anon;
grant select on public.contacts to authenticated;

-- ════════════════════════════════════════════════════════════════
-- SEED : tes 3 formations actuelles (idempotent)
-- ════════════════════════════════════════════════════════════════
insert into public.courses
  (id, title, description, price, price_numeric, original_price, duration, students, rating, category, tag, gradient, border_color, chapters, published)
values
(
  $$nextjs-fullstack$$,
  $$Devenir Développeur Full-Stack avec React, Next.js & Supabase$$,
  $$Apprenez à concevoir des applications web de bout en bout, de l'interface de paiement Moneroo à l'intégration d'une base de données PostgreSQL sécurisée sur Supabase.$$,
  $$45 000 FCFA$$, 45000, $$90 000 FCFA$$, $$42 heures$$, $$1,240$$, 4.9, $$Développement$$, $$Populaire$$,
  $$from-emerald-600/20 to-teal-600/20$$, $$group-hover:border-emerald-500/50$$,
  $$[
    {"title":"Introduction & Architecture","lessons":[
      {"title":"Présentation de la formation & objectifs","duration":"08:12","youtubeId":"ScMzIvxBSi4"},
      {"title":"Configuration de l'environnement Next.js 15 & Tailwind","duration":"15:45","youtubeId":"ScMzIvxBSi4"}]},
    {"title":"Le Cœur de Next.js (App Router)","lessons":[
      {"title":"Routage dynamique & Pages spéciales","duration":"24:10","youtubeId":"ScMzIvxBSi4"},
      {"title":"Server Components vs Client Components","duration":"32:15","youtubeId":"ScMzIvxBSi4"}]},
    {"title":"Base de Données & Authentification","lessons":[
      {"title":"Mise en place de Supabase Database","duration":"28:50","youtubeId":"ScMzIvxBSi4"},
      {"title":"Authentification avec Row Level Security (RLS)","duration":"35:40","youtubeId":"ScMzIvxBSi4"}]},
    {"title":"Passerelle de Paiement Moneroo","lessons":[
      {"title":"Intégration de l'API Moneroo Checkout","duration":"42:10","youtubeId":"ScMzIvxBSi4"},
      {"title":"Gestion sécurisée du Webhook de confirmation","duration":"30:15","youtubeId":"ScMzIvxBSi4"}]}
  ]$$::jsonb,
  true
),
(
  $$uiux-figma$$,
  $$Masterclass UI/UX Design : Maîtriser Figma de A à Z$$,
  $$Créez des interfaces utilisateurs sublimes et ergonomiques pour le web et le mobile grâce aux meilleures pratiques de design.$$,
  $$25 000 FCFA$$, 25000, $$50 000 FCFA$$, $$28 heures$$, $$850$$, 4.8, $$Design$$, $$Nouveau$$,
  $$from-orange-600/20 to-amber-600/20$$, $$group-hover:border-orange-500/50$$,
  $$[
    {"title":"Les Fondations de l'UI/UX","lessons":[
      {"title":"Introduction aux règles d'utilisabilité","duration":"12:15","youtubeId":"ScMzIvxBSi4"},
      {"title":"Théorie des couleurs et typographie moderne","duration":"18:40","youtubeId":"ScMzIvxBSi4"}]},
    {"title":"Maîtrise de Figma","lessons":[
      {"title":"Utilisation des Auto-Layouts complexes","duration":"35:10","youtubeId":"ScMzIvxBSi4"},
      {"title":"Composants réutilisables & Variantes","duration":"40:20","youtubeId":"ScMzIvxBSi4"}]}
  ]$$::jsonb,
  true
),
(
  $$business-afrique$$,
  $$Lancer et Réussir son Business en Ligne en Afrique$$,
  $$Stratégies concrètes de marketing digital, de e-commerce et de logistique adaptées au marché ouest et centre africain.$$,
  $$30 000 FCFA$$, 30000, $$60 000 FCFA$$, $$18 heures$$, $$1,980$$, 4.9, $$Business$$, $$Best-seller$$,
  $$from-emerald-600/20 to-teal-600/20$$, $$group-hover:border-emerald-500/50$$,
  $$[
    {"title":"Comprendre le Marché Digital Local","lessons":[
      {"title":"Opportunités et contraintes du e-commerce","duration":"15:20","youtubeId":"ScMzIvxBSi4"},
      {"title":"Ciblage publicitaire avec Facebook/TikTok","duration":"25:35","youtubeId":"ScMzIvxBSi4"}]},
    {"title":"Logistique, Livraisons & Paiements","lessons":[
      {"title":"Optimiser les livraisons à domicile","duration":"22:15","youtubeId":"ScMzIvxBSi4"},
      {"title":"Intégration de passerelle de paiement locale","duration":"19:50","youtubeId":"ScMzIvxBSi4"}]}
  ]$$::jsonb,
  true
)
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════
-- ACCOMPAGNEMENTS (coaching)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.coaching_offers (
  id            text primary key,
  title         text not null,
  tagline       text not null default '',
  description   text not null default '',
  price         text not null default '',
  price_numeric integer not null default 0,
  format        text not null default '',
  highlights    jsonb not null default '[]'::jsonb,
  popular       boolean not null default false,
  gradient      text not null default 'from-emerald-600/20 to-teal-600/20',
  published     boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.coaching_offers enable row level security;

drop policy if exists "Public read published coaching" on public.coaching_offers;
create policy "Public read published coaching"
  on public.coaching_offers for select using ( published = true );

drop policy if exists "Authenticated read all coaching" on public.coaching_offers;
create policy "Authenticated read all coaching"
  on public.coaching_offers for select to authenticated using ( true );

drop policy if exists "Authenticated insert coaching" on public.coaching_offers;
create policy "Authenticated insert coaching"
  on public.coaching_offers for insert to authenticated with check ( true );

drop policy if exists "Authenticated update coaching" on public.coaching_offers;
create policy "Authenticated update coaching"
  on public.coaching_offers for update to authenticated using ( true ) with check ( true );

drop policy if exists "Authenticated delete coaching" on public.coaching_offers;
create policy "Authenticated delete coaching"
  on public.coaching_offers for delete to authenticated using ( true );

grant select on public.coaching_offers to anon;
grant select, insert, update, delete on public.coaching_offers to authenticated;

insert into public.coaching_offers
  (id, title, tagline, description, price, price_numeric, format, highlights, popular, gradient, published)
values
(
  $$accompagnement-web-saas$$,
  $$Accompagnement Web & SaaS$$,
  $$De l'idée au produit en ligne$$,
  $$Un suivi privé pour concevoir, développer et lancer votre application ou projet SaaS, avec une feuille de route claire et des points hebdomadaires.$$,
  $$150 000 FCFA$$, 150000, $$Visio 1-on-1 · 6 séances · 3 mois$$,
  $$["Audit de votre projet & roadmap personnalisée","Architecture technique et choix des outils","Revue de code et bonnes pratiques","Support prioritaire par message entre les séances"]$$::jsonb,
  false, $$from-teal-600/20 to-emerald-600/20$$, true
),
(
  $$mentorat-trading-forex$$,
  $$Mentorat Trading & Forex$$,
  $$Trader avec rigueur et méthode$$,
  $$Un mentorat individuel centré sur la gestion des risques, le plan de trading et la discipline, basé sur des stratégies validées sur le marché du Forex.$$,
  $$120 000 FCFA$$, 120000, $$Visio 1-on-1 · 8 séances · 2 mois$$,
  $$["Construction de votre plan de trading","Gestion stricte du risque et du capital","Analyse de vos trades en direct","Suivi de votre journal de trading"]$$::jsonb,
  true, $$from-orange-600/20 to-amber-600/20$$, true
),
(
  $$coaching-reconversion-digitale$$,
  $$Coaching Reconversion Digitale$$,
  $$Lancer son business en ligne$$,
  $$Un accompagnement sur-mesure pour réussir votre transition vers le digital : positionnement, première offre et premiers clients sur le marché africain.$$,
  $$90 000 FCFA$$, 90000, $$Visio 1-on-1 · 4 séances · 1 mois$$,
  $$["Clarification de votre projet et de vos objectifs","Définition d'une offre qui se vend","Plan d'acquisition de vos premiers clients","Accountability et suivi des actions"]$$::jsonb,
  false, $$from-emerald-600/20 to-teal-600/20$$, true
)
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════
-- BLOG
-- Un article est "en ligne" si status='published' ET published_at <= now().
-- → mettre une date future = article PROGRAMMÉ (apparaît automatiquement).
-- ════════════════════════════════════════════════════════════════
create table if not exists public.blog_posts (
  id           text primary key,
  title        text not null,
  excerpt      text not null default '',
  content      text not null default '',
  category     text not null default '',
  author       text not null default 'Ehonam AFANSI',
  cover_image  text not null default '',
  gradient     text not null default 'from-emerald-600/20 to-teal-600/20',
  status       text not null default 'draft',
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

-- Lecture publique : seulement les articles publiés et dont l'heure est atteinte
drop policy if exists "Public read live posts" on public.blog_posts;
create policy "Public read live posts"
  on public.blog_posts for select
  using ( status = 'published' and published_at <= now() );

drop policy if exists "Authenticated read all posts" on public.blog_posts;
create policy "Authenticated read all posts"
  on public.blog_posts for select to authenticated using ( true );

drop policy if exists "Authenticated insert posts" on public.blog_posts;
create policy "Authenticated insert posts"
  on public.blog_posts for insert to authenticated with check ( true );

drop policy if exists "Authenticated update posts" on public.blog_posts;
create policy "Authenticated update posts"
  on public.blog_posts for update to authenticated using ( true ) with check ( true );

drop policy if exists "Authenticated delete posts" on public.blog_posts;
create policy "Authenticated delete posts"
  on public.blog_posts for delete to authenticated using ( true );

grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;

insert into public.blog_posts
  (id, title, excerpt, content, category, author, gradient, status, published_at)
values
(
  $$bienvenue-sur-ehonam-academy$$,
  $$Bienvenue sur Ehonam Academy$$,
  $$Découvrez la plateforme : formations en ligne, accompagnement privé et conseils pour réussir votre reconversion digitale.$$,
  $$Bienvenue sur Ehonam Academy !

Cette plateforme rassemble des formations à forte valeur ajoutée et un accompagnement privé pour vous aider à développer des compétences technologiques et financières.

Que vous souhaitiez devenir développeur, maîtriser le design, lancer votre business en ligne ou progresser en trading, vous trouverez ici des contenus concrets et un suivi personnalisé.

Bonne découverte, et surtout : passez à l'action !$$,
  $$Actualités$$, $$Ehonam AFANSI$$, $$from-emerald-600/20 to-teal-600/20$$, $$published$$, $$2026-06-01 09:00:00+00$$
),
(
  $$reussir-sa-reconversion-digitale$$,
  $$5 clés pour réussir sa reconversion digitale$$,
  $$La reconversion vers le digital est à la portée de tous, à condition d'avoir une méthode. Voici 5 principes essentiels.$$,
  $$La reconversion vers le digital est à la portée de tous, à condition d'avoir une méthode claire.

1. Clarifiez votre objectif : choisissez un métier précis plutôt que de vous disperser.

2. Apprenez en faisant : la pratique régulière vaut mieux que la théorie accumulée.

3. Entourez-vous : un mentor accélère votre progression et vous évite des erreurs coûteuses.

4. Construisez un portfolio : montrez ce que vous savez faire, pas seulement ce que vous avez appris.

5. Soyez régulier : la constance sur plusieurs mois fait toute la différence.

Avec de la discipline et le bon accompagnement, votre transition réussira.$$,
  $$Conseils$$, $$Ehonam AFANSI$$, $$from-orange-600/20 to-amber-600/20$$, $$published$$, $$2026-06-15 09:00:00+00$$
)
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════
-- PROFILES & RÔLES (login unifié : redirige admin → /admin, autre → /)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile"
  on public.profiles for select to authenticated using ( auth.uid() = id );

grant select on public.profiles to authenticated;

-- Crée automatiquement un profil à chaque inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $func$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$func$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Marque le compte propriétaire comme administrateur
insert into public.profiles (id, is_admin)
select id, true from auth.users where email = 'ehonam2000@gmail.com'
on conflict (id) do update set is_admin = true;

-- ════════════════════════════════════════════════════════════════
-- DURCISSEMENT RLS : écriture (et lecture des brouillons) réservée
-- aux administrateurs. La lecture publique des contenus publiés reste
-- ouverte (policies "Public read ..." définies plus haut).
-- ════════════════════════════════════════════════════════════════
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $func$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$func$;

grant execute on function public.is_admin() to anon, authenticated;

-- COURSES
drop policy if exists "Authenticated read all courses" on public.courses;
create policy "Admin read all courses" on public.courses for select to authenticated using ( public.is_admin() );
drop policy if exists "Authenticated insert courses" on public.courses;
create policy "Admin insert courses" on public.courses for insert to authenticated with check ( public.is_admin() );
drop policy if exists "Authenticated update courses" on public.courses;
create policy "Admin update courses" on public.courses for update to authenticated using ( public.is_admin() ) with check ( public.is_admin() );
drop policy if exists "Authenticated delete courses" on public.courses;
create policy "Admin delete courses" on public.courses for delete to authenticated using ( public.is_admin() );

-- COACHING
drop policy if exists "Authenticated read all coaching" on public.coaching_offers;
create policy "Admin read all coaching" on public.coaching_offers for select to authenticated using ( public.is_admin() );
drop policy if exists "Authenticated insert coaching" on public.coaching_offers;
create policy "Admin insert coaching" on public.coaching_offers for insert to authenticated with check ( public.is_admin() );
drop policy if exists "Authenticated update coaching" on public.coaching_offers;
create policy "Admin update coaching" on public.coaching_offers for update to authenticated using ( public.is_admin() ) with check ( public.is_admin() );
drop policy if exists "Authenticated delete coaching" on public.coaching_offers;
create policy "Admin delete coaching" on public.coaching_offers for delete to authenticated using ( public.is_admin() );

-- BLOG
drop policy if exists "Authenticated read all posts" on public.blog_posts;
create policy "Admin read all posts" on public.blog_posts for select to authenticated using ( public.is_admin() );
drop policy if exists "Authenticated insert posts" on public.blog_posts;
create policy "Admin insert posts" on public.blog_posts for insert to authenticated with check ( public.is_admin() );
drop policy if exists "Authenticated update posts" on public.blog_posts;
create policy "Admin update posts" on public.blog_posts for update to authenticated using ( public.is_admin() ) with check ( public.is_admin() );
drop policy if exists "Authenticated delete posts" on public.blog_posts;
create policy "Admin delete posts" on public.blog_posts for delete to authenticated using ( public.is_admin() );

-- CONTACTS (lecture réservée aux admins)
drop policy if exists "Authenticated read contacts" on public.contacts;
create policy "Admin read contacts" on public.contacts for select to authenticated using ( public.is_admin() );

-- ════════════════════════════════════════════════════════════════
-- ACHATS (espace étudiant : chaque utilisateur ne voit que SES achats)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.purchases (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_type  text not null check (item_type in ('course','coaching')),
  item_id    text not null,
  title      text not null default '',
  price      text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

alter table public.purchases enable row level security;

-- Un utilisateur lit ses propres achats ; l'admin voit tout
drop policy if exists "Users read own purchases" on public.purchases;
create policy "Users read own purchases"
  on public.purchases for select to authenticated
  using ( auth.uid() = user_id or public.is_admin() );

-- Un utilisateur n'enregistre que SES achats
drop policy if exists "Users insert own purchases" on public.purchases;
create policy "Users insert own purchases"
  on public.purchases for insert to authenticated
  with check ( auth.uid() = user_id );

-- L'admin peut corriger / retirer un accès
drop policy if exists "Admin update purchases" on public.purchases;
create policy "Admin update purchases"
  on public.purchases for update to authenticated
  using ( public.is_admin() ) with check ( public.is_admin() );
drop policy if exists "Admin delete purchases" on public.purchases;
create policy "Admin delete purchases"
  on public.purchases for delete to authenticated
  using ( public.is_admin() );

grant select, insert, update, delete on public.purchases to authenticated;
