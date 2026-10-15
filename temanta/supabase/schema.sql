create extension if not exists "pgcrypto";
create type order_status as enum ('pending_payment','paid','processing','shipped','delivered','cancelled');

create table profiles (id uuid primary key references auth.users on delete cascade, full_name text, phone text, is_admin boolean not null default false, created_at timestamptz default now());
create table categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique);
create table products (id uuid primary key default gen_random_uuid(), category_id uuid references categories(id), slug text not null unique, name text not null, description text, price integer not null check (price >= 0), stock integer not null default 0, sold integer not null default 0, rating numeric(2,1) default 0, image_urls text[] default '{}', created_at timestamptz default now());
create table product_variants (id uuid primary key default gen_random_uuid(), product_id uuid not null references products(id) on delete cascade, label text not null, stock integer not null default 0);
create table carts (id uuid primary key default gen_random_uuid(), user_id uuid not null unique references profiles(id) on delete cascade, updated_at timestamptz default now());
create table cart_items (id uuid primary key default gen_random_uuid(), cart_id uuid not null references carts(id) on delete cascade, product_id uuid not null references products(id), variant_id uuid references product_variants(id), qty integer not null check (qty > 0));
create table addresses (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, recipient text not null, phone text not null, street text not null, district text not null, city text not null, postal_code text not null);
create table orders (id uuid primary key default gen_random_uuid(), order_number text not null unique, user_id uuid not null references profiles(id), address_id uuid references addresses(id), status order_status not null default 'pending_payment', courier text, shipping_method text, shipping_cost integer not null default 0, discount integer not null default 0, voucher_code text, total integer not null, created_at timestamptz default now());
create table order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id) on delete cascade, product_id uuid references products(id), name text not null, variant text, slug text, tone text, price integer not null, qty integer not null);
create table order_events (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id) on delete cascade, status order_status not null, at timestamptz not null default now());
create table payments (id uuid primary key default gen_random_uuid(), order_id uuid not null unique references orders(id) on delete cascade, method text not null, amount integer not null, paid_at timestamptz);
create table shipments (id uuid primary key default gen_random_uuid(), order_id uuid not null unique references orders(id) on delete cascade, tracking_number text, status text, updated_at timestamptz default now());
create table reviews (id uuid primary key default gen_random_uuid(), product_slug text not null, user_id uuid references profiles(id) on delete set null, name text not null, city text, rating integer not null check (rating between 1 and 5), variant text, text text not null, created_at timestamptz default now());
create index reviews_product_slug_idx on reviews (product_slug);
-- Satu ulasan per produk per pengguna (cegah duplikat).
create unique index reviews_unique_user_product_idx on reviews (user_id, product_slug) where user_id is not null;

create or replace function is_admin() returns boolean language sql stable security definer as $$ select coalesce((select is_admin from profiles where id = auth.uid()), false) $$;

alter table profiles enable row level security; alter table categories enable row level security; alter table products enable row level security;
alter table product_variants enable row level security; alter table carts enable row level security; alter table cart_items enable row level security;
alter table addresses enable row level security; alter table orders enable row level security; alter table order_items enable row level security; alter table order_events enable row level security;
alter table payments enable row level security; alter table shipments enable row level security;
alter table reviews enable row level security;

-- Migrasi: hapus kebijakan lama yang membiarkan pembeli mengubah status pesanan / menandai lunas.
drop policy if exists "update own order" on orders;
drop policy if exists "update own payments" on payments;
drop policy if exists "update own shipments" on shipments;

create policy "catalog readable" on categories for select using (true);
create policy "products readable" on products for select using (true);
create policy "variants readable" on product_variants for select using (true);
create policy "admin manage categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin manage products" on products for all using (is_admin()) with check (is_admin());
create policy "admin manage variants" on product_variants for all using (is_admin()) with check (is_admin());

create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "update own profile" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and is_admin = (select is_admin from profiles where id = auth.uid()));
create policy "own cart" on carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own cart items" on cart_items for all using (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "own addresses" on addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own orders" on orders for select using (user_id = auth.uid() or is_admin());
create policy "create own order" on orders for insert with check (user_id = auth.uid());
create policy "admin update orders" on orders for update using (is_admin());
create policy "own order items" on order_items for select using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "own payments" on payments for select using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "own shipments" on shipments for select using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "insert own profile" on profiles for insert with check (id = auth.uid());
create policy "cancel own order" on orders for update using (user_id = auth.uid() and status = 'pending_payment') with check (user_id = auth.uid() and status = 'cancelled');
create policy "insert own order items" on order_items for insert with check (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "insert own payments" on payments for insert with check (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "admin update payments" on payments for update using (is_admin());
create policy "insert own shipments" on shipments for insert with check (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "admin update shipments" on shipments for update using (is_admin());
create policy "own order events" on order_events for select using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "insert own order events" on order_events for insert with check (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "reviews readable" on reviews for select using (true);
create policy "insert own review" on reviews for insert with check (user_id = auth.uid());
create policy "delete own review" on reviews for delete using (user_id = auth.uid() or is_admin());

create table wishlists (
  user_id uuid references profiles(id) on delete cascade,
  product_slug text not null,
  created_at timestamptz default now(),
  primary key (user_id, product_slug)
);
create index wishlists_user_idx on wishlists (user_id);
alter table wishlists enable row level security;
create policy "wishlist readable" on wishlists for select using (auth.uid() = user_id);
create policy "manage own wishlist" on wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
