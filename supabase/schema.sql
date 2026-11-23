-- Premier Property Management & Development
-- PostgreSQL / Supabase Schema, Indexes, Storage Bucket & Row Level Security (RLS)

create extension if not exists "pgcrypto";

-- 1. Profiles (Role-Based Access Control)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Properties
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  purpose text not null check (purpose in ('sale', 'rent')),
  type text not null check (type in ('house', 'plot', 'apartment', 'shop', 'office', 'agricultural_land', 'commercial_building')),
  price_pkr bigint not null check (price_pkr >= 0),
  area_size numeric(12,2) not null check (area_size > 0),
  area_unit text not null check (area_unit in ('marla', 'kanal', 'sq_ft')),
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  parking integer not null default 0 check (parking >= 0),
  furnished boolean not null default false,
  year_built integer,
  address_area text not null,
  latitude double precision,
  longitude double precision,
  amenities text[] not null default '{}',
  status text not null default 'for_sale' check (status in ('for_sale', 'for_rent', 'sold', 'rented')),
  featured boolean not null default false,
  published boolean not null default true,
  is_sample boolean not null default false,
  cover_image_url text not null default '',
  cover_image_alt text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_properties_slug on public.properties(slug);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_purpose on public.properties(purpose);
create index if not exists idx_properties_type on public.properties(type);
create index if not exists idx_properties_price_pkr on public.properties(price_pkr);

-- 3. Property Images
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_property_images_property_id on public.property_images(property_id);

-- 4. Gallery Images
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text not null default '',
  category text not null check (category in ('Houses', 'Plots', 'Commercial', 'Projects')),
  url text not null,
  alt_text text not null default '',
  property_id uuid references public.properties(id) on delete set null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Inquiries
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null default '',
  message text not null,
  property_id uuid references public.properties(id) on delete set null,
  property_title text not null default '',
  source_page text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  private_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_inquiries_property_id on public.inquiries(property_id);

-- 6. Site Settings (Singleton)
create table if not exists public.site_settings (
  id text primary key default 'main' check (id = 'main'),
  business_name text not null,
  address text not null,
  phone_display text not null,
  phone_international text not null,
  whatsapp_url text not null,
  email text not null default '',
  working_hours text not null default '',
  google_rating numeric(2,1) not null default 4.8,
  google_review_count integer not null default 19,
  google_maps_url text not null,
  hero_headline text not null,
  hero_subheadline text not null,
  facebook_url text not null default '',
  instagram_url text not null default '',
  linkedin_url text not null default '',
  updated_at timestamptz not null default now()
);

-- Helper Functions for RLS
create or replace function public.is_staff()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.gallery_images enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;

-- RLS Policies
create policy "Public can read published properties" on public.properties
  for select using (published = true or public.is_staff());

create policy "Staff can manage properties" on public.properties
  for all using (public.is_staff()) with check (public.is_staff());

create policy "Public can read property images" on public.property_images
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and (p.published = true or public.is_staff())
    )
  );

create policy "Staff can manage property images" on public.property_images
  for all using (public.is_staff()) with check (public.is_staff());

create policy "Public can read published gallery images" on public.gallery_images
  for select using (published = true or public.is_staff());

create policy "Staff can manage gallery images" on public.gallery_images
  for all using (public.is_staff()) with check (public.is_staff());

create policy "Public can submit new inquiries" on public.inquiries
  for insert with check (status = 'new' and private_notes = '');

create policy "Staff can read and manage inquiries" on public.inquiries
  for select using (public.is_staff());

create policy "Staff can update inquiries" on public.inquiries
  for update using (public.is_staff()) with check (public.is_staff());

create policy "Staff can delete inquiries" on public.inquiries
  for delete using (public.is_staff());

create policy "Public can read site settings" on public.site_settings
  for select using (id = 'main');

create policy "Admin can manage site settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Users can view own profile or admin all" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Admin can manage profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
