import type { User } from "@/types/api";

/**
 * Login is turned off: the owner asked for the portal to open directly with no sign-in.
 * Everyone browses as GUEST_USER. The login form and backend auth code are kept so
 * sign-in can be restored later by making this return true again.
 */
export function authRequired(): boolean {
  return false;
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
