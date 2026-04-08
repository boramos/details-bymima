import type { LandingDictionary } from "@/lib/i18n";

type TestimonialsProps = {
  content: LandingDictionary["testimonials"];
};

export default function Testimonials({ content }: TestimonialsProps) {
  const testimonials = content.items;

  return (
    <section id="testimonios" className="py-24 bg-[var(--color-primary-pale)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-4">
            {content.title} <span className="italic text-[var(--color-primary)]">{content.accent}</span>
          </h2>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto rounded-full mt-6"></div>
        </div>

        <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 gap-8 md:overflow-visible md:pb-0 hide-scrollbar">
          {testimonials.map((t, idx) => (
            <div 
              key={t.author}
              className={`min-w-[85vw] sm:min-w-[300px] snap-center bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 relative group animate-fade-in-up delay-${(idx + 1) * 100}`}
            >
              <div className="text-4xl font-[family-name:var(--font-playfair)] text-[var(--color-primary-light)] mb-4 leading-none">
                &quot;
              </div>
              
              <div className="flex mb-4">
                {Array.from({ length: t.stars }, (_, starNumber) => starNumber + 1).map((starNumber) => (
                  <svg key={`${t.author}-star-${starNumber}`} aria-hidden="true" className="w-5 h-5 text-[#fb923c] fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-[var(--color-muted)] text-lg mb-8 italic">
                {t.text}
              </p>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-white font-bold mr-4">
                  {t.author.charAt(0)}
                </div>
                <p className="font-bold text-[var(--color-primary)]">
                  {t.author}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
