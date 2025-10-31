import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "@/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const rootDomain = env.NEXT_PUBLIC_ROOT_DOMAIN;
export const protocol = rootDomain.includes("localhost") ? "http" : "https";

/**
 * Returns the full URL for the app route
 * @returns {string} The app URL (e.g., http://localhost:3000/app or https://recuerdame.app/app)
 */
export function getAppUrl(): string {
  return `${protocol}://${rootDomain}/app`;
}
