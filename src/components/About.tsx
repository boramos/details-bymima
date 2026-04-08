"use client";

import { useEffect, useMemo, useState } from "react";

import type { LandingDictionary } from "@/lib/i18n";

type AboutProps = {
  content: LandingDictionary["about"];
  testimonials?: LandingDictionary["testimonials"];
  variant?: "home" | "full";
};

export default function About({ content, testimonials, variant = "home" }: AboutProps) {
  const showExtendedInfo = variant === "full";
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [testimonialPage, setTestimonialPage] = useState(0);

  const testimonialItems = useMemo(() => {
    if (!testimonials) {
      return [];
    }

    return testimonials.items;
  }, [testimonials]);

  const testimonialsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(testimonialItems.length / testimonialsPerPage));

  const testimonialPages = useMemo(() => {
    if (testimonialItems.length === 0) {
      return [];
    }

    const pages = [];

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      const start = pageIndex * testimonialsPerPage;
      const visible = testimonialItems.slice(start, start + testimonialsPerPage);

      if (visible.length === testimonialsPerPage) {
        pages.push(visible);
      } else {
        pages.push([...visible, ...testimonialItems.slice(0, testimonialsPerPage - visible.length)]);
      }
    }

    return pages;
  }, [testimonialItems, totalPages]);

  useEffect(() => {
    if (!showExtendedInfo || testimonialItems.length <= testimonialsPerPage || isCarouselPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setTestimonialPage((current) => (current + 1) % totalPages);
    }, 12000);

    return () => window.clearInterval(interval);
  }, [isCarouselPaused, showExtendedInfo, testimonialItems.length, totalPages]);

  const pauseCarousel = () => {
    setIsCarouselPaused(true);
  };

  const resumeCarousel = () => setIsCarouselPaused(false);

  const showPreviousTestimonials = () => {
    pauseCarousel();
    setTestimonialPage((current) => (current - 1 + totalPages) % totalPages);
  };

  const showNextTestimonials = () => {
    pauseCarousel();
    setTestimonialPage((current) => (current + 1) % totalPages);
  };

  return (
    <section id="nosotros" className="relative overflow-hidden py-12 md:py-16 bg-[var(--color-primary-pale)]/70">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(181,111,132,0.28),transparent)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-4xl space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] font-semibold">
            {content.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">
            {content.title} <span className="italic text-[var(--color-primary)]">{content.accent}</span>
          </h2>
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-[var(--color-muted)] md:text-base">
            {content.description}
          </p>
        </div>

        <div className="mx-auto max-w-5xl space-y-8">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_rgba(28,25,23,0.1)] md:p-6">
            <div className="mx-auto h-[220px] max-w-4xl rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.22)),url('https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center sm:h-[260px] md:h-[300px]" />

            <div className="mt-6 rounded-[1.5rem] border border-white/70 bg-white/78 p-6 shadow-[0_10px_30px_rgba(28,25,23,0.04)] md:p-8">
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-muted)] md:text-base">
                {content.intro}
              </p>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-[var(--color-primary-pale)]/35 p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-primary)]">{content.missionTitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] md:text-base">{content.missionBody}</p>
            </div>
          </div>

          {showExtendedInfo ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {content.stats.map((stat) => (
                <div key={stat.label} className="rounded-[1.25rem] border border-[var(--color-primary-light)]/70 bg-white/82 p-4 text-center">
                  <p className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-primary)]">{stat.value}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {showExtendedInfo && testimonials ? (
          <div className="mt-10 rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_44px_rgba(28,25,23,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-primary)]">{testimonials.title} <span className="italic">{testimonials.accent}</span></p>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  aria-label="Previous testimonials"
                  onClick={showPreviousTestimonials}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-primary-light)] bg-white text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-pale)]"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Next testimonials"
                  onClick={showNextTestimonials}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-primary-light)] bg-white text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-pale)]"
                >
                  →
                </button>
              </div>
            </div>

            <section
              className="mt-5 overflow-hidden"
              aria-label="Client testimonials carousel"
              onMouseEnter={pauseCarousel}
              onMouseLeave={resumeCarousel}
            >
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${testimonialPage * 100}%)` }}
              >
                {testimonialPages.map((page) => (
                  <div key={page.map((item) => item.author).join("-")} className="grid min-w-full gap-4 md:grid-cols-3">
                    {page.map((item) => (
                      <article key={`${item.author}-${item.text.slice(0, 40)}`} className="rounded-[1.5rem] border border-[var(--color-primary-light)]/60 bg-[var(--color-primary-pale)]/40 p-5 shadow-sm">
                        <div className="text-[var(--color-primary)]">{"★".repeat(item.stars)}</div>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">“{item.text}”</p>
                        <p className="mt-4 text-sm font-semibold text-[var(--color-dark)]">{item.author}</p>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}
