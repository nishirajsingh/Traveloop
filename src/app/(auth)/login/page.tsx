"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/validations";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-text)] mb-2">Welcome back</h1>
        <p className="text-[var(--color-muted)] text-sm">Sign in to continue planning your trips.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input-base"
            {...register("email")}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="input-base"
            {...register("password")}
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center py-3 mt-2"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-muted)] text-center mb-3">Demo credentials</p>
        <div className="surface-2 rounded-xl p-3 text-center">
          <p className="mono text-xs text-[var(--color-text)]">demo@traveloop.com</p>
          <p className="mono text-xs text-[var(--color-muted)]">Demo1234</p>
        </div>
      </div>

      <p className="text-center text-sm text-[var(--color-muted)] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--color-primary)] font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
