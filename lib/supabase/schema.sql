-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Users table (for Clerk users)
create table public.users (
  id text primary key, -- Clerk user ID
  email text unique not null,
  first_name text,
  last_name text,
  image_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company_id uuid references public.companies(id),
  phone_number text,
  onboarding_completed boolean default false
);

-- User preferences
create table public.user_preferences (
  user_id text primary key references public.users(id) on delete cascade,
  theme text default 'light'::text,
  notifications_enabled boolean default true,
  email_notifications boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Companies table
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website text,
  industry text,
  size text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Addresses table
create table public.addresses (
  id uuid primary key default uuid_generate_v4(),
  street text,
  city text not null,
  state text not null,
  country text not null,
  postal_code text,
  company_id uuid references public.companies(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.users enable row level security;
alter table public.user_preferences enable row level security;
alter table public.companies enable row level security;
alter table public.addresses enable row level security;

-- Create policies
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

create policy "Users can view their own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can update their own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);

create policy "Users can view their own company"
  on companies for select
  using (id in (
    select company_id from users where id = auth.uid()
  ));

create policy "Users can view their company address"
  on addresses for select
  using (company_id in (
    select company_id from users where id = auth.uid()
  ));

-- Create functions for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger users_handle_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger user_preferences_handle_updated_at
  before update on public.user_preferences
  for each row execute procedure public.handle_updated_at(); 