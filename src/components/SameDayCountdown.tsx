"use client";

import { useEffect, useState } from "react";

type SameDayCountdownProps = {
  content: {
    urgencyLabel: string;
    deliveryEndsLabel: string;
    hoursLabel: string;
    minutesLabel: string;
    secondsLabel: string;
  };
};

const SAME_DAY_CUTOFF_HOUR = 14;

function getMiamiTimeParts() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value || 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value || 0),
    second: Number(parts.find((part) => part.type === "second")?.value || 0),
  };
}

function getTimeUntilCutoff(): { hours: number; minutes: number; seconds: number } | null {
  const { hour, minute, second } = getMiamiTimeParts();

  const totalSecondsNow = hour * 3600 + minute * 60 + second;
  const totalSecondsCutoff = SAME_DAY_CUTOFF_HOUR * 3600;
  const remainingSeconds = totalSecondsCutoff - totalSecondsNow;

  if (remainingSeconds <= 0) {
    return null;
  }

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return { hours, minutes, seconds };
}

export default function SameDayCountdown({ content }: SameDayCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilCutoff());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilCutoff());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !timeRemaining) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-rose-50 via-white to-pink-50 py-8 border-y border-rose-100/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 text-center">
          <div>
            <p className="text-xl font-bold uppercase tracking-[0.18em] text-rose-600 sm:text-2xl">
              {content.urgencyLabel}
            </p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-dark)] sm:text-base">
              {content.deliveryEndsLabel}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-rose-200 px-4 py-3 shadow-lg min-w-[80px]">
              <span className="text-3xl font-bold font-[family-name:var(--font-playfair)] text-rose-600 tabular-nums">
                {String(timeRemaining.hours).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                {content.hoursLabel}
              </span>
            </div>

            <span className="text-2xl font-bold text-rose-400">:</span>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-rose-200 px-4 py-3 shadow-lg min-w-[80px]">
              <span className="text-3xl font-bold font-[family-name:var(--font-playfair)] text-rose-600 tabular-nums">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                {content.minutesLabel}
              </span>
            </div>

            <span className="text-2xl font-bold text-rose-400">:</span>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-rose-200 px-4 py-3 shadow-lg min-w-[80px]">
              <span className="text-3xl font-bold font-[family-name:var(--font-playfair)] text-rose-600 tabular-nums">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                {content.secondsLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
