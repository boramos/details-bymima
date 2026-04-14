"use client";

import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

type LoginTwoFactorFormProps = {
  email: string;
  locale: string;
  redirectTo?: string;
};

export default function LoginTwoFactorForm({ email, locale, redirectTo = "/account" }: LoginTwoFactorFormProps) {
  const isEs = locale === "es";
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    fetch(`/api/user/2fa/sandbox-code?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data: { sandboxCode: string | null }) => {
        if (data.sandboxCode) setSandboxCode(data.sandboxCode);
      })
      .catch(() => {});
  }, [email]);

  async function handleSubmit(event: Parameters<NonNullable<ComponentPropsWithoutRef<"form">["onSubmit"]>>[0]) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await signIn("credentials", {
        email,
        twoFactorCode: code,
        redirect: false,
        redirectTo,
      });

      if (result?.error) {
        setMessage(isEs ? "Código inválido o expirado." : "Invalid or expired code.");
        return;
      }

      if (result?.ok) {
        window.location.href = redirectTo;
      }
    } catch {
      setMessage(isEs ? "No se pudo completar el inicio de sesión." : "Could not complete sign in.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-[var(--color-primary-pale)] bg-white/80 p-8 shadow-[0_16px_38px_rgba(28,25,23,0.08)] backdrop-blur-xl sm:p-10">
      <div className="mb-8 space-y-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-[var(--color-primary)] transition-colors hover:text-[var(--color-dark)]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {isEs ? "Volver al login" : "Back to login"}
        </Link>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            {isEs ? "Verificación por SMS" : "SMS verification"}
          </p>
          <h1 className="mt-2 text-3xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
            {isEs ? "Ingresa tu código" : "Enter your code"}
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            {isEs
              ? "Ingresa el código enviado al número de teléfono asociado a tu cuenta."
              : "Enter the code sent to the phone number associated with your account."}
          </p>
        </div>
      </div>

      {!email && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {isEs ? "Falta el correo del usuario. Regresa e inicia sesión otra vez." : "Missing email. Go back and sign in again."}
        </div>
      )}

      {sandboxCode && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            🧪 {isEs ? "Modo sandbox — código de prueba" : "Sandbox mode — test code"}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-[0.4em] text-amber-800">{sandboxCode}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <input
            id="twoFactorCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-xl border border-[var(--color-primary-light)]/70 bg-white px-4 py-3 text-center text-lg tracking-[0.4em] text-[var(--color-dark)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            placeholder={isEs ? "Código de verificación" : "Verification code"}
            required
            disabled={!email || isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!email || code.length !== 6 || isLoading}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {isLoading ? (isEs ? "Verificando..." : "Verifying...") : (isEs ? "Completar ingreso" : "Complete sign in")}
        </button>
      </form>
    </div>
  );
}
