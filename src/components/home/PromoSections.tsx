type PromoSectionsProps = {
  items: Array<{
    id: string;
    badge: string | null;
    title: string;
    description: string;
    ctaLabel: string | null;
    ctaHref: string | null;
    backgroundClass: string | null;
  }>;
};

export default function PromoSections({ items }: PromoSectionsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--color-cream)] py-10">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:px-8 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className={`rounded-[2rem] border border-white/70 bg-gradient-to-br ${item.backgroundClass ?? "from-rose-100 via-white to-orange-100"} p-6 shadow-[0_18px_44px_rgba(28,25,23,0.08)]`}
          >
            {item.badge ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">{item.badge}</p>
            ) : null}
            <h3 className="mt-3 text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)]">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] md:text-base">{item.description}</p>
            {item.ctaLabel && item.ctaHref ? (
              <a
                href={item.ctaHref}
                className="mt-5 inline-flex items-center rounded-full bg-[var(--color-dark)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-95"
              >
                {item.ctaLabel}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
