-- Core relational schema for SideQuest marketplace
-- Generated from Supabase migrations (2025-09-27) and normalized for local development.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  phone text,
  date_of_birth date,
  location text,
  rating_average numeric(3,2) default 0,
  rating_count integer default 0,
  total_earnings numeric(10,2) default 0,
  missions_completed integer default 0,
  missions_created integer default 0,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table if not exists public.mission_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null,
  color text default '#FFD60A',
  created_at timestamptz default now()
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category_id uuid references public.mission_categories(id),
  owner_id uuid not null references public.profiles(user_id) on delete cascade,
  runner_id uuid references public.profiles(user_id) on delete set null,
  price numeric(10,2) not null,
  location text not null,
  duration_hours integer,
  status text default 'open' check (status in ('open','in_progress','pending_completion','completed','cancelled')),
  deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(user_id) on delete cascade,
  reviewed_user_id uuid not null references public.profiles(user_id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sender_id uuid not null references public.profiles(user_id) on delete cascade,
  content text not null,
  message_type text default 'text' check (message_type in ('text','image','location')),
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info','mission_update','payment','message','review')),
  is_read boolean default false,
  related_mission_id uuid references public.missions(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  mission_id uuid references public.missions(id) on delete set null,
  amount numeric(10,2) not null,
  type text not null check (type in ('earning','payment','refund','fee')),
  status text default 'pending' check (status in ('pending','completed','failed','escrow')),
  description text,
  created_at timestamptz default now()
);

-- Trigger helpers
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, first_name, last_name)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')
  on conflict (user_id) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        updated_at = now();
  return new;
end;
$$;

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_missions_updated_at
  before update on public.missions
  for each row execute function public.handle_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Convenience indexes for dashboard queries
create index if not exists idx_missions_status_created_at on public.missions(status, created_at desc);
create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read);
create index if not exists idx_transactions_user_created on public.transactions(user_id, created_at desc);
