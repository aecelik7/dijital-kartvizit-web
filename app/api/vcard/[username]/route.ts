import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { username: string } }
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (!profile) {
    return new NextResponse("Not found", { status: 404 });
  }

  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.full_name}`,
    profile.title ? `TITLE:${profile.title}` : "",
    profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : "",
    profile.email ? `EMAIL:${profile.email}` : "",
    profile.address ? `ADR:;;${profile.address}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard",
      "Content-Disposition": `attachment; filename="${profile.username}.vcf"`,
    },
  });
}
