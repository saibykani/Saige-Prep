import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-xl font-semibold">This page does not exist</h1>
      <p className="text-sm text-muted">Check the address, or head back to your dashboard.</p>
      <Link href="/dashboard" className="mt-2 text-sm text-accent hover:underline">
        Go to dashboard
      </Link>
    </main>
  );
}
