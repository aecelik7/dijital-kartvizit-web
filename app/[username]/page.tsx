import { supabase } from "@/lib/supabase";
import { getTheme, themeVars } from "@/lib/themes";
import { getLayout } from "@/lib/layouts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import {
  Globe, Phone, Mail, MapPin, CreditCard, Link2, UserPlus, type LucideIcon,
} from "lucide-react";
import { SiInstagram, SiFacebook, SiYoutube, SiTiktok, SiWhatsapp } from "react-icons/si";
import type { IconType } from "react-icons";

type Link = {
  id: string;
  type: string;
  label: string | null;
  value: string;
  sort_order: number;
};

const LINK_LABELS: Record<string, string> = {
  website: "Web sitesi", instagram: "Instagram", facebook: "Facebook",
  tiktok: "TikTok", youtube: "YouTube", whatsapp: "WhatsApp",
  phone: "Telefon", email: "E-posta", address: "Adres", iban: "IBAN", custom: "",
};

const LINK_ICONS: Record<string, LucideIcon | IconType> = {
  website: Globe, instagram: SiInstagram, facebook: SiFacebook,
  tiktok: SiTiktok, youtube: SiYoutube, whatsapp: SiWhatsapp,
  phone: Phone, email: Mail, address: MapPin, iban: CreditCard, custom: Link2,
};

async function getProfile(username: string) {
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("username", username).single();
  if (!profile) return null;

  const { data: links } = await supabase
    .from("links").select("*").eq("profile_id", profile.id)
    .order("sort_order", { ascending: true });

  return { profile, links: (links ?? []) as Link[] };
}

export async function generateMetadata({
  params,
}: { params: { username: string } }): Promise<Metadata> {
  const data = await getProfile(params.username);
  if (!data) return {};
  const { profile } = data;
  return {
    title: `${profile.full_name} — Kartvizit`,
    description: profile.title ?? undefined,
    openGraph: {
      title: profile.full_name,
      description: profile.title ?? undefined,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

function hrefFor(link: Link) {
  switch (link.type) {
    case "whatsapp": return `https://wa.me/${link.value.replace(/\D/g, "")}`;
    case "email": return `mailto:${link.value}`;
    case "phone": return `tel:${link.value}`;
    default: return link.value;
  }
}

function labelFor(link: Link) {
  return link.label || LINK_LABELS[link.type] || link.type;
}

/** Ad Soyad -> "Ad" ve "Soyad" (Kabartma düzeni iki satır kullanır). */
function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { first: full, last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

export default async function ProfilePage({
  params,
}: { params: { username: string } }) {
  const data = await getProfile(params.username);
  if (!data) notFound();

  const { profile, links } = data;
  const theme = getTheme(profile.theme);
  const layout = getLayout(profile.layout);
  const style = themeVars(theme) as CSSProperties;
  const qrSrc = `/api/qr/${profile.username}`;
  const vcardHref = `/api/vcard/${profile.username}`;

  const shared = { profile, links, qrSrc, vcardHref };

  return (
    <main className={`page page--${layout.id}`} style={style}>
      {layout.id === "kabartma" && <Kabartma {...shared} />}
      {layout.id === "plaka" && <Plaka {...shared} />}
      {layout.id === "portre" && <Portre {...shared} />}
      {layout.id === "dizgi" && <Dizgi {...shared} />}
    </main>
  );
}

type ViewProps = {
  profile: any;
  links: Link[];
  qrSrc: string;
  vcardHref: string;
};

/* ---------------- KABARTMA ---------------- */
function Kabartma({ profile, links, qrSrc, vcardHref }: ViewProps) {
  const { first, last } = splitName(profile.full_name);
  return (
    <div className="kabartma">
      <div className="plate">
        <div className="mono">{(profile.full_name || "?").trim()[0]?.toUpperCase()}</div>
        <h1>{first}{last && <><br />{last}</>}</h1>
        {profile.title && <p className="role">{profile.title.toLocaleUpperCase("tr-TR")}</p>}
        <div className="hair" />
        <div className="lines">
          {profile.phone && <a href={`tel:${profile.phone}`}>{profile.phone}</a>}
          {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
          {profile.address && <span>{profile.address}</span>}
        </div>
        {links.length > 0 && (
          <div className="soc">
            {links.map((l) => {
              const Icon = LINK_ICONS[l.type] ?? Link2;
              return (
                <a key={l.id} href={hrefFor(l)} target="_blank" rel="noreferrer" aria-label={labelFor(l)}>
                  <Icon size={15} />
                </a>
              );
            })}
          </div>
        )}
        <a className="cta" href={vcardHref}>Rehbere ekle</a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="qr"><img src={qrSrc} alt="QR kod" /></div>
      </div>
    </div>
  );
}

/* ---------------- PLAKA ---------------- */
function Plaka({ profile, links, qrSrc, vcardHref }: ViewProps) {
  const rows: Array<[string, React.ReactNode]> = [];
  if (profile.phone) rows.push(["TELEFON", <a href={`tel:${profile.phone}`}>{profile.phone}</a>]);
  if (profile.email) rows.push(["E-POSTA", <a href={`mailto:${profile.email}`}>{profile.email}</a>]);
  if (profile.address) rows.push(["ADRES", profile.address]);

  const ibans = links.filter((l) => l.type === "iban");
  const others = links.filter((l) => l.type !== "iban");
  ibans.forEach((l) => rows.push([(l.label || "IBAN").toLocaleUpperCase("tr-TR"), l.value]));

  return (
    <div className="plaka">
      <div className="metal">
        <div className="serial">
          <span>KARTVİZİT</span>
          <span>{new Date().getFullYear()}</span>
        </div>
        <h1>{profile.full_name}</h1>
        {profile.title && <p className="role">{profile.title}</p>}
      </div>
      {rows.length > 0 && (
        <div className="grid">
          {rows.map(([k, v], i) => (
            <div className="row" key={i}><b>{k}</b><span>{v}</span></div>
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div className="links">
          {others.map((l) => (
            <a key={l.id} href={hrefFor(l)} target="_blank" rel="noreferrer">
              {labelFor(l).toLocaleLowerCase("tr-TR")}
            </a>
          ))}
        </div>
      )}
      <a className="cta" href={vcardHref}>Rehbere ekle</a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="qr"><img src={qrSrc} alt="QR kod" /></div>
    </div>
  );
}

/* ---------------- PORTRE ---------------- */
function Portre({ profile, links, qrSrc, vcardHref }: ViewProps) {
  return (
    <div className="portre">
      <div className="hero">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="hero-img" src={profile.avatar_url} alt="" />
        ) : (
          <span className="ph">fotoğraf</span>
        )}
        <div className="hero-txt">
          <h1>{profile.full_name}</h1>
          {profile.title && <p className="role">{profile.title}</p>}
        </div>
      </div>
      <div className="body">
        <div className="contact">
          {profile.phone && <a href={`tel:${profile.phone}`}>{profile.phone}</a>}
          {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
          {profile.address && <span>{profile.address}</span>}
        </div>
        {links.length > 0 && (
          <div className="chips">
            {links.map((l) => {
              const Icon = LINK_ICONS[l.type] ?? Link2;
              return (
                <a key={l.id} href={hrefFor(l)} target="_blank" rel="noreferrer">
                  <Icon size={15} />{labelFor(l)}
                </a>
              );
            })}
          </div>
        )}
        <a className="cta" href={vcardHref}><UserPlus size={17} />Rehbere ekle</a>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="qr"><img src={qrSrc} alt="QR kod" /></div>
      </div>
    </div>
  );
}

/* ---------------- DİZGİ ---------------- */
function Dizgi({ profile, links, qrSrc, vcardHref }: ViewProps) {
  return (
    <div className="dizgi">
      <div className="top">
        <span>KARTVİZİT</span>
        <span>{profile.username}</span>
      </div>
      <h1>{profile.full_name}</h1>
      {profile.title && <p className="role">{profile.title}</p>}
      <div className="meta">
        {profile.phone && (
          <div><em>TEL</em><a href={`tel:${profile.phone}`}>{profile.phone}</a></div>
        )}
        {profile.email && (
          <div><em>MAİL</em><a href={`mailto:${profile.email}`}>{profile.email}</a></div>
        )}
        {profile.address && <div><em>ADRES</em><span>{profile.address}</span></div>}
      </div>
      {links.length > 0 && (
        <div className="links">
          {links.map((l) => (
            <a key={l.id} href={hrefFor(l)} target="_blank" rel="noreferrer">
              {labelFor(l)}
              <i>{l.type === "iban" ? l.value : ""}</i>
            </a>
          ))}
        </div>
      )}
      <a className="cta" href={vcardHref}>Rehbere ekle</a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="qr"><img src={qrSrc} alt="QR kod" /></div>
    </div>
  );
}
