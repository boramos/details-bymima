"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type SecurityEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function SecurityEditModal({
  isOpen,
  onClose,
  title,
  children,
}: SecurityEditModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-cream)] hover:text-[var(--color-dark)] transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-6">
          {title}
        </h3>

        {children}
      </div>
    </div>,
    document.body
  );
}
