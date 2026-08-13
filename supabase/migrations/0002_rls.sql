-- STE MABANIS — row level security
--
-- Model:
--   anon           → may read ONLY properties that are live on the public site,
--                    plus their media. Nothing else is reachable.
--   authenticated  → staff. Read everything; write their own records.
--   manager/admin  → write anything.
--
-- Apply after 0001_schema.sql.

alter table profiles       enable row level security;
alter table properties     enable row level security;
alter table property_media enable row level security;
alter table clients        enable row level security;
alter table leads          enable row level security;
alter table activities     enable row level security;
alter table appointments   enable row level security;
alter table documents      enable row level security;
alter table tasks          enable row level security;
alter table transactions   enable row level security;
alter table payments       enable row level security;
alter table notifications  enable row level security;

-- ------------------------------------------------------------- helpers

-- SECURITY DEFINER so the policies below can read profiles without
-- recursing through profiles' own RLS.
create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles p where p.id = auth.uid());
$$;

create or replace function is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.staff_role in ('manager', 'admin')
  );
$$;

-- ------------------------------------------------------------ profiles

create policy profiles_read_staff on profiles
  for select to authenticated using (is_staff());

create policy profiles_update_self on profiles
  for update to authenticated
  using (id = auth.uid() or is_manager())
  with check (id = auth.uid() or is_manager());

create policy profiles_insert_manager on profiles
  for insert to authenticated with check (is_manager());

-- ---------------------------------------------------------- properties

-- The public site sees only what is genuinely on the market. A sold or rented
-- property disappears from these results while its row stays intact.
create policy properties_read_public on properties
  for select to anon
  using (status in ('available', 'reserved', 'under_offer'));

create policy properties_read_staff on properties
  for select to authenticated using (is_staff());

create policy properties_write_owner on properties
  for all to authenticated
  using (is_manager() or agent_id = auth.uid())
  with check (is_manager() or agent_id = auth.uid());

-- ------------------------------------------------------- property media

create policy property_media_read_public on property_media
  for select to anon
  using (
    exists (
      select 1 from properties p
      where p.id = property_media.property_id
        and p.status in ('available', 'reserved', 'under_offer')
    )
  );

create policy property_media_read_staff on property_media
  for select to authenticated using (is_staff());

create policy property_media_write_staff on property_media
  for all to authenticated
  using (
    is_manager()
    or exists (
      select 1 from properties p
      where p.id = property_media.property_id and p.agent_id = auth.uid()
    )
  )
  with check (
    is_manager()
    or exists (
      select 1 from properties p
      where p.id = property_media.property_id and p.agent_id = auth.uid()
    )
  );

-- ------------------------------------------------------------- clients
-- Client data is never exposed to anon; no policy for that role at all.

create policy clients_read_staff on clients
  for select to authenticated using (is_staff());

create policy clients_write_owner on clients
  for all to authenticated
  using (is_manager() or agent_id = auth.uid())
  with check (is_manager() or agent_id = auth.uid());

-- --------------------------------------------------------------- leads

create policy leads_read_staff on leads
  for select to authenticated using (is_staff());

create policy leads_write_owner on leads
  for all to authenticated
  using (is_manager() or agent_id = auth.uid())
  with check (is_manager() or agent_id = auth.uid());

-- ---------------------------------------------------------- activities

create policy activities_read_staff on activities
  for select to authenticated using (is_staff());

-- An activity is an audit trail: staff may add, only managers may alter.
create policy activities_insert_staff on activities
  for insert to authenticated with check (is_staff() and agent_id = auth.uid());

create policy activities_modify_manager on activities
  for update to authenticated using (is_manager()) with check (is_manager());

create policy activities_delete_manager on activities
  for delete to authenticated using (is_manager());

-- -------------------------------------------------------- appointments

create policy appointments_read_staff on appointments
  for select to authenticated using (is_staff());

create policy appointments_write_owner on appointments
  for all to authenticated
  using (is_manager() or agent_id = auth.uid())
  with check (is_manager() or agent_id = auth.uid());

-- ----------------------------------------------------------- documents

create policy documents_read_staff on documents
  for select to authenticated using (is_staff());

create policy documents_write_staff on documents
  for all to authenticated
  using (is_manager() or uploaded_by = auth.uid())
  with check (is_manager() or uploaded_by = auth.uid());

-- --------------------------------------------------------------- tasks

create policy tasks_read_staff on tasks
  for select to authenticated using (is_staff());

create policy tasks_write_assignee on tasks
  for all to authenticated
  using (is_manager() or assignee_id = auth.uid())
  with check (is_manager() or assignee_id = auth.uid());

-- -------------------------------------------------------- transactions

create policy transactions_read_staff on transactions
  for select to authenticated using (is_staff());

create policy transactions_write_owner on transactions
  for all to authenticated
  using (is_manager() or agent_id = auth.uid())
  with check (is_manager() or agent_id = auth.uid());

create policy payments_read_staff on payments
  for select to authenticated using (is_staff());

-- Money moves are manager-only.
create policy payments_write_manager on payments
  for all to authenticated using (is_manager()) with check (is_manager());

-- ------------------------------------------------------- notifications

create policy notifications_read_own on notifications
  for select to authenticated
  using (recipient_id = auth.uid() or recipient_id is null);

create policy notifications_update_own on notifications
  for update to authenticated
  using (recipient_id = auth.uid() or recipient_id is null)
  with check (recipient_id = auth.uid() or recipient_id is null);

create policy notifications_insert_manager on notifications
  for insert to authenticated with check (is_manager());
