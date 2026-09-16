import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { uid: string } }
) {
  const { data: card } = await supabase
    .from("nfc_cards")
    .select("profile_id, status, profiles(username)")
    .eq("card_uid", params.uid)
    .single();

  if (!card || card.status !== "assigned" || !card.profiles) {
    // Kart henüz hiçbir profile atanmamış — aktivasyon sayfasına yönlendir.
    return NextResponse.redirect(new URL(`/activate/${params.uid}`, req.url));
  }

  const username = (card.profiles as unknown as { username: string }).username;
  return NextResponse.redirect(new URL(`/${username}`, req.url));
}
