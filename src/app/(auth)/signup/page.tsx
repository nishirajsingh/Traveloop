"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/validations";

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error || "Registration failed");
    } else {
      toast.success("Account created! Please sign in.");
      router.push("/login");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-text)] mb-2">Create account</h1>
        <p className="text-[var(--color-muted)] text-sm">Start planning your next adventure today.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Full Name</label>
          <input
            placeholder="John Doe"
            className="input-base"
            {...register("name")}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

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
            placeholder="Min 8 chars, 1 uppercase, 1 number"
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
          Create Account <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-sm text-[var(--color-muted)] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
