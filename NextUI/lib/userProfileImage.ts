import { getStorageOrigin } from "@/lib/api-base";
import { imgSrc } from "@/lib/safe-image-src";

export function resolveUserProfileImageUrl(profilePic?: string | null): string | null {
  if (!profilePic?.trim()) return null;

  const pic = profilePic.trim();
  if (pic.startsWith("http://") || pic.startsWith("https://") || pic.startsWith("data:")) {
    return imgSrc(pic);
  }

  const origin = getStorageOrigin();
  const path = pic.startsWith("/") ? pic : `/storage/${pic}`;
  return imgSrc(`${origin}${path}`);
}
