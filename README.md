# Dijital Kartvizit — Web (Public Profil)

Bu klasör, `domain.com/kullanici-adi` şeklinde açılan public kartvizit
sayfasını içerir. Mobil app (kullanıcıların profil düzenlediği kısım)
ayrı bir proje — bunu kapsamıyor, aşağıda notu var.

## İçerik

- `supabase/schema.sql` — tüm tablolar + RLS policy'leri
- `app/[username]/page.tsx` — public profil sayfası (SSR + og:meta)
- `app/api/vcard/[username]/route.ts` — "Rehbere Ekle" (.vcf indirme)
- `app/api/qr/[username]/route.ts` — profile özel QR kod (PNG, anlık üretilir)
- `app/api/nfc/[uid]/route.ts` — NFC kart okutulunca profile yönlendirme

## Senin yapman gerekenler

1. **Supabase projesi aç** (supabase.com, ücretsiz katman yeterli başlangıçta)
2. **Şemayı çalıştır:** Dashboard → SQL Editor → `supabase/schema.sql`
   içeriğini yapıştır, çalıştır
3. **`.env.example`'ı `.env.local` yap**, Supabase Dashboard → Settings → API'den
   `Project URL` ve `anon public` key'i buraya yapıştır
4. **`npm install`** çalıştır
5. **`npm run dev`** ile lokalde dene — Supabase'te elle bir `profiles` satırı
   ekleyip (`username: "test"`) `localhost:3000/test` adresini aç
6. **Vercel'e deploy et** — GitHub reposunu bağla, env değişkenlerini
   Vercel dashboard'a gir, otomatik deploy olur
7. **Domain bağla** — Vercel → Settings → Domains, aldığın domaini ekle

## Bilerek yapmadıklarım (senin kararına kaldı)

- **Görsel tasarım** — sayfa şu an fonksiyonel ama sade (`app/globals.css`).
  Marka kimliği netleşince (renk, tipografi) ayrı bir tasarım geçişi yapılmalı.
- **Auth / mobil app** — bu klasör sadece public sayfayı içeriyor. Kullanıcı
  kayıt/giriş ve profil düzenleme mobil app tarafında (React Native + Supabase
  client SDK) ayrıca kurulacak.
- **Ödeme entegrasyonu** — `subscriptions` tablosu hazır ama iyzico/Stripe
  webhook'u yazılmadı. Bu, VPS'teki ince Node katmanına ait olacak (service-role
  key gerektirdiği için client'tan yapılamaz).
- **NFC aktivasyon sayfası** (`/activate/[uid]`) — route'tan referans veriliyor
  ama sayfası yok; kart satışına başlayınca eklenir.
- **Avatar/kapak fotoğrafı yükleme** — Supabase Storage ile yapılır, bucket +
  policy kurulumu mobil app tarafıyla birlikte ele alınmalı.

## Mimari hatırlatma

- Mobil app ve bu web sayfası **aynı Supabase projesine** bağlanır, ayrı
  backend yok.
- RLS zaten `select`i herkese açık tutuyor — bu yüzden bu Next.js kodu
  `anon` key ile çalışıyor, `service-role` key'e hiç ihtiyaç yok (ve
  asla client koduna konulmamalı).
