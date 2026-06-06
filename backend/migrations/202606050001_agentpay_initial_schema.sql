-- AgentPay MVP database blueprint
-- Target: PostgreSQL 15+
-- Purpose: internal ledger, escrow, marketplace, agent permissions, admin audit.

begin;

create extension if not exists pgcrypto;

create domain money_amount as numeric(36, 18)
  check (value >= 0);

create domain currency_code as text
  check (value ~ '^[A-Z]{3,10}$');

create type account_status as enum ('pending', 'active', 'suspended', 'closed');
create type agent_status as enum ('active', 'paused', 'revoked');
create type listing_status as enum ('draft', 'pending_review', 'active', 'rejected', 'archived');
create type order_status as enum ('created', 'approved', 'escrow_locked', 'in_delivery', 'delivered', 'released', 'refunded', 'disputed', 'cancelled');
create type ledger_entry_type as enum ('deposit', 'escrow_lock', 'escrow_release', 'refund', 'fee', 'adjustment');
create type review_status as enum ('open', 'approved', 'rejected', 'resolved');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  password_hash text not null,
  kyc_tier integer not null default 0,
  status account_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  currency currency_code not null default 'USDT',
  available_balance money_amount not null default 0,
  escrow_balance money_amount not null default 0,
  fee_reserved_balance money_amount not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, currency)
);

create table agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  name text not null,
  role text not null check (role in ('buyer', 'merchant', 'both')),
  status agent_status not null default 'active',
  per_transaction_limit money_amount not null default 50,
  daily_limit money_amount not null default 250,
  requires_human_approval_above money_amount not null default 100,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id),
  key_prefix text not null unique,
  key_hash text not null,
  scopes text[] not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table merchant_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  business_name text not null,
  bio text,
  rating numeric(3, 2) not null default 0,
  completed_orders integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  merchant_profile_id uuid not null references merchant_profiles(id),
  mongo_listing_id text not null unique,
  public_slug text not null unique,
  schema_id text not null,
  price money_amount not null,
  currency currency_code not null default 'USDT',
  delivery_sla_hours integer not null default 72,
  requirements_schema jsonb not null,
  status listing_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id),
  buyer_user_id uuid not null references users(id),
  buyer_agent_id uuid references agents(id),
  merchant_profile_id uuid not null references merchant_profiles(id),
  amount money_amount not null,
  currency currency_code not null default 'USDT',
  status order_status not null default 'created',
  idempotency_key text not null,
  request_payload jsonb not null default '{}'::jsonb,
  delivery_notes text,
  delivered_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  unique (buyer_user_id, idempotency_key)
);

create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallets(id),
  order_id uuid references orders(id),
  entry_type ledger_entry_type not null,
  debit money_amount not null default 0,
  credit money_amount not null default 0,
  currency currency_code not null default 'USDT',
  reference text not null,
  created_at timestamptz not null default now(),
  check (debit >= 0 and credit >= 0),
  check ((debit > 0 and credit = 0) or (credit > 0 and debit = 0))
);

create table payment_deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  wallet_id uuid not null references wallets(id),
  provider text not null default 'binance_pay',
  provider_order_id text not null unique,
  expected_amount money_amount not null,
  received_amount money_amount,
  currency currency_code not null default 'USDT',
  status text not null default 'pending',
  raw_webhook jsonb,
  created_at timestamptz not null default now(),
  reconciled_at timestamptz
);

create table disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  opened_by_user_id uuid not null references users(id),
  reason text not null,
  evidence_url text,
  status review_status not null default 'open',
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table admin_reviews (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid not null,
  priority text not null default 'normal',
  status review_status not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null,
  actor_id uuid,
  action text not null,
  subject_type text not null,
  subject_id uuid,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_orders_buyer on orders(buyer_user_id, created_at desc);
create index idx_orders_status on orders(status, created_at desc);
create index idx_ledger_wallet on ledger_entries(wallet_id, created_at desc);
create index idx_audit_subject on audit_logs(subject_type, subject_id, created_at desc);
create index idx_listings_mongo_ref on listings(mongo_listing_id);

commit;
