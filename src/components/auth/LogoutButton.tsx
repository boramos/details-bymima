"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type LogoutButtonProps = {
  className?: string;
  children: ReactNode;
};

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  };

  return (
    <button type="button" onClick={() => void handleLogout()} className={className}>
      {children}
    </button>
  );
}
