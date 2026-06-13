-- ============================================================
-- Migration optionnelle si vous aviez déjà exécuté une ancienne
-- version du schéma avant le passage à GeniusPay et à la limite
-- quiz unique pour le plan gratuit.
-- ============================================================

create extension if not exists pgcrypto;

-- Paiements : ajouter la colonne de transaction GeniusPay
alter table public.payments
  add column if not exists geniuspay_transaction_id text;

create unique index if not exists payments_geniuspay_transaction_id_key
  on public.payments(geniuspay_transaction_id)
  where geniuspay_transaction_id is not null;

-- Si l'ancienne colonne existe encore, on la laisse en place pour audit,
-- mais le backend n'écrit plus dedans.

-- Fonction robuste de protection du plan
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

-- Limite quiz : 1 seul quiz au total pour gratuit
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