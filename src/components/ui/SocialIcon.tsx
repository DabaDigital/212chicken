import type { SocialLink } from "@/lib/site";

import { InstagramIcon } from "./InstagramIcon";
import { TikTokIcon } from "./TikTokIcon";

/** Monochrome network glyph (currentColor) on the shared 24px grid; decorative (aria-hidden). */
export function SocialIcon({ id, size = 20 }: { id: SocialLink["id"]; size?: number }) {
  return id === "instagram" ? <InstagramIcon size={size} /> : <TikTokIcon size={size} />;
}
