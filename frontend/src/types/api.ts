export type UserRole = "admin" | "learner";

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

export interface SessionResponse {
  user: User;
  expires_at: string;
}

export interface HealthResponse {
  status: "ok";
  app: string;
  version: string;
}

export interface ReadinessResponse {
  status: "ready" | "not_ready";
  checks: { name: string; ok: boolean }[];
  ai_enabled: boolean;
}
