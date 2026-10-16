import type { User } from "@/types/api";

/**
 * Sign-in is optional for now: the app is open unless NEXT_PUBLIC_AUTH_REQUIRED=true
 * is set at build time. The backend still enforces auth on its own protected endpoints.
 */
export function authRequired(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_REQUIRED === "true";
}

export const GUEST_USER: User = {
  id: "guest",
  email: "guest@saige-prep.local",
  display_name: "Guest",
  role: "learner",
  created_at: "1970-01-01T00:00:00.000Z",
};

export function isGuest(user: User | undefined): boolean {
  return user?.id === GUEST_USER.id;
}
