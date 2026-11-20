-- Publicate — Patch 003: rewarded ads (watch 2 ads = earn 1 AI credit)
-- Run AFTER patch-002-platforms.sql.
--
-- Every rewarded ad view starts a server-side "ad session". The browser can only
-- claim a reward for a session it was issued, once, and only after the ad has
-- had time to play. Two claimed views add one AI credit. Daily views are capped.

-- Progress toward the next ad-earned credit (0 or 1). Read-only for users:
-- patch 001's column-level grants keep it writable by the service role only.
alter table public.profiles
  add column if not exists ad_views_progress int not null default 0;

create table if not exists public.ad_reward_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

create index if not exists ad_reward_sessions_user_created_idx
  on public.ad_reward_sessions (user_id, created_at desc);

-- Only Netlify functions (service role) touch this table.
alter table public.ad_reward_sessions enable row level security;
revoke all on public.ad_reward_sessions from anon, authenticated;

-- Atomically claim one rewarded ad view.
-- Returns json: { ok, reason?, progress, credits, credit_granted }
create or replace function public.claim_ad_reward(
  uid uuid,
  sid uuid,
  min_seconds int default 5,
  daily_cap int default 20
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  sess public.ad_reward_sessions;
  claimed_today int;
  new_progress int;
  new_credits int;
  granted boolean := false;
begin
  -- Lock the user's profile row so parallel claims are serialised.
  perform 1 from public.profiles where id = uid for update;

  select * into sess from public.ad_reward_sessions
   where id = sid and user_id = uid
   for update;

  if sess.id is null then
    return json_build_object('ok', false, 'reason', 'unknown_session');
  end if;
  if sess.claimed_at is not null then
    return json_build_object('ok', false, 'reason', 'already_claimed');
  end if;
  if now() - sess.created_at < make_interval(secs => min_seconds) then
    return json_build_object('ok', false, 'reason', 'too_fast');
  end if;
  if now() - sess.created_at > interval '1 hour' then
    return json_build_object('ok', false, 'reason', 'expired');
  end if;

  select count(*) into claimed_today from public.ad_reward_sessions
   where user_id = uid and claimed_at > now() - interval '24 hours';
  if claimed_today >= daily_cap then
    return json_build_object('ok', false, 'reason', 'daily_cap');
  end if;

  update public.ad_reward_sessions set claimed_at = now() where id = sid;

  update public.profiles
     set ad_views_progress = ad_views_progress + 1
   where id = uid
  returning ad_views_progress, ai_credits into new_progress, new_credits;

  if new_progress >= 2 then
    update public.profiles
       set ad_views_progress = 0,
           ai_credits = ai_credits + 1
     where id = uid
    returning ad_views_progress, ai_credits into new_progress, new_credits;
    granted := true;
  end if;

  return json_build_object(
    'ok', true,
    'progress', new_progress,
    'credits', new_credits,
    'credit_granted', granted
  );
end;
$$;

revoke execute on function public.claim_ad_reward(uuid, uuid, int, int) from public, anon, authenticated;
