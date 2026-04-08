"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { type LandingDictionary } from "@/lib/i18n";

type LoginFormProps = {
  content: LandingDictionary["loginUi"];
};

export default function LoginForm({ content }: LoginFormProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleProviderSignIn = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signIn(provider, { callbackUrl: "/account" });
    } catch {
      setAuthError(content.errorGeneric);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    if (!isLoginTab) {
      if (password !== passwordConfirm) {
        setAuthError(content.errorPasswordMismatch);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, passwordConfirm, phone: "" }),
        });

        const data = await response.json();

        if (!response.ok) {
          setAuthError(data.error || content.errorGeneric);
          setIsLoading(false);
          return;
        }

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/account",
        });

        if (result?.error) {
          setAuthError(content.errorInvalidCredentials);
        } else if (result?.ok) {
          window.location.href = "/account";
        }
      } catch {
        setAuthError(content.errorGeneric);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/account",
      });

      if (result?.error) {
        setAuthError(content.errorInvalidCredentials);
      } else if (result?.ok) {
        window.location.href = "/account";
      }
    } catch {
      setAuthError(content.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full rounded-3xl bg-[var(--color-cream)] shadow-[0_16px_38px_rgba(28,25,23,0.08)] border border-[var(--color-primary-pale)] overflow-hidden min-h-[600px]">
      <div className="lg:w-5/12 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary-pale)] p-10 flex flex-col justify-between relative overflow-hidden hidden lg:flex">
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] rounded-full bg-gradient-to-tr from-[var(--color-primary)]/10 to-transparent blur-3xl" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-dark)] transition-colors text-sm font-medium tracking-wide">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {content.backToHome}
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] leading-tight text-balance">
            {content.pageTitle}
          </h1>
          <p className="text-base xl:text-lg text-[var(--color-muted)] max-w-sm text-balance">
            {content.pageSubtitle}
          </p>
        </div>

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center border border-white/50 text-[var(--color-primary)]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="lg:w-7/12 p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center bg-white/50 backdrop-blur-xl relative">
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-dark)] transition-colors text-sm font-medium tracking-wide">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {content.backToHome}
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="flex p-1 bg-[var(--color-primary-pale)] rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setIsLoginTab(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                isLoginTab
                  ? "bg-white text-[var(--color-dark)] shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-dark)]"
              }`}
            >
              {content.tabLogin}
            </button>
            <button
              type="button"
              onClick={() => setIsLoginTab(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                !isLoginTab
                  ? "bg-white text-[var(--color-dark)] shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-dark)]"
              }`}
            >
              {content.tabRegister}
            </button>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium flex items-start gap-3" role="alert">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-5">
            {!isLoginTab && (
              <div className="space-y-1.5 animate-fade-in-up">
                <label htmlFor="name" className="block text-sm font-medium text-[var(--color-dark)]">
                  {content.nameLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-muted)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={content.namePlaceholder}
                    className="w-full rounded-xl border border-[var(--color-primary-light)]/70 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-muted)]/60"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-dark)]">
                {content.emailLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-muted)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.emailPlaceholder}
                  className="w-full rounded-xl border border-[var(--color-primary-light)]/70 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-muted)]/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-[var(--color-dark)]">
                  {content.passwordLabel}
                </label>
                {isLoginTab && (
                  <Link href="/forgot-password" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors">
                    {content.forgotPassword}
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-muted)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={content.passwordPlaceholder}
                  className="w-full rounded-xl border border-[var(--color-primary-light)]/70 bg-white py-3 pl-11 pr-12 text-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-muted)]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--color-muted)] hover:text-[var(--color-dark)] transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isLoginTab && (
              <>
                <div className="space-y-1.5 animate-fade-in-up">
                  <label htmlFor="passwordConfirm" className="block text-sm font-medium text-[var(--color-dark)]">
                    {content.passwordConfirmLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-muted)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="passwordConfirm"
                      type={showPasswordConfirm ? "text" : "password"}
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder={content.passwordConfirmPlaceholder}
                      className="w-full rounded-xl border border-[var(--color-primary-light)]/70 bg-white py-3 pl-11 pr-12 text-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-muted)]/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      aria-label={showPasswordConfirm ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--color-muted)] hover:text-[var(--color-dark)] transition-colors focus:outline-none"
                    >
                      {showPasswordConfirm ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password || (!isLoginTab && (!name || !passwordConfirm))}
              className="w-full mt-2 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              {isLoginTab ? content.loginButton : content.registerButton}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="h-px bg-[var(--color-primary-light)]/50 flex-1"></div>
            <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">{content.orDivider}</span>
            <div className="h-px bg-[var(--color-primary-light)]/50 flex-1"></div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => handleProviderSignIn("google")}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-[var(--color-primary-light)]/60 bg-white px-6 py-3.5 text-sm font-semibold text-[var(--color-dark)] transition-all hover:bg-[var(--color-cream)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {content.googleButton}
            </button>
            <button
              type="button"
              onClick={() => handleProviderSignIn("apple")}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.05 13.92c-.02-2.14 1.76-3.18 1.84-3.23-1-1.46-2.55-1.66-3.11-1.69-1.32-.13-2.57.78-3.25.78-.68 0-1.7-.75-2.8-.73-1.42.02-2.73.83-3.46 2.1-1.48 2.57-.38 6.38 1.06 8.46.7 1.02 1.53 2.16 2.65 2.12 1.08-.04 1.5-.7 2.81-.7s1.7.7 2.83.68c1.15-.02 1.87-1.04 2.55-2.04.79-1.15 1.11-2.27 1.13-2.33-.02-.02-2.02-.78-2.05-3.08l-.16-.24m-1.38-5.32c.59-.72.99-1.71.88-2.71-.95.04-2 .63-2.61 1.34-.54.63-1.02 1.63-.9 2.62 1.05.08 2.05-.53 2.63-1.25" />
              </svg>
              {content.appleButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
