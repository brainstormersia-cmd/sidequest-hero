-- Row Level Security policies for SideQuest marketplace
-- Apply after enabling RLS on each table.

alter table public.profiles enable row level security;
alter table public.missions enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.transactions enable row level security;
alter table public.mission_categories enable row level security;

create policy "Profiles are publicly viewable" on public.profiles
  for select
  using (true);

create policy "Users manage own profile" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Mission catalog is public" on public.missions
  for select
  using (true);

create policy "Owners can insert missions" on public.missions
  for insert
  with check (auth.uid() = owner_id);

create policy "Owners or assigned runners can update mission" on public.missions
  for update
  using (auth.uid() = owner_id or auth.uid() = coalesce(runner_id, auth.uid()))
  with check (auth.uid() = owner_id or auth.uid() = coalesce(runner_id, auth.uid()));

create policy "Users can read their notifications" on public.notifications
  for select
  using (auth.uid() = user_id);

create policy "Users can update notification read state" on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users see their transactions" on public.transactions
  for select
  using (auth.uid() = user_id);

create policy "Users record their transactions" on public.transactions
  for insert
  with check (auth.uid() = user_id);

create policy "Users view reviews they are involved in" on public.reviews
  for select
  using (auth.uid() = reviewer_id or auth.uid() = reviewed_user_id);

create policy "Users submit reviews they author" on public.reviews
  for insert
  with check (auth.uid() = reviewer_id);

create policy "Participants can see chat messages" on public.messages
  for select
  using (
    exists (
      select 1
      from public.missions m
      where m.id = mission_id
        and (m.owner_id = auth.uid() or m.runner_id = auth.uid())
    )
  );

create policy "Participants can send chat messages" on public.messages
  for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1
      from public.missions m
      where m.id = mission_id
        and (m.owner_id = auth.uid() or m.runner_id = auth.uid())
    )
  );

create policy "Mission categories are publicly viewable" on public.mission_categories
  for select
  using (true);
