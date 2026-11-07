begin;
alter table public.perfumes
  add column if not exists top_notes text[],
  add column if not exists heart_notes text[],
  add column if not exists base_notes text[],
  add column if not exists main_notes text[],
  add column if not exists source_url text,
  add column if not exists source_name text,
  add column if not exists image_source_url text,
  add column if not exists source_checked_at timestamptz,
  add column if not exists source_details jsonb;
commit;
