-- Supabase Dashboard → SQL Editor에서 한 번 실행하세요.
create table if not exists public.study_app_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.study_app_state enable row level security;
drop policy if exists "shared study access" on public.study_app_state;
create policy "shared study access" on public.study_app_state for all to anon using (true) with check (true);
insert into public.study_app_state (id,payload) values ('shared','{"school":{},"study":{},"timers":{},"notes":{},"proofs":[],"schedules":[]}') on conflict (id) do nothing;
insert into storage.buckets (id,name,public) values ('study-proofs','study-proofs',true) on conflict (id) do nothing;
drop policy if exists "shared proof files" on storage.objects;
create policy "shared proof files" on storage.objects for all to anon using (bucket_id='study-proofs') with check (bucket_id='study-proofs');
do $$ begin alter publication supabase_realtime add table public.study_app_state; exception when duplicate_object then null; end $$;
