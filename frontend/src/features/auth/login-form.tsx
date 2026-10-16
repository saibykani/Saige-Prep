"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, KeyRound, LoaderCircle, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/feedback";
import { FieldError, Input, Label } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { safeNextPath, useLogin } from "./hooks";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Password is required").max(256),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, { onSuccess: () => router.replace(safeNextPath(searchParams.get("next"))) }),
  );

  const error = login.error;
  const errorMessage =
    error instanceof ApiError && error.status === 429
      ? "Too many attempts. Wait a few minutes and try again."
      : error?.message;
  const succeeded = login.isSuccess;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-label="Sign in">
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            className="h-11 bg-[#0b0b0d] pl-10"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </div>
        <FieldError id="email-error" message={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="h-11 bg-[#0b0b0d] pl-10 pr-11"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
        </div>
        <FieldError id="password-error" message={errors.password?.message} />
      </div>
      <button
        type="submit"
        disabled={login.isPending || succeeded}
        aria-busy={login.isPending || undefined}
        className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#a394f5] via-[#8b7aee] to-[#a394f5] bg-[length:200%_100%] text-sm font-semibold text-[#0d0b1a] shadow-lg shadow-[#7c6cf0]/25 transition-[background-position,transform,box-shadow] duration-500 hover:bg-[position:100%_0] hover:shadow-[#7c6cf0]/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {login.isPending || succeeded ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        Sign in
        {!login.isPending && !succeeded && (
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        )}
      </button>
    </form>
  );
}
