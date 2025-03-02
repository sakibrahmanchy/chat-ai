create table if not exists public.activities (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  company_id text not null,
  type text not null,
  description text not null,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint fk_company
    foreign key (company_id)
    references public.companies(id)
    on delete cascade
);

-- Create indexes for better query performance
create index if not exists activities_company_id_idx on public.activities(company_id);
create index if not exists activities_user_id_idx on public.activities(user_id);
create index if not exists activities_type_idx on public.activities(type);
create index if not exists activities_created_at_idx on public.activities(created_at desc);

-- Create a function to clean up old activities (older than 90 days)
create or replace function cleanup_old_activities()
returns void
language plpgsql
as $$
begin
  delete from public.activities
  where created_at < now() - interval '90 days';
end;
$$;

-- Create a scheduled job to run cleanup every day
select cron.schedule(
  'cleanup-old-activities',
  '0 0 * * *', -- Run at midnight every day
  'select cleanup_old_activities()'
); 