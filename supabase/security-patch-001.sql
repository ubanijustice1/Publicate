-- Publicate — Security patch 001
-- Run this in the Supabase SQL Editor AFTER schema.sql.
--
-- Fixes:
--  1. CRITICAL: users could update their own ai_credits / plan via the REST API
--     (the RLS update policy allowed all columns). Column-level grants now limit
--     what the `authenticated` role can write; billing fields are service-role only.
--  2. Credit deduction was read-then-write (race condition: parallel requests could
--     spend one credit many times). consume_ai_credit() decrements atomically.

-- ============================================================
-- 1. Column-level write protection on profiles
-- ============================================================
revoke update on public.profiles from authenticated;
grant update (full_name, business_name, niche, phone, avatar_url, onboarded)
  on public.profiles to authenticated;

-- Belt-and-braces: also block inserts that set privileged fields to arbitrary values.
revoke insert on public.profiles from authenticated;
grant insert (id, full_name, business_name, niche, phone, avatar_url, onboarded)
  on public.profiles to authenticated;

-- ============================================================
-- 2. Atomic AI credit consumption
-- ============================================================
create or replace function public.consume_ai_credit(uid uuid)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  remaining int;
begin
  update public.profiles
     set ai_credits = ai_credits - 1
   where id = uid
     and ai_credits > 0
  returning ai_credits into remaining;

  if remaining is null then
    return -1; -- no credits left (or no such profile)
  end if;

  return remaining;
end;
$$;

-- Only the service role (Netlify functions) may call it.
revoke execute on function public.consume_ai_credit(uuid) from public, anon, authenticated;
