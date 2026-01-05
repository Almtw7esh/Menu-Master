-- Users table (linked to Supabase auth)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null check (role in ('admin', 'manager', 'customer')),
  restaurant_id uuid references restaurants(id), -- only for managers
  created_at timestamp with time zone default now()
);

-- Restaurants table
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo text,
  created_at timestamp with time zone default now()
);

-- Branches table
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  state text,
  location text,
  delivery_price numeric,
  image text,
  created_at timestamp with time zone default now()
);

-- Menu Items table
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id) on delete cascade,
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  price numeric not null,
  category text,
  image text,
  created_at timestamp with time zone default now()
);
