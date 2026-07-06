-- Publicate — Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists pgcrypto;

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  business_name text,
  niche text,
  phone text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'business', 'agency')),
  ai_credits int not null default 20,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are editable by owner" on public.profiles
  for update using (auth.uid() = id);
create policy "Profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, ai_credits)
  values (new.id, new.raw_user_meta_data->>'full_name', 20);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- posts (content calendar)
-- ============================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook', 'tiktok', 'youtube', 'x', 'whatsapp')),
  title text,
  content text,
  hashtags text,
  hook text,
  cta text,
  media_url text,
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'published')),
  score int,
  score_breakdown jsonb,
  scheduled_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_user_scheduled_idx on public.posts (user_id, scheduled_at);

alter table public.posts enable row level security;

create policy "Posts are viewable by owner" on public.posts
  for select using (auth.uid() = user_id);
create policy "Posts are insertable by owner" on public.posts
  for insert with check (auth.uid() = user_id);
create policy "Posts are editable by owner" on public.posts
  for update using (auth.uid() = user_id);
create policy "Posts are deletable by owner" on public.posts
  for delete using (auth.uid() = user_id);

-- ============================================================
-- ai_generations (log of caption / score / trend calls, for credit tracking)
-- ============================================================
create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('caption', 'score', 'trend')),
  input jsonb,
  output jsonb,
  created_at timestamptz not null default now()
);

alter table public.ai_generations enable row level security;

create policy "Generations are viewable by owner" on public.ai_generations
  for select using (auth.uid() = user_id);
create policy "Generations are insertable by owner" on public.ai_generations
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- media_kits
-- ============================================================
create table if not exists public.media_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media_kits enable row level security;

create policy "Media kits are viewable by owner" on public.media_kits
  for select using (auth.uid() = user_id);
create policy "Media kits are insertable by owner" on public.media_kits
  for insert with check (auth.uid() = user_id);
create policy "Media kits are editable by owner" on public.media_kits
  for update using (auth.uid() = user_id);

-- ============================================================
-- monetization_progress
-- ============================================================
create table if not exists public.monetization_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('x', 'facebook', 'youtube')),
  item_key text not null,
  is_done boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, platform, item_key)
);

alter table public.monetization_progress enable row level security;

create policy "Monetization progress viewable by owner" on public.monetization_progress
  for select using (auth.uid() = user_id);
create policy "Monetization progress insertable by owner" on public.monetization_progress
  for insert with check (auth.uid() = user_id);
create policy "Monetization progress editable by owner" on public.monetization_progress
  for update using (auth.uid() = user_id);

-- ============================================================
-- subscriptions
-- ============================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('free', 'starter', 'pro', 'business', 'agency')),
  status text not null default 'active' check (status in ('active', 'inactive', 'cancelled')),
  paystack_reference text,
  paystack_customer_code text,
  amount int,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Subscriptions viewable by owner" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Note: inserts/updates to subscriptions are performed by the Netlify function
-- using the Supabase service role key (bypasses RLS) after verifying payment with Paystack.

-- ============================================================
-- updated_at helper trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at before update on public.posts
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_media_kits_updated_at on public.media_kits;
create trigger set_media_kits_updated_at before update on public.media_kits
  for each row execute procedure public.set_updated_at();
