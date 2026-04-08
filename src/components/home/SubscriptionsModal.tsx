"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { LandingDictionary } from "@/lib/i18n";

type SubscriptionsModalProps = {
  checkoutUi: LandingDictionary["checkoutUi"];
};

export default function SubscriptionsModal({ checkoutUi }: SubscriptionsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (session) {
      return;
    }

    const lastShownTimestamp = localStorage.getItem("subscriptions-modal-last-shown");
    const now = Date.now();
    const minInterval = 15 * 60 * 1000;
    const maxInterval = 20 * 60 * 1000;
    const randomInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;

    if (lastShownTimestamp) {
      const timeSinceLastShown = now - parseInt(lastShownTimestamp);
      
      if (timeSinceLastShown < randomInterval) {
        return;
      }
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem("subscriptions-modal-last-shown", now.toString());
    }, 3000);

    return () => clearTimeout(timer);
  }, [session, status]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSubmitting(false);
    setIsOpen(false);
    setEmail("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white p-6 shadow-[0_20px_50px_rgba(28,25,23,0.15)]">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-primary-light)]/70 text-[var(--color-muted)] transition-all hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]"
          aria-label="Close"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-50">
              <span className="text-3xl">💐</span>
            </div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
              {checkoutUi.subscribeAndSaveTitle}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
              {checkoutUi.subscribeAndSaveDescription}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-primary-light)]/80 bg-[var(--color-primary-pale)]/30 p-4">
            <div className="flex items-center justify-center gap-2">
              <span className="rounded bg-[var(--color-primary)] px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {checkoutUi.subscribeAndSaveDiscount}
              </span>
              <span className="text-sm font-semibold text-[var(--color-dark)]">
                {checkoutUi.subscribeModalNextPurchase}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={checkoutUi.emailPlaceholder}
              required
              className="w-full rounded-full border border-[var(--color-primary-light)]/70 px-5 py-3 text-sm text-[var(--color-dark)] bg-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? checkoutUi.submitting : checkoutUi.continueButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
