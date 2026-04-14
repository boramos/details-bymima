"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type ActivatedCard = {
  id: string;
  code: string;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  deliveryMethod: string;
  initialAmountUsd: number;
};

export function GiftCardSuccessExperience() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [cards, setCards] = useState<ActivatedCard[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMessage("No session found. Please contact support.");
      return;
    }

    void fetch("/api/gift-cards/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        const data = (await res.json()) as {
          success?: boolean;
          cards?: ActivatedCard[];
          error?: string;
        };

        if (!res.ok || !data.success || !data.cards) {
          throw new Error(data.error ?? "Activation failed.");
        }

        setCards(data.cards);
        setStatus("success");
      })
      .catch((err: unknown) => {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      });
  }, [sessionId]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
          <p className="text-sm font-medium text-slate-500">Activating your gift cards…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg aria-hidden="true" className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
          <p className="mt-1 text-xs text-slate-400">Your payment was captured. Please contact us and we&apos;ll sort it out immediately.</p>
          <Link
            href="/gift-cards"
            className="mt-6 inline-block rounded-full bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Back to Gift Cards
          </Link>
        </div>
      </div>
    );
  }

  const CARD_GRADIENTS = [
    "from-rose-400 to-pink-600",
    "from-emerald-400 to-teal-600",
    "from-amber-400 to-orange-500",
    "from-violet-500 to-purple-700",
  ];
  const CARD_EMOJIS = ["🌸", "🌿", "🌼", "💜"];

  const deliveryLabel = (method: string) => {
    if (method === "TEXT") return "Sent by SMS";
    if (method === "PHYSICAL") return "Physical card shipping";
    return "Sent by email";
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 px-4 py-16">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
          <svg aria-hidden="true" className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-slate-900">
          {cards.length === 1 ? "Your gift card is ready!" : `${cards.length} gift cards are ready!`}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {deliveryLabel(cards[0]?.deliveryMethod ?? "EMAIL")}
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl space-y-4">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className="rounded-2xl bg-white p-5 shadow-md shadow-rose-900/5"
          >
            <div className={`mb-4 aspect-[1.58/1] w-full max-w-[240px] mx-auto rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} p-4 flex flex-col justify-between text-white shadow-sm relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),transparent)]" />
              <div className="relative z-10 flex justify-between items-start">
                <span className="font-[family-name:var(--font-playfair)] text-sm font-bold">MIMA</span>
                <span className="text-base">{CARD_EMOJIS[i % CARD_EMOJIS.length]}</span>
              </div>
              <div className="relative z-10 text-left">
                <p className="text-2xl font-bold font-mono">${card.initialAmountUsd}</p>
              </div>
            </div>

            {card.recipientName && (
              <p className="text-center text-xs text-slate-400 mb-2">
                For <span className="font-semibold text-slate-600">{card.recipientName}</span>
              </p>
            )}

            <button
              type="button"
              onClick={() => void copyCode(card.code)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-rose-300 hover:bg-white"
            >
              <span className="font-mono text-sm font-bold tracking-widest text-slate-900">{card.code}</span>
              <span className="ml-3 text-xs font-semibold text-rose-500">
                {copiedCode === card.code ? "Copied!" : "Copy"}
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
        <Link
          href="/gift-cards"
          className="flex-1 rounded-full border border-rose-200 py-3 text-center text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          Send another
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-full bg-rose-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
