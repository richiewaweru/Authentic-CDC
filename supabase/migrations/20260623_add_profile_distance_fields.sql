alter table public.preferences
  add column if not exists distance_type text
    check (distance_type in ('radius', 'state', 'open'))
    default 'open',
  add column if not exists distance_radius_miles integer;

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists date_of_birth date,
  add column if not exists gender text
    check (gender in ('man', 'woman', 'prefer_not_to_say')),
  add column if not exists city_state text,
  add column if not exists bio text
    check (char_length(bio) <= 150);
