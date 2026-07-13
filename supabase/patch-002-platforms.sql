-- Publicate — Patch 002: user-selectable platforms
-- Run AFTER security-patch-001.sql.
--
-- Adds a per-user platform list (add/remove LinkedIn, Threads, Pinterest,
-- Telegram, Snapchat, etc.) and widens the posts.platform whitelist to match.

-- Per-user enabled platforms (defaults to the original six).
alter table public.profiles
  add column if not exists platforms text[] not null
  default array['instagram','facebook','tiktok','youtube','x','whatsapp'];

-- Users may edit their own platform list (column grants are additive to patch 001).
grant update (platforms) on public.profiles to authenticated;

-- Widen the allowed platforms on posts.
alter table public.posts drop constraint if exists posts_platform_check;
alter table public.posts add constraint posts_platform_check
  check (platform in (
    'instagram','facebook','tiktok','youtube','x','whatsapp',
    'linkedin','threads','pinterest','telegram','snapchat'
  ));
