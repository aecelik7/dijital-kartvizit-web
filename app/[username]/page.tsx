import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Link = {
  id: string;
  type: string;
  label: string | null;
  value: string;
  sort_order: number;
};

async function getProfile(username: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("profile_id", profile.id)
    .order("sort_order", { ascending: true });

  return { profile, links: (links ?? []) as Link[] };
}

// Paylaşırken WhatsApp/Instagram/LinkedIn önizlemesi (og:image, og:title) için.
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const data = await getProfile(params.username);
  if (!data) return {};

  const { profile } = data;
  return {
    title: `${profile.full_name} | Dijital Kartvizit`,
    description: profile.title ?? undefined,
    openGraph: {
      title: profile.full_name,
      description: profile.title ?? undefined,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

const LINK_LABELS: Record<string, string> = {
  website: "Web Sitesi",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  phone: "Telefon",
  email: "E-posta",
  address: "Adres",
  iban: "IBAN",
  custom: "",
};

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const data = await getProfile(params.username);
  if (!data) notFound();

  const { profile, links } = data;

  return (
    <main className="profile">
      <div className="card">
        {profile.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="avatar" src={profile.avatar_url} alt={profile.full_name} />
        )}
        <h1>{profile.full_name}</h1>
        {profile.title && <p className="title">{profile.title}</p>}

        <div className="contact">
          {profile.phone && <a href={`tel:${profile.phone}`}>{profile.phone}</a>}
          {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
        </div>

        {profile.address && <p className="address">{profile.address}</p>}

        <ul className="links">
          {links.map((link) => (
            <li key={link.id}>
              <a href={hrefFor(link)} target="_blank" rel="noreferrer">
                {link.label || LINK_LABELS[link.type] || link.type}
              </a>
            </li>
          ))}
        </ul>

        <a className="save-contact" href={`/api/vcard/${profile.username}`}>
          Rehbere Ekle
        </a>
      </div>
    </main>
  );
}

function hrefFor(link: Link) {
  switch (link.type) {
    case "whatsapp":
      return `https://wa.me/${link.value.replace(/\D/g, "")}`;
    case "email":
      return `mailto:${link.value}`;
    case "phone":
      return `tel:${link.value}`;
    default:
      return link.value;
  }
}
