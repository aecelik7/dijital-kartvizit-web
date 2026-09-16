-- ============================================================
-- Dijital Kartvizit SaaS — Supabase şeması
-- Sırayla çalıştır: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- --------------------------------------------------------------
-- 1. PROFILES
-- auth.users ile 1-1 ilişki. Kullanıcı kayıt olduğunda (trigger ile)
-- veya app tarafında ilk girişte otomatik satır açılır.
-- --------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_-]{3,30}$'),
  full_name text not null,
  title text,
  phone text,
  email text,
  address text,
  avatar_url text,
  cover_url text,
  language text default 'tr',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index profiles_username_idx on profiles (username);

-- --------------------------------------------------------------
-- 2. LINKS
-- Sosyal medya, web sitesi, IBAN vb. — sıralanabilir dinamik liste
-- --------------------------------------------------------------
create table links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in (
    'website','instagram','facebook','tiktok','youtube','whatsapp',
    'phone','email','address','iban','custom'
  )),
  label text,
  value text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index links_profile_id_idx on links (profile_id);

-- --------------------------------------------------------------
-- 3. SUBSCRIPTIONS
-- Basit plan/durum takibi. Ödeme sağlayıcısı webhook'u bu tabloyu günceller.
-- --------------------------------------------------------------
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','pro')),
  status text not null default 'active' check (status in ('active','canceled','past_due')),
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- --------------------------------------------------------------
-- 4. NFC_CARDS
-- Fiziksel kart <-> profil eşleştirmesi. card_uid = kartın çip seri no'su.
-- --------------------------------------------------------------
create table nfc_cards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  card_uid text unique not null,
  status text not null default 'unassigned' check (status in ('unassigned','assigned','disabled')),
  assigned_at timestamptz,
  created_at timestamptz default now()
);

create index nfc_cards_card_uid_idx on nfc_cards (card_uid);

-- --------------------------------------------------------------
-- 5. updated_at otomatik güncelleme (profiles için)
-- --------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

-- --------------------------------------------------------------
-- 6. Kayıt sonrası otomatik profil satırı açma
-- Supabase auth.users'a yeni kullanıcı düştüğünde tetiklenir.
-- username geçici olarak user id'nin ilk 8 karakteri verilir,
-- kullanıcı app içinde değiştirir.
-- --------------------------------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, 'user-' || substr(new.id::text, 1, 8), coalesce(new.raw_user_meta_data->>'full_name', ''));

  insert into public.subscriptions (profile_id, plan, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table links enable row level security;
alter table subscriptions enable row level security;
alter table nfc_cards enable row level security;

-- PROFILES: herkes okuyabilir (public kartvizit sayfası bunu gerektirir),
-- sadece sahibi kendi profilini güncelleyebilir. Insert/delete client'tan
-- kapalı — profil satırı yukarıdaki trigger ile otomatik açılır.
create policy "profiles_select_public"
  on profiles for select
  using (true);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- LINKS: herkes okuyabilir, sadece sahibi kendi linklerini yönetebilir.
create policy "links_select_public"
  on links for select
  using (true);

create policy "links_insert_own"
  on links for insert
  with check (
    auth.uid() = (select id from profiles where id = profile_id)
  );

create policy "links_update_own"
  on links for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "links_delete_own"
  on links for delete
  using (auth.uid() = profile_id);

-- SUBSCRIPTIONS: sadece sahibi okuyabilir. Yazma tamamen kapalı —
-- sadece service-role key ile (ödeme webhook'u) değiştirilir.
create policy "subscriptions_select_own"
  on subscriptions for select
  using (auth.uid() = profile_id);

-- NFC_CARDS: sahibi kendi eşleşmiş kartını görebilir. Insert/update client'tan
-- kapalı — kart ataması service-role (admin) tarafından yapılır, kullanıcı
-- sadece "kartımı aktive et" endpoint'i üzerinden dolaylı tetikler.
create policy "nfc_cards_select_own"
  on nfc_cards for select
  using (auth.uid() = profile_id);
