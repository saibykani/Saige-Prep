"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { DataControls } from "@/features/settings/data-controls";
import { SystemStatus } from "@/features/system/system-status";
import { isGuest } from "@/lib/auth-mode";

export function SettingsView() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" description="Your account, system status and data controls." />
      <div className="grid gap-6 lg:grid-cols-2">
        <DataControls />
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose light, dark, or follow your system setting. Saved on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle showLabels />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>This is a private, single-owner installation.</CardDescription>
          </CardHeader>
          <CardContent>
            {isGuest(user) ? (
              <p className="text-sm text-muted">
                Login is turned off, so the portal opens directly and you are browsing as a guest. No account is
                needed.
              </p>
            ) : user && (
              <dl className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
                <dt className="text-muted">Name</dt>
                <dd>{user.display_name}</dd>
                <dt className="text-muted">Email</dt>
                <dd className="break-all">{user.email}</dd>
                <dt className="text-muted">Role</dt>
                <dd>
                  <Badge tone={user.role === "admin" ? "accent" : "neutral"}>
                    {user.role === "admin" ? "Owner / Admin" : "Learner"}
                  </Badge>
                </dd>
                <dt className="text-muted">Member since</dt>
                <dd>{new Date(user.created_at).toLocaleDateString()}</dd>
              </dl>
            )}
          </CardContent>
        </Card>

        <SystemStatus />

        {!isGuest(user) && (
          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
              <CardDescription>Signing out revokes this session on the server.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                Sign out
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your data</CardTitle>
            <CardDescription>Export and account deletion are delivered with security hardening.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge tone="warning">Planned · Phase 8</Badge>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Sign out of Saige-Prep?"
        description="You will need your password to sign back in."
        confirmLabel="Sign out"
        loading={logout.isPending}
        onConfirm={() => logout.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
