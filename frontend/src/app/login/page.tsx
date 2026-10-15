import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-[#0d0b1a]">
            S
          </span>
          <span className="text-base font-semibold tracking-tight">Saige-Prep</span>
        </Link>
        <Card>
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>This is a private installation for its owner.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            {/* useSearchParams (for ?next=) is request-time data, so it must sit behind Suspense. */}
            <Suspense fallback={<Skeleton className="h-52 w-full" />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-subtle">
          No account? The owner account is created with the bootstrap script described in the README.
        </p>
      </div>
    </main>
  );
}
