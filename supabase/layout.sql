-- ============================================================
-- Kart düzeni + güncellenmiş tema listesi
-- Supabase Dashboard > SQL Editor > New query içinde çalıştır
-- ============================================================

-- 1) Düzen kolonu
alter table profiles
  add column if not exists layout text not null default 'kabartma';

-- Varsa eski kısıtı düşür, yenisini ekle (tekrar çalıştırılabilir olsun diye)
alter table profiles drop constraint if exists profiles_layout_check;
alter table profiles
  add constraint profiles_layout_check
  check (layout in ('kabartma','plaka','portre','dizgi'));

-- 2) Tema kolonu — daha önce eklendiyse sadece kısıt güncellenir
alter table profiles
  add column if not exists theme text not null default 'koyu';

alter table profiles drop constraint if exists profiles_theme_check;
alter table profiles
  add constraint profiles_theme_check
  check (theme in ('koyu','siyah','antrasit','lacivert','altin','renkli','acik'));

-- 3) Eski tema adlarını yeni listeye taşı (varsa)
update profiles set theme = 'koyu'
  where theme not in ('koyu','siyah','antrasit','lacivert','altin','renkli','acik');
