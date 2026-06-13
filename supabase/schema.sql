-- ============================================================
-- EMPLOI CONCOURS CI — Schéma Supabase
-- À exécuter dans : Supabase Dashboard → SQL Editor
--
-- Sécurité :
--   • RLS activé sur TOUTES les tables
--   • Le frontend (clé anon) ne voit que ce qui est public
--   • Chaque utilisateur ne lit/modifie QUE ses propres données
--   • Le collecteur et les webhooks utilisent service_role
--     (qui bypasse RLS, uniquement côté serveur)
-- ============================================================

-- Nécessaire pour gen_random_uuid() sur certaines installations Postgres.
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. PROFILS UTILISATEURS
--    Lié à auth.users (authentification Supabase native).
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text,
  plan text not null default 'gratuit' check (plan in ('gratuit', 'premium')),
  plan_expiry date,
  alert_type text not null default 'les_deux' check (alert_type in ('emploi', 'concours', 'les_deux')),
  alert_email boolean not null default true,
  preferred_sectors text[] not null default '{}',
  preferred_level text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Un utilisateur ne voit QUE son propre profil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Un utilisateur ne modifie QUE son propre profil
-- (le plan et plan_expiry sont protégés par trigger ci-dessous :
--  seuls les webhooks serveur peuvent les changer)
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- SÉCURITÉ : empêcher un client (anon/authenticated) de
-- s'auto-attribuer le plan premium. Seul service_role peut
-- modifier plan / plan_expiry (validation paiement via webhook).
create or replace function public.protect_plan_columns()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  jwt_claims jsonb;
  jwt_role text;
begin
  jwt_claims := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
  jwt_role := coalesce(jwt_claims->>'role', '');

  if jwt_role is distinct from 'service_role' then
    new.plan := old.plan;
    new.plan_expiry := old.plan_expiry;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_plan on public.profiles;
create trigger protect_plan
  before update on public.profiles
  for each row execute function public.protect_plan_columns();

-- ------------------------------------------------------------
-- 2. ANNONCES (offres d'emploi + concours)
--    Alimentée par le collecteur (service_role).
--    Lecture publique (la consultation des offres est gratuite).
-- ------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  hash text not null unique,                 -- SHA-256 (titre normalisé + URL) → déduplication
  title text not null,
  type text not null check (type in ('emploi', 'concours')),
  sector text not null default 'Autre',
  ministry text default '',
  company text default '',
  location text default '',
  level text default '',
  contract_type text default '',
  work_mode text default 'Sur site' check (work_mode in ('Sur site', 'Télétravail', 'Hybride')),
  experience text default '',
  description text default '',
  excerpt text default '',
  application_email text default '',
  application_phone text default '',
  source_id text not null,
  source_name text not null,
  source_url text not null,
  link text default '',
  status text not null default 'Ouvert' check (status in ('Ouvert', 'Fermé', 'Bientôt', 'En cours')),
  deadline date,
  published_at timestamptz,
  collected_at timestamptz not null default now()
);

create index if not exists listings_type_idx on public.listings(type);
create index if not exists listings_sector_idx on public.listings(sector);
create index if not exists listings_collected_idx on public.listings(collected_at desc);

alter table public.listings enable row level security;

-- Lecture publique : tout le monde (même non connecté) peut consulter
create policy "listings_select_public"
  on public.listings for select
  using (true);

-- Aucune policy insert/update/delete pour anon/authenticated :
-- seul le collecteur (service_role) écrit dans cette table.

-- ------------------------------------------------------------
-- 3. FAVORIS (offres sauvegardées par les candidats)
-- ------------------------------------------------------------
create table if not exists public.saved_listings (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.saved_listings enable row level security;

-- Chaque utilisateur ne gère QUE ses propres favoris
create policy "saved_select_own"
  on public.saved_listings for select
  using (auth.uid() = user_id);

create policy "saved_insert_own"
  on public.saved_listings for insert
  with check (auth.uid() = user_id);

create policy "saved_delete_own"
  on public.saved_listings for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. UTILISATION DES QUIZ (limite 1 seul quiz pour le plan gratuit)
-- ------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null,
  attempt_date date not null default current_date,
  score int,
  created_at timestamptz not null default now(),
  unique (user_id, quiz_id, attempt_date)
);

create index if not exists quiz_attempts_user_date_idx
  on public.quiz_attempts(user_id, attempt_date);

alter table public.quiz_attempts enable row level security;

create policy "quiz_select_own"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "quiz_insert_own"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- La règle « 1 seul quiz au total si gratuit » est appliquée côté base :
create or replace function public.enforce_quiz_free_limit()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  user_plan text;
  total_count int;
begin
  select plan into user_plan from public.profiles where id = new.user_id;

  if user_plan = 'gratuit' then
    select count(distinct quiz_id) into total_count
    from public.quiz_attempts
    where user_id = new.user_id
      and quiz_id <> new.quiz_id;

    if total_count >= 1 then
      raise exception 'QUIZ_FREE_LIMIT';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists quiz_daily_limit on public.quiz_attempts;
drop trigger if exists quiz_free_limit on public.quiz_attempts;
create trigger quiz_free_limit
  before insert on public.quiz_attempts
  for each row execute function public.enforce_quiz_free_limit();

-- ------------------------------------------------------------
-- 5. PAIEMENTS (abonnements + achats de sujets)
--    Écrits UNIQUEMENT par le webhook GeniusPay (service_role)
--    après vérification de signature.
-- ------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  geniuspay_transaction_id text not null unique,
  kind text not null check (kind in ('abonnement', 'sujet')),
  reference text not null,                  -- 'premium' ou l'id du sujet
  amount_fcfa int not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'refused')),
  raw_payload jsonb,                        -- payload webhook (audit)
  created_at timestamptz not null default now(),
  validated_at timestamptz
);

alter table public.payments enable row level security;

-- L'utilisateur peut consulter SON historique de paiements
create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = user_id);

-- Aucune policy insert/update pour les clients :
-- seul le webhook serveur (service_role) écrit ici.
-- ⚠ JAMAIS de confirmation de paiement initiée par le client.

-- ------------------------------------------------------------
-- 6. SUJETS ACHETÉS (accès aux PDF)
-- ------------------------------------------------------------
create table if not exists public.purchased_papers (
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_id text not null,
  payment_id uuid references public.payments(id),
  purchased_at timestamptz not null default now(),
  primary key (user_id, paper_id)
);

alter table public.purchased_papers enable row level security;

create policy "papers_select_own"
  on public.purchased_papers for select
  using (auth.uid() = user_id);
-- Insertion : service_role uniquement (après paiement validé).

-- ------------------------------------------------------------
-- 7. JOURNAL DU COLLECTEUR
--    Écrit par service_role. Lecture interdite aux clients.
-- ------------------------------------------------------------
create table if not exists public.scrape_logs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null,
  finished_at timestamptz,
  duration_ms int,
  totals jsonb,            -- { found, new, skipped, emploi, concours }
  sources jsonb,           -- détail par source
  emails jsonb,            -- { sent, recipients }
  errors jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.scrape_logs enable row level security;
-- Aucune policy → invisible pour anon/authenticated.
-- service_role seul y accède (bypass RLS).

-- ------------------------------------------------------------
-- 8. MESSAGES DE CONTACT (formulaire « Nous contacter »)
-- ------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text default '',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- N'importe qui peut envoyer un message (insert), personne ne peut lire
-- (le support lit via le dashboard / service_role).
create policy "contact_insert_any"
  on public.contact_messages for insert
  with check (
    char_length(name) between 1 and 120
    and char_length(message) between 1 and 5000
  );
