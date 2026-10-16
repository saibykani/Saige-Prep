import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/feedback";
import { AuroraBackdrop, FloatingTools, LoginHero } from "@/features/auth/login-hero";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <AuroraBackdrop />
      <LoginHero />

      <main className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-12 lg:w-[480px] lg:shrink-0 xl:w-[540px]">
        {/* On small screens the tools float behind the card instead of in a side panel. */}
        <div className="opacity-40 lg:hidden">
          <FloatingTools dense={false} />
        </div>

        <div className="animate-fade-in relative z-10 w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 lg:justify-start">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#b9adf8] to-[#7c6cf0] text-sm font-bold text-[#0d0b1a] shadow-lg shadow-[#7c6cf0]/30">
              S
            </span>
            <span className="text-lg font-semibold tracking-tight">Saige-Prep</span>
          </Link>

          <p className="mb-6 text-center text-sm text-muted lg:hidden">Learn. Practice. Test. Get Hired.</p>

          <div className="glow-border rounded-2xl p-px shadow-2xl shadow-black/60">
            <div className="relative rounded-[15px] bg-[#111113]/95 p-7 backdrop-blur-xl">
              <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
              <p className="mt-1 text-sm text-muted">Sign in to continue your preparation.</p>
              <div className="mt-6">
                {/* useSearchParams (for ?next=) is request-time data, so it must sit behind Suspense. */}
                <Suspense fallback={<Skeleton className="h-60 w-full" />}>
                  <LoginForm />
                </Suspense>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-subtle">
            Private installation. The owner account is created with the bootstrap script in the README.
          </p>
        </div>
      </main>
    </div>
  );
}
