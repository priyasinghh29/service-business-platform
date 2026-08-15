"use client";

import React, { useEffect, useState } from "react";
import { resolveUserProfileImageUrl } from "@/lib/userProfileImage";

type UserAvatarSize = "sm" | "md" | "lg";

const sizeMap: Record<UserAvatarSize, { box: string; icon: string; border: string }> = {
  sm: { box: "w-8 h-8", icon: "w-4 h-4", border: "border border-gray-200 dark:border-gray-600" },
  md: { box: "w-12 h-12", icon: "w-6 h-6", border: "border-2 border-gray-200 dark:border-gray-700" },
  lg: { box: "w-24 h-24", icon: "w-12 h-12", border: "border-4 border-gray-200 dark:border-gray-700" },
};

export interface UserAvatarProps {
  profilePic?: string | null;
  firstName?: string;
  lastName?: string;
  size?: UserAvatarSize;
  className?: string;
}

export default function UserAvatar({
  profilePic,
  firstName,
  lastName,
  size = "sm",
  className = "",
}: UserAvatarProps) {
  const [broken, setBroken] = useState(false);
  const url = resolveUserProfileImageUrl(profilePic);
  const showImage = Boolean(url) && !broken;
  const styles = sizeMap[size];

  useEffect(() => {
    setBroken(false);
  }, [profilePic]);

  const alt = `${firstName || "User"}${lastName ? ` ${lastName}` : ""}`.trim();

  if (showImage) {
    return (
      <img
        src={url!}
        alt={alt}
        className={`${styles.box} rounded-full object-cover ${styles.border} ${className}`}
        onError={() => setBroken(true)}
      />
    );
  }

  const initials = `${firstName?.[0] ?? "U"}${lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div
      className={`${styles.box} rounded-full bg-[#007aff] flex items-center justify-center shrink-0 text-white text-xs font-semibold ${styles.border} ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
