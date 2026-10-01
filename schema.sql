-- Run in Supabase > SQL Editor
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  customer_name text not null check (char_length(customer_name) between 3 and 80),
  phone text not null check (phone ~ '^(\+213|00213|0)[567][0-9]{8}$'),
  address text not null check (char_length(address) between 5 and 260),
  total_price integer not null check (total_price > 0 and total_price < 1000000),
  items jsonb not null default '[]',
  payment_method text not null default 'cod' check (payment_method in ('cod','ccp')),
  status text not null default 'Pending' check (status = 'Pending')
);

-- If your orders table already existed, make sure it has the new columns:
alter table public.orders add column if not exists payment_method text not null default 'cod';
alter table public.orders add column if not exists items jsonb not null default '[]';

alter table public.orders enable row level security;

-- Public visitors may ONLY insert. They cannot read, edit or delete any order.
drop policy if exists "anon can place orders" on public.orders;
create policy "anon can place orders" on public.orders
  for insert to anon with check (status = 'Pending');

-- Your dashboard should use a logged-in admin account (authenticated role):
drop policy if exists "admin reads orders" on public.orders;
create policy "admin reads orders" on public.orders
  for select to authenticated using (true);
drop policy if exists "admin updates orders" on public.orders;
create policy "admin updates orders" on public.orders
  for update to authenticated using (true) with check (true);
