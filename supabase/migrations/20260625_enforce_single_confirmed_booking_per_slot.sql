create unique index if not exists bookings_one_confirmed_per_slot_idx
on public.bookings (slot_id)
where status = 'confirmed';
