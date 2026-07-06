-- BMS EarnHub Supabase Schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- For demo/MVP we use a backend service-role key, so RLS is disabled on these tables.
-- In production, keep service-role key only on backend and add stricter policies/auditing.

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  daily_earning_limit numeric(12,2) not null check (daily_earning_limit >= 0),
  task_limit int not null default 5 check (task_limit >= 0),
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  package_id uuid not null references packages(id),
  payment_id uuid,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  activated_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  package_id uuid not null references packages(id),
  amount numeric(12,2) not null check (amount >= 0),
  payment_method text not null,
  transaction_id text,
  screenshot_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  task_type text not null default 'simple_task' check (task_type in ('ad_watch', 'simple_task')),
  reward_amount numeric(12,2) not null check (reward_amount >= 0),
  proof_required boolean not null default true,
  link_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists task_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  task_id uuid not null references tasks(id),
  proof_text text,
  proof_url text,
  reward_amount numeric(12,2) not null check (reward_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('credit', 'debit')),
  amount numeric(12,2) not null check (amount >= 0),
  source text not null default 'manual' check (source in ('task', 'withdrawal', 'bonus', 'manual')),
  reference_id uuid,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method text not null,
  account_title text not null,
  account_number text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at before update on profiles
for each row execute function set_updated_at();

drop trigger if exists set_packages_updated_at on packages;
create trigger set_packages_updated_at before update on packages
for each row execute function set_updated_at();

drop trigger if exists set_tasks_updated_at on tasks;
create trigger set_tasks_updated_at before update on tasks
for each row execute function set_updated_at();

insert into packages (name, price, daily_earning_limit, task_limit, description)
values
  ('Starter', 500, 150, 5, 'Basic earning package. Complete ads/simple tasks up to the daily limit.'),
  ('Bronze', 1000, 300, 8, 'Bronze package with more task opportunities.'),
  ('Silver', 2000, 600, 12, 'Silver package with higher daily task limit.'),
  ('Gold', 3000, 900, 16, 'Gold package for premium task opportunities.'),
  ('Platinum', 4000, 1200, 20, 'Platinum package with more daily earning opportunities.'),
  ('Diamond', 5000, 1500, 25, 'Diamond package with maximum daily earning limit.')
on conflict do nothing;

insert into tasks (title, description, task_type, reward_amount, proof_required, link_url)
values
  ('Watch Promo Video', 'Watch the complete promo/ad video and submit a screenshot as proof.', 'ad_watch', 30, true, 'https://example.com/ad-video'),
  ('Visit Website', 'Open the advertiser website, stay for 60 seconds, and submit a screenshot.', 'simple_task', 25, true, 'https://example.com'),
  ('Social Follow Task', 'Follow the advertiser social page and submit your profile screenshot.', 'simple_task', 40, true, 'https://example.com/social')
on conflict do nothing;

-- Default admin password: Admin@12345
-- Hash created with bcrypt cost 10.
insert into profiles (name, email, phone, password_hash, role, status)
values (
  'BMS Admin',
  'admin@bmsearnhub.com',
  '03000000000',
  'scrypt$16384$8$1$626d735f61646d696e5f736565645f73616c745f32303236$36e53194787a93e330a8549cd88667171b45f1b258844c3ae9318d9bc863e2fe4de32c2a40f99710cdb28e2c9f41f3ea6a43235d8e9feb123bfde4f8c5ca3308',
  'admin',
  'active'
)
on conflict (email) do nothing;
