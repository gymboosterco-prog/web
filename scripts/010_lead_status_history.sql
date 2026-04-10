-- Lead status change history log
-- Run this in Supabase SQL Editor

create table if not exists lead_status_history (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id) on delete cascade,
  old_status  text,
  new_status  text not null,
  changed_at  timestamptz not null default now(),
  changed_by  text
);

alter table lead_status_history enable row level security;

create policy "Authenticated users can read history"
  on lead_status_history for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert history"
  on lead_status_history for insert
  with check (auth.role() = 'authenticated');

create index lead_status_history_lead_id_idx on lead_status_history(lead_id);
