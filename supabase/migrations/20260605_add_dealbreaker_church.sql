alter table public.preferences
  add column if not exists dealbreaker_church text default '';
