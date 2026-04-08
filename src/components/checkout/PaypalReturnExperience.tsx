"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useCart } from "@/components/cart/CartProvider";

export default function PaypalReturnExperience() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setError("Missing PayPal token.");
      return;
    }

    const run = async () => {
      try {
        const response = await fetch("/api/checkout/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json() as { status?: string; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to capture PayPal order.");
        }

        clearCart();
        setStatus("success");
      } catch (caughtError) {
        setStatus("error");
        setError(caughtError instanceof Error ? caughtError.message : "Unable to capture PayPal order.");
      }
    };

    void run();
  }, [clearCart, params]);

  return (
    <section className="bg-[var(--color-cream)] py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] border border-[var(--color-primary-light)]/70 bg-white/95 p-10 text-center shadow-[0_16px_38px_rgba(28,25,23,0.08)]">
          {status === "loading" ? <p>Processing PayPal payment...</p> : null}
          {status === "success" ? <p>PayPal payment completed successfully.</p> : null}
          {status === "error" ? <p className="text-red-600">{error}</p> : null}
          <Link href="/order" className="mt-6 inline-flex rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white">
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
