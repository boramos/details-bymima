"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { LandingDictionary } from "@/lib/i18n";

type PassportBannerProps = {
  ui: {
    passportTitle: string;
    passportDescription: string;
    passportPromoPrice: string;
    passportRegularPrice: string;
  };
};

type PassportStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAUSED" | null;

export function PassportBanner({ ui }: PassportBannerProps) {
  const { data: session, status } = useSession();
  const [passportStatus, setPassportStatus] = useState<PassportStatus>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    fetch("/api/passport")
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setPassportStatus(data.data.status);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status]);

  if (loading || status === "loading") {
    return null;
  }

  if (passportStatus === "ACTIVE") {
    return (
      <section className="bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary-pale)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 rounded-[2rem] border border-[var(--color-primary)]/20 bg-white/40 backdrop-blur-xl p-8 shadow-[0_24px_70px_rgba(28,25,23,0.08)] md:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
                  {ui.passportTitle} Member ✓
                </h2>
                <p className="mt-1 text-[var(--color-muted)]">Enjoying free delivery all year</p>
              </div>
            </div>
            <Link
              href="/account"
              className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-white px-8 py-3 text-sm font-bold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)] hover:text-white"
            >
              Manage Membership
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary-pale)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] border border-[var(--color-primary)]/20 bg-white/50 backdrop-blur-xl shadow-[0_32px_90px_rgba(28,25,23,0.12)]">
          <div className="grid gap-12 p-10 md:grid-cols-2 md:items-center md:p-14">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Limited Time Offer
              </div>
              <div>
                <h2 className="text-4xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] lg:text-5xl">
                  {ui.passportTitle}
                </h2>
                <p className="mt-3 text-xl font-medium text-[var(--color-primary)]">
                  {ui.passportDescription}
                </p>
              </div>
              
              <div className="space-y-3">
                {[
                  "Free delivery on all orders",
                  "Member-exclusive discounts",
                  "Priority customer support",
                  "Early access to new collections",
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[var(--color-muted)]">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-primary)]">
                    {ui.passportPromoPrice}
                  </span>
                  <span className="text-xl text-[var(--color-muted)] line-through">
                    {ui.passportRegularPrice}
                  </span>
                </div>
                <span className="text-sm text-[var(--color-muted)]">/ year</span>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-10 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                Get Passport
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] p-1 shadow-2xl">
                <div className="flex h-full items-center justify-center rounded-[1.8rem] bg-white">
                  <div className="text-center space-y-4 p-8">
                    <svg className="w-24 h-24 mx-auto text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-5xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">$10</p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">Saved per year</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
