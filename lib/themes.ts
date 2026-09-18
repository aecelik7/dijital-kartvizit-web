// Kart renk temaları. Mobil tarafta da birebir aynısı kullanılır.
// Yeni tema eklerken supabase/layout.sql'deki CHECK listesini de güncelle.

export type ThemeId =
  | "koyu"
  | "siyah"
  | "antrasit"
  | "lacivert"
  | "altin"
  | "renkli"
  | "acik";

export type CardTheme = {
  id: ThemeId;
  label: string;
  /** Açık temada kabartma/gölge yönü ters çevrilir. */
  light: boolean;
  bg: string;
  surface: string;
  rule: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  /** Portre düzeninin hero gradyanı ve renk karesi için. */
  from: string;
  to: string;
};

export const THEMES: Record<ThemeId, CardTheme> = {
  koyu: {
    id: "koyu", label: "Koyu", light: false,
    bg: "#111214", surface: "#1C1D21", rule: "#2B2C31",
    text: "#F4F1EA", muted: "#9A9CA3",
    accent: "#C7A56A", onAccent: "#111214",
    from: "#232A3B", to: "#171B26",
  },
  siyah: {
    id: "siyah", label: "Siyah", light: false,
    bg: "#000000", surface: "#0E0E0E", rule: "#1F1F1F",
    text: "#FFFFFF", muted: "#8A8A8A",
    accent: "#FFFFFF", onAccent: "#000000",
    from: "#1C1C1C", to: "#000000",
  },
  antrasit: {
    id: "antrasit", label: "Antrasit", light: false,
    bg: "#1A1C1E", surface: "#25282B", rule: "#34383C",
    text: "#EDEFF1", muted: "#9BA1A7",
    accent: "#A9B4BF", onAccent: "#1A1C1E",
    from: "#3A3F44", to: "#22262A",
  },
  lacivert: {
    id: "lacivert", label: "Lacivert", light: false,
    bg: "#0B1020", surface: "#141B31", rule: "#222B47",
    text: "#EFF3FF", muted: "#95A0C0",
    accent: "#7FA8E8", onAccent: "#0B1020",
    from: "#1E2A53", to: "#0D1428",
  },
  altin: {
    id: "altin", label: "Altın", light: false,
    bg: "#14120C", surface: "#1F1B12", rule: "#332C1D",
    text: "#F8F3E6", muted: "#C9B48A",
    accent: "#E8C97E", onAccent: "#14120C",
    from: "#8A6F3E", to: "#40331B",
  },
  renkli: {
    id: "renkli", label: "Renkli", light: false,
    bg: "#140F1E", surface: "#1F1730", rule: "#332748",
    text: "#F7F2FF", muted: "#BCA8D8",
    accent: "#FFB86B", onAccent: "#140F1E",
    from: "#6D3BC4", to: "#C0397A",
  },
  acik: {
    id: "acik", label: "Açık", light: true,
    bg: "#EFECE4", surface: "#FFFFFF", rule: "#D5D0C4",
    text: "#16171A", muted: "#6B6D73",
    accent: "#1F2937", onAccent: "#FFFFFF",
    from: "#FFFFFF", to: "#E6E1D6",
  },
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(id?: string | null): CardTheme {
  return THEMES[(id as ThemeId) ?? "koyu"] ?? THEMES.koyu;
}

/** Temayı CSS değişkenlerine çevirir; tüm düzenler bu değişkenleri okur. */
export function themeVars(t: CardTheme): Record<string, string> {
  const emboss = t.light
    ? "0 1px 0 rgba(255,255,255,.9), 0 -1px 1px rgba(0,0,0,.18)"
    : "0 1px 0 rgba(255,255,255,.16), 0 -1px 1px rgba(0,0,0,.6)";

  return {
    "--bg": t.bg,
    "--surface": t.surface,
    "--rule": t.rule,
    "--text": t.text,
    "--muted": t.muted,
    "--accent": t.accent,
    "--on-accent": t.onAccent,
    "--accent-soft": `${t.accent}55`,
    "--card-from": t.from,
    "--card-to": t.to,
    "--emboss": emboss,
    "--sheen": t.light ? "rgba(0,0,0,.035)" : "rgba(255,255,255,.035)",
    "--metal-hi": t.light ? "#FFFFFF" : t.from,
    "--metal-lo": t.light ? "#DCD7CB" : t.to,
    "--metal-mid": t.light ? "#E9E4D9" : t.surface,
    "--scrim": t.bg,
    "--ghost": t.light ? "rgba(0,0,0,.09)" : "rgba(255,255,255,.1)",
  };
}
