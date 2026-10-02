import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

/*
 * Branded social card (1200×630), generated once at build time from the asset pack:
 * the real logo, the exploded hero burger and the Anton / DM Sans TTF files.
 */
export const dynamic = "force-static";

const PACK = path.join(process.cwd(), "212-chicken-assets", "212-chicken-assets");

const toDataUrl = (buffer: Buffer) => `data:image/png;base64,${buffer.toString("base64")}`;

export async function GET() {
  const [anton, dmSans, burger, logo] = await Promise.all([
    readFile(path.join(PACK, "fonts", "anton-400.ttf")),
    readFile(path.join(PACK, "fonts", "dm-sans-600.ttf")),
    readFile(path.join(PACK, "images", "hero", "burger-exploded.png")),
    readFile(path.join(PACK, "images", "brand", "logo.png")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#FFF8E8",
          color: "#201207",
          fontFamily: "Anton",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: 70,
            display: "flex",
            fontSize: 470,
            lineHeight: 0.8,
            color: "#FF7F24",
          }}
        >
          212
        </div>
        <div
          style={{
            position: "absolute",
            left: -40,
            right: -40,
            bottom: 34,
            height: 64,
            display: "flex",
            alignItems: "center",
            background: "#FF4D00",
            color: "#FFF8E8",
            fontSize: 34,
            transform: "rotate(-3deg)",
            paddingLeft: 60,
            letterSpacing: 1,
          }}
        >
          CRISPY • JUICY • 212 CHICKEN • CRISPY • JUICY • 212 CHICKEN • CRISPY • JUICY
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
        <img
          src={toDataUrl(burger)}
          width={600}
          height={600}
          alt=""
          style={{ position: "absolute", right: 40, top: -10 }}
        />
        <div style={{ display: "flex", flexDirection: "column", padding: "48px 0 0 64px", width: 660 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img src={toDataUrl(logo)} width={57} height={110} alt="" />
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 124, lineHeight: 0.95 }}>
            <span>ÇA CROQUE.</span>
            <span style={{ color: "#FF4D00" }}>ÇA CLAQUE.</span>
          </div>
          <div style={{ display: "flex", marginTop: 22, fontFamily: "DM Sans", fontSize: 30 }}>
            Du poulet croustillant. Du goût. Du vrai.
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "DM Sans", data: dmSans, weight: 600, style: "normal" },
      ],
    },
  );
}
