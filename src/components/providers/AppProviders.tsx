"use client";

import { SessionProvider } from "next-auth/react";

import { CartProvider } from "@/components/cart/CartProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
