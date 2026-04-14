"use client";

import { useState } from "react";
import Link from "next/link";
import { getSession, signIn, signOut } from "next-auth/react";

import type { LandingDictionary } from "@/lib/i18n";

export default function AdminLoginForm({ content }: { content: LandingDictionary["loginUi"] }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (result?.code === "two_factor_required") {
        window.location.href = `/login/2fa?email=${encodeURIComponent(email)}&redirectTo=/admin`;
        return;
      }

      if (result?.error) {
        setAuthError(content.errorInvalidCredentials);
        return;
      }

      const session = await getSession();
      if (session?.user?.role !== "admin") {
        await signOut({ redirect: false });
        setAuthError("Esta cuenta no tiene acceso al panel de administración.");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setAuthError(content.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Admin access</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Entrar al panel</h1>
        <p className="text-sm leading-relaxed text-slate-600">Acceso exclusivo para administrar productos, configuración, contenido y publicidad.</p>
      </div>

      {authError ? (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{authError}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2 block">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={content.emailPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div className="space-y-2 block">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={content.passwordPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 px-4 text-sm text-slate-500 transition hover:text-slate-900"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Entrando..." : "Entrar al panel"}
        </button>
      </form>

      <Link href="/" className="mt-6 inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950">
        ← {content.backToHome}
      </Link>
    </div>
  );
}
