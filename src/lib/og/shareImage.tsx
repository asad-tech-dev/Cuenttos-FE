import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import {
  PublicCuentto,
  cuenttoTitle,
  stripEmoji,
  truncate,
} from "@/lib/og/cuenttoShareMeta";
import { siteUrl } from "@/lib/og/siteUrl";

// The 1200×630 card every platform shows for a shared link. 1.91:1 is the
// size Facebook, LinkedIn, X ("summary_large_image") and WhatsApp all render
// as the large preview instead of a small cropped thumbnail.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
export const OG_ALT = "Cuentto";

// Brand tokens from globals.css; the app icon's background is exactly VIOLET.
const VIOLET = "#5D4DBE";
const DARK_VIOLET = "#25103A";
const LIGHT_VIOLET = "#E6DEFF";
const LIGHT_BEIGE = "#FCFBF2";
const DARK_GRAY = "#5C5F60";
const FONT = "DM Sans";

interface Assets {
  fonts: { name: string; data: ArrayBuffer; weight: 500 | 700; style: "normal" }[];
  icon: string | null;
}

const assetPath = (file: string) =>
  join(process.cwd(), "src/lib/og/assets", file);

const toArrayBuffer = (buf: Buffer): ArrayBuffer =>
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;

// Read once per server process. DM Sans is the mobile app's brand font; the
// icon is the official app icon. If either can't be read the card still
// renders (default font / text wordmark) rather than failing the image.
let assetsPromise: Promise<Assets> | null = null;
const loadAssets = (): Promise<Assets> => {
  assetsPromise ??= (async () => {
    const [bold, medium, icon] = await Promise.all([
      readFile(assetPath("DMSans-Bold.ttf")).catch(() => null),
      readFile(assetPath("DMSans-Medium.ttf")).catch(() => null),
      readFile(assetPath("cuentto-icon.png")).catch(() => null),
    ]);
    const fonts: Assets["fonts"] = [];
    if (bold) fonts.push({ name: FONT, data: toArrayBuffer(bold), weight: 700, style: "normal" });
    if (medium) fonts.push({ name: FONT, data: toArrayBuffer(medium), weight: 500, style: "normal" });
    return {
      fonts,
      icon: icon ? `data:image/png;base64,${icon.toString("base64")}` : null,
    };
  })();
  return assetsPromise;
};

const imageOptions = (assets: Assets) => ({
  ...OG_SIZE,
  ...(assets.fonts.length > 0 && { fonts: assets.fonts }),
  headers: {
    // Let crawlers and CDNs reuse it for a while; an edited title shows up
    // on the next scrape after that.
    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  },
});

function BrandMark({ icon, size }: { icon: string | null; size: number }) {
  return icon ? (
    <img src={icon} width={size} height={size} alt="" />
  ) : (
    <div style={{ display: "flex", color: "white", fontSize: size / 4, fontWeight: 700 }}>
      cuentto
    </div>
  );
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

// Longer titles step down so up to ~4 lines always fit the card.
const titleFontSize = (length: number) =>
  length <= 28 ? 72 : length <= 56 ? 60 : length <= 90 ? 50 : 42;

/** The preview for one public Cuentto: icon panel + title, mood and author. */
export async function cuenttoShareImage(cuentto: PublicCuentto) {
  const assets = await loadAssets();
  const title = truncate(stripEmoji(cuenttoTitle(cuentto)) || "A Cuentto", 120);
  const author = truncate(stripEmoji(cuentto.user.username) || "a writer", 40);
  const mood = truncate(stripEmoji(cuentto.mood?.title ?? ""), 28);
  const moodColor =
    cuentto.mood?.color && HEX_COLOR.test(cuentto.mood.color)
      ? cuentto.mood.color
      : LIGHT_VIOLET;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: LIGHT_BEIGE,
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            width: 420,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: VIOLET,
          }}
        >
          <BrandMark icon={assets.icon} size={360} />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
          }}
        >
          <div style={{ display: "flex", height: 48 }}>
            {mood && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 22px",
                  borderRadius: 999,
                  backgroundColor: moodColor,
                  color: DARK_VIOLET,
                  fontSize: 24,
                  fontWeight: 500,
                }}
              >
                {mood}
              </div>
            )}
          </div>
          <div
            style={{
              display: "block",
              color: DARK_VIOLET,
              fontSize: titleFontSize(title.length),
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -0.5,
              lineClamp: 4,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", color: DARK_GRAY, fontSize: 30, fontWeight: 500 }}>
              {`by ${author}`}
            </div>
            <div style={{ display: "flex", color: VIOLET, fontSize: 26, fontWeight: 700 }}>
              {siteUrl().host}
            </div>
          </div>
        </div>
      </div>
    ),
    imageOptions(assets),
  );
}

/** Site-wide preview: any link without its own (home, prompts, a private Cuentto). */
export async function brandShareImage() {
  const assets = await loadAssets();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
          padding: "0 96px",
          backgroundColor: VIOLET,
          fontFamily: FONT,
        }}
      >
        <BrandMark icon={assets.icon} size={400} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "white",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            <span>Free your mind,</span>
            <span>Write your mind</span>
          </div>
          <div style={{ display: "flex", color: LIGHT_VIOLET, fontSize: 30, fontWeight: 500 }}>
            {siteUrl().host}
          </div>
        </div>
      </div>
    ),
    imageOptions(assets),
  );
}
