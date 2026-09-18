// Kart düzenleri. Mobil tarafta da birebir aynı id'ler kullanılır.

export type LayoutId = "kabartma" | "plaka" | "portre" | "dizgi";

export type CardLayout = {
  id: LayoutId;
  label: string;
  /** Uygulamada düzen seçicide gösterilen açıklama. */
  description: string;
};

export const LAYOUTS: Record<LayoutId, CardLayout> = {
  kabartma: {
    id: "kabartma",
    label: "Kabartma",
    description: "Gravür baskı: ince çerçeve, kabartma isim, tek harf monogram.",
  },
  plaka: {
    id: "plaka",
    label: "Plaka",
    description: "Kazınmış metal: IBAN, vergi no gibi bilgiler tabloda durur.",
  },
  portre: {
    id: "portre",
    label: "Portre",
    description: "Fotoğraf öne çıkar, isim üstünde durur. Fotoğraf gerektirir.",
  },
  dizgi: {
    id: "dizgi",
    label: "Dizgi",
    description: "Süsleme yok; isim büyük tipografiyle tasarımın kendisi.",
  },
};

export const LAYOUT_LIST = Object.values(LAYOUTS);

export function getLayout(id?: string | null): CardLayout {
  return LAYOUTS[(id as LayoutId) ?? "kabartma"] ?? LAYOUTS.kabartma;
}
