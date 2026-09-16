import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const origin = new URL(req.url).origin;
  const targetUrl = `${origin}/${params.username}`;

  const png = await QRCode.toBuffer(targetUrl, { width: 512 });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
