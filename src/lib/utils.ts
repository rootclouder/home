import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return url

  if (url.startsWith("/uploads/")) return url
  if (url.startsWith("uploads/")) return `/${url}`

  let normalized = url
  if (normalized.startsWith("//")) normalized = `https:${normalized}`
  if (!/^https?:\/\//i.test(normalized)) return normalized

  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    return normalized
  }

  if (parsed.protocol === "https:" && parsed.hostname.endsWith(".blob.vercel-storage.com")) {
    return `/api/media/proxy?url=${encodeURIComponent(normalized)}`
  }

  return normalized
}
