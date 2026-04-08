import type { LandingDictionary } from "@/lib/i18n";

type HomeBannerProps = {
  content: LandingDictionary["homeBanner"];
};

export default function HomeBanner({ content }: HomeBannerProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--color-cream)] pt-16 text-[var(--color-dark)] sm:pt-18 lg:pt-12 xl:pt-4 2xl:pt-2">
      <div className="relative w-full h-[600px] sm:h-[700px] lg:h-[800px]">
        <img
          src="/C0FB26B4-3F68-4862-A9A3-6E0EF61A2D6D.PNG"
          alt="Floral gift box background"
          className="block w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,22,20,0.78),rgba(34,22,20,0.56)_24%,rgba(34,22,20,0.3)_46%,rgba(253,248,240,0.1)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,22,20,0.24),rgba(34,22,20,0.14)_32%,rgba(253,248,240,0.03)_100%)]" />

        <div className="absolute inset-0 flex items-center justify-center px-4 py-3 text-center sm:px-6 sm:py-4 lg:px-8 xl:py-0 2xl:py-0">
          <div className="max-w-3xl space-y-4 md:-translate-y-2 xl:-translate-y-8 2xl:-translate-y-9">
          <div className="inline-flex rounded-full border border-white/45 bg-black/38 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-50 shadow-sm backdrop-blur-md [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">
            {content.eyebrow}
          </div>

          <h1 className="text-3xl font-bold font-[family-name:var(--font-playfair)] leading-tight text-white sm:text-4xl lg:text-5xl [text-shadow:0_6px_28px_rgba(0,0,0,0.5)]">
            {content.title}{content.accent ? <span className="italic text-[var(--color-primary)] [text-shadow:0_6px_24px_rgba(0,0,0,0.62)]"> {content.accent}</span> : null}
          </h1>
          <p className="mx-auto max-w-xl text-[11px] font-light tracking-wide leading-relaxed text-white/80 sm:max-w-none sm:text-[13px] sm:whitespace-nowrap md:text-[15px] [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
            {content.description}
          </p>
          <div className="flex justify-center pt-2">
            <a
              href={content.primaryCtaHref}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:brightness-95 sm:px-8 sm:py-3"
            >
              {content.primaryCtaLabel}
            </a>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
