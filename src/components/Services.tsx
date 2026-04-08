import type { LandingDictionary } from "@/lib/i18n";

type ServicesProps = {
  content: LandingDictionary["services"];
};

export default function Services({ content }: ServicesProps) {
  const services = content.items;

  return (
    <section id="servicios" className="py-24 bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-6">
            {content.title} <span className="italic text-[var(--color-primary)]">{content.accent}</span>
          </h2>
          <p className="text-lg text-[var(--color-muted)]">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={service.title}
              className={`bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-[var(--color-primary-pale)] hover:border-[var(--color-primary-light)] group animate-fade-in-up delay-${(index + 1) * 100}`}
            >
              <div className="w-16 h-16 bg-[var(--color-primary-pale)] group-hover:bg-[var(--color-primary-light)] rounded-2xl flex items-center justify-center text-3xl mb-6 transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-3">
                {service.title}
              </h3>
              <p className="text-[var(--color-muted)] leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
