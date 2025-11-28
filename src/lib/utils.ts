import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Pusher from "pusher"
import PusherClient from "pusher-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Pusher Server (for server-side)
export const pusherServer = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.NEXT_PUBLIC_PUSHER_APP_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTOR!,
  useTLS: true,
})

// Pusher Client (for client-side)
export const pusherClient =
  typeof window !== "undefined"
    ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTOR!,
      })
    : (null as unknown as PusherClient)

// Utility functions
export function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[month] || ""
}

export function extractEmailsFromString(text: string): string[] | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = text.match(emailRegex)
  return matches && matches.length > 0 ? matches : null
}

export function extractURLfromString(text: string): string[] | null {
  const urlRegex =
    /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/g
  const matches = text.match(urlRegex)
  return matches && matches.length > 0 ? matches : null
}

export function extractUUIDFromString(text: string): string[] | null {
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
  const matches = text.match(uuidRegex)
  return matches && matches.length > 0 ? matches : null
}

export function postToParent(data: string): void {
  if (typeof window !== "undefined" && window.parent) {
    window.parent.postMessage(data, "*")
  }
}

/**
 * Normalizes Uploadcare image URLs for display
 * Handles both full URLs and UUID-only values
 * Uses 62atahsk05.ucarecd.net CDN domain
 * 
 * Uploadcare CDN format:
 * - https://62atahsk05.ucarecd.net/{uuid}/{filename}
 * - https://62atahsk05.ucarecd.net/{uuid}/
 * 
 * If only UUID is provided, we use the configured CDN subdomain.
 * Automatically converts ucarecdn.com URLs to 62atahsk05.ucarecd.net format.
 * For best results, store the full cdnUrl from Uploadcare upload response.
 */
export function getUploadcareImageUrl(value: string | null | undefined): string {
  if (!value) return ''
  
  // Get CDN subdomain from environment variable or use default
  const cdnSubdomain = process.env.NEXT_PUBLIC_UPLOADCARE_CDN_SUBDOMAIN || '62atahsk05'
  const cdnBaseUrl = `https://${cdnSubdomain}.ucarecd.net`
  
  // If it's already a full URL, convert ucarecdn.com to new format or return as-is
  if (value.startsWith('http://') || value.startsWith('https://')) {
    // Convert ucarecdn.com URLs to 62atahsk05.ucarecd.net
    if (value.includes('ucarecdn.com')) {
      return value.replace(/https?:\/\/ucarecdn\.com\//, `${cdnBaseUrl}/`)
    }
    return value
  }
  
  // Check if it's a UUID pattern (with or without filename)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  // If it contains a slash, it might be uuid/filename format
  if (value.includes('/')) {
    const parts = value.split('/')
    const uuid = parts[0]
    // If first part is a UUID, construct URL with filename
    if (uuidPattern.test(uuid)) {
      // Use subdomain CDN format with filename
      return `${cdnBaseUrl}/${value}`
    }
  }
  
  // If it's a pure UUID, use subdomain CDN format
  if (uuidPattern.test(value)) {
    return `${cdnBaseUrl}/${value}/`
  }
  
  // Fallback: assume it might be a partial URL or UUID and try subdomain format
  return `${cdnBaseUrl}/${value}/`
}
