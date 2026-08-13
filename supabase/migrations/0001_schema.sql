-- STE MABANIS — admin schema
-- Mirrors src/lib/admin/types.ts. Apply before 0002_rls.sql.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums

create type property_status as enum (
  'draft', 'available', 'reserved', 'under_offer', 'sold', 'rented', 'archived'
);
create type transaction_kind as enum ('vente', 'location');
create type media_kind       as enum ('photo', 'floor_plan', 'video');
create type client_role      as enum ('buyer', 'seller', 'tenant', 'landlord', 'investor');
create type lead_temperature as enum ('cold', 'warm', 'hot');
create type lead_source      as enum (
  'site_web', 'recommandation', 'portail', 'reseaux_sociaux', 'telephone', 'walk_in'
);
create type pipeline_stage   as enum (
  'new', 'contacted', 'qualified', 'viewing', 'offer', 'negotiation', 'won', 'lost'
);
create type activity_kind    as enum (
  'note', 'call', 'email', 'whatsapp', 'viewing', 'offer', 'stage_change', 'document'
);
create type appointment_kind   as enum ('viewing', 'valuation', 'signature', 'call', 'meeting');
create type appointment_status as enum ('scheduled', 'confirmed', 'done', 'cancelled', 'no_show');
create type document_category as enum (
  'mandat', 'titre_foncier', 'compromis', 'contrat', 'facture', 'diagnostic', 'autre'
);
create type task_priority as enum ('low', 'normal', 'high', 'urgent');
create type task_status   as enum ('todo', 'doing', 'done');
create type task_entity   as enum ('property', 'client', 'lead', 'appointment');
create type transaction_stage as enum (
  'interest', 'visit', 'offer', 'negotiation', 'agreement', 'contract', 'payment', 'closing'
);
create type notification_kind as enum ('lead', 'appointment', 'task', 'transaction', 'system');
create type staff_role as enum ('agent', 'manager', 'admin');

-- ------------------------------------------------------------- profiles

-- One row per staff member, keyed to the Supabase auth user.
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  role        text not null default '',
  staff_role  staff_role not null default 'agent',
  email       text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------- properties

create table properties (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,
  slug          text not null unique,
  title         text not null,
  status        property_status not null default 'draft',
  transaction   transaction_kind not null,
  type          text not null,
  city          text not null,
  neighborhood  text not null,
  price         bigint not null check (price >= 0),
  surface       integer not null check (surface >= 0),
  bedrooms      integer not null default 0,
  bathrooms     integer not null default 0,
  description   text not null default '',
  features      text[] not null default '{}',
  agent_id      uuid references profiles (id) on delete set null,
  owner_client_id uuid,
  -- Set when the property leaves the market. The row is never deleted, so
  -- history and reporting survive a sale.
  sold_at       timestamptz,
  views_30d     integer not null default 0,
  lead_count    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index properties_status_idx      on properties (status);
create index properties_transaction_idx on properties (transaction);
create index properties_agent_idx       on properties (agent_id);
create index properties_city_idx        on properties (city);

create table property_media (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  kind        media_kind not null default 'photo',
  url         text not null,
  label       text,
  position    integer not null default 0,
  is_cover    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index property_media_property_idx on property_media (property_id, kind, position);

-- At most one cover photo per property.
create unique index property_media_single_cover_idx
  on property_media (property_id) where is_cover;

-- -------------------------------------------------------------- clients

create table clients (
  id            uuid primary key default gen_random_uuid(),
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  phone         text not null default '',
  roles         client_role[] not null default '{}',
  temperature   lead_temperature not null default 'cold',
  score         integer not null default 0 check (score between 0 and 100),
  source        lead_source not null default 'site_web',
  city          text,
  budget_min    bigint,
  budget_max    bigint,
  notes         text,
  agent_id      uuid references profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  last_contacted_at timestamptz
);

create index clients_agent_idx on clients (agent_id);
create index clients_temp_idx  on clients (temperature);

alter table properties
  add constraint properties_owner_client_fk
  foreign key (owner_client_id) references clients (id) on delete set null;

-- ---------------------------------------------------------------- leads

create table leads (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients (id) on delete cascade,
  property_id  uuid references properties (id) on delete set null,
  stage        pipeline_stage not null default 'new',
  temperature  lead_temperature not null default 'cold',
  score        integer not null default 0 check (score between 0 and 100),
  source       lead_source not null default 'site_web',
  value        bigint not null default 0,
  agent_id     uuid references profiles (id) on delete set null,
  next_action  text,
  next_action_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index leads_stage_idx on leads (stage);
create index leads_agent_idx on leads (agent_id);

-- ----------------------------------------------------------- activities

create table activities (
  id          uuid primary key default gen_random_uuid(),
  kind        activity_kind not null,
  subject     text not null,
  body        text,
  client_id   uuid references clients (id) on delete cascade,
  property_id uuid references properties (id) on delete cascade,
  lead_id     uuid references leads (id) on delete cascade,
  agent_id    uuid references profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index activities_client_idx on activities (client_id, created_at desc);
create index activities_lead_idx   on activities (lead_id, created_at desc);

-- --------------------------------------------------------- appointments

create table appointments (
  id          uuid primary key default gen_random_uuid(),
  kind        appointment_kind not null,
  status      appointment_status not null default 'scheduled',
  title       text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  property_id uuid references properties (id) on delete set null,
  client_id   uuid references clients (id) on delete set null,
  agent_id    uuid references profiles (id) on delete set null,
  location    text,
  -- Viewing report
  report_interest    smallint check (report_interest between 0 and 5),
  report_outcome     text,
  report_next_action text,
  created_at  timestamptz not null default now(),
  constraint appointments_time_order check (ends_at > starts_at)
);

create index appointments_range_idx on appointments (starts_at);
create index appointments_agent_idx on appointments (agent_id, starts_at);

-- ------------------------------------------------------------ documents

create table documents (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       document_category not null default 'autre',
  mime_type      text not null,
  size_bytes     bigint not null default 0,
  version        integer not null default 1,
  storage_path   text not null,
  property_id    uuid references properties (id) on delete cascade,
  client_id      uuid references clients (id) on delete cascade,
  transaction_id uuid,
  uploaded_by    uuid references profiles (id) on delete set null,
  created_at     timestamptz not null default now()
);

create index documents_property_idx on documents (property_id);
create index documents_client_idx   on documents (client_id);

-- ---------------------------------------------------------------- tasks

create table tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  status      task_status not null default 'todo',
  priority    task_priority not null default 'normal',
  due_at      timestamptz,
  assignee_id uuid references profiles (id) on delete set null,
  entity_kind task_entity,
  entity_id   uuid,
  created_at  timestamptz not null default now(),
  -- Either both entity columns are set, or neither is.
  constraint tasks_entity_pair check (
    (entity_kind is null and entity_id is null)
    or (entity_kind is not null and entity_id is not null)
  )
);

create index tasks_assignee_idx on tasks (assignee_id, status);
create index tasks_due_idx      on tasks (due_at);

-- --------------------------------------------------------- transactions

create table transactions (
  id               uuid primary key default gen_random_uuid(),
  reference        text not null unique,
  stage            transaction_stage not null default 'interest',
  property_id      uuid not null references properties (id) on delete restrict,
  buyer_client_id  uuid references clients (id) on delete set null,
  seller_client_id uuid references clients (id) on delete set null,
  agent_id         uuid references profiles (id) on delete set null,
  amount           bigint not null default 0,
  commission       bigint not null default 0,
  opened_at        timestamptz not null default now(),
  closed_at        timestamptz
);

alter table documents
  add constraint documents_transaction_fk
  foreign key (transaction_id) references transactions (id) on delete cascade;

create table payments (
  id             uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions (id) on delete cascade,
  label          text not null,
  amount         bigint not null,
  due_at         timestamptz not null,
  paid_at        timestamptz
);

create index payments_transaction_idx on payments (transaction_id);

-- -------------------------------------------------------- notifications

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  -- Null recipient = broadcast to all staff.
  recipient_id uuid references profiles (id) on delete cascade,
  kind        notification_kind not null default 'system',
  title       text not null,
  body        text not null default '',
  href        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index notifications_recipient_idx on notifications (recipient_id, read, created_at desc);

-- ------------------------------------------------------- updated_at sync

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

create trigger leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- Record the moment a property leaves the market, without deleting anything.
create or replace function stamp_property_exit()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('sold', 'rented') and old.status is distinct from new.status then
    new.sold_at = coalesce(new.sold_at, now());
  elsif new.status not in ('sold', 'rented') then
    new.sold_at = null;
  end if;
  return new;
end;
$$;

create trigger properties_stamp_exit
  before update of status on properties
  for each row execute function stamp_property_exit();
