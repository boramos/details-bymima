import type { LandingDictionary } from "@/lib/i18n";

type ContactProps = {
  content: LandingDictionary["contact"];
  variant?: "home" | "full";
};

export default function Contact({ content, variant = "home" }: ContactProps) {
  const showExtendedInfo = variant === "full";
  return (
    <section id="contacto" className="py-12 md:py-16 bg-gradient-to-br from-[var(--color-primary-light)] via-[var(--color-primary-pale)] to-orange-100 text-[var(--color-dark)] relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_28%)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-10">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              {content.eyebrow}
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-[family-name:var(--font-playfair)] leading-tight text-[var(--color-dark)] text-balance">
              {content.title} <span className="italic text-[var(--color-primary)]">{content.accent}</span>
            </h2>

            <p className="mx-auto max-w-2xl text-sm font-medium text-[var(--color-secondary)] [text-shadow:0_1px_0_rgba(255,255,255,0.35)] font-[family-name:var(--font-body)] leading-relaxed md:text-base">
              {content.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 min-[900px]:grid-cols-[0.7fr_1.3fr] min-[900px]:items-stretch">
            <div className="animate-fade-in-up flex h-full flex-col rounded-[2rem] border border-white/65 bg-white/58 p-6 shadow-[0_18px_46px_rgba(28,25,23,0.08)] backdrop-blur-md md:p-8 lg:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">{content.hoursTitle}</p>
                <div className="mt-4 space-y-3">
                  {content.hours.map((hour) => {
                    const [day, time] = hour.split("·").map((part) => part.trim());

                    return (
                    <div key={hour} className="rounded-[1rem] bg-[var(--color-primary-light)]/55 px-4 py-3 text-sm text-[var(--color-dark)]">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium">{day}</span>
                        <span className="text-right text-[var(--color-muted)]">{time ?? ""}</span>
                      </div>
                    </div>
                    );
                  })}
                </div>
                <a 
                  href="https://wa.me/570000000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={content.whatsappCta}
                  className="mt-auto inline-flex w-full items-center justify-center rounded-full border border-white/80 bg-white/92 px-8 py-4 text-lg font-bold text-[var(--color-dark)] shadow-[0_16px_34px_rgba(28,25,23,0.08)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-50"
                >
                  <svg aria-hidden="true" className="mr-3 h-6 w-6 fill-current text-emerald-600" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                  {content.whatsappCta}
                </a>

            </div>

            <div className="animate-fade-in-up delay-200 h-full rounded-[2rem] border border-white/75 bg-white/94 p-6 text-[var(--color-dark)] shadow-[0_24px_60px_rgba(28,25,23,0.1)] md:p-8 lg:p-12">
              <h3 className="text-3xl font-bold font-[family-name:var(--font-playfair)] mb-8">
                {content.formTitle}
              </h3>

              <form className="space-y-6">
                <div>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    required
                    minLength={2}
                    className="w-full rounded-xl border border-[var(--color-primary-light)]/75 bg-[var(--color-cream)] px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                    placeholder={content.fields.namePlaceholder}
                  />
                </div>
                
                <div>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    required
                    className="w-full rounded-xl border border-[var(--color-primary-light)]/75 bg-[var(--color-cream)] px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                    placeholder={content.fields.emailPlaceholder}
                  />
                </div>
                
                <div>
                  <textarea 
                    id="message" 
                    name="message"
                    required
                    minLength={10}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[var(--color-primary-light)]/75 bg-[var(--color-cream)] px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                    placeholder={content.fields.messagePlaceholder}
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                    className="w-full rounded-xl bg-[var(--color-dark)] py-4 text-lg font-bold text-white shadow-[0_16px_32px_rgba(28,25,23,0.16)] transition-all duration-300 hover:bg-black hover:-translate-y-0.5"
                >
                  {content.submitLabel}
                </button>
              </form>

            </div>
          </div>

          {showExtendedInfo ? (
            <div className="space-y-8 pt-2">
              <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 shadow-[0_18px_44px_rgba(28,25,23,0.08)]">
                <div className="border-b border-white/70 px-6 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">{content.mapTitle}</p>
                  <p className="mt-1 text-sm text-stone-700">{content.mapAddress}</p>
                </div>
                <iframe
                  title={content.mapTitle}
                  src="https://www.google.com/maps?q=Palmetto%20Bay,%20Miami,%20Florida&z=13&output=embed"
                  className="h-[24rem] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_44px_rgba(28,25,23,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">{content.faqTitle}</p>
                <div className="mt-4 space-y-4">
                  {content.faqs.map((faq) => (
                    <div key={faq.question} className="rounded-[1.25rem] bg-[var(--color-primary-pale)]/45 p-4">
                      <h3 className="text-sm font-semibold text-[var(--color-dark)]">{faq.question}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
