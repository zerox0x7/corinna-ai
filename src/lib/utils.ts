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
