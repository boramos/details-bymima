import type { LandingDictionary } from "@/lib/i18n";

type HowItWorksProps = {
  content: LandingDictionary["howItWorks"];
};

export default function HowItWorks({ content }: HowItWorksProps) {
  const steps = content.steps;

  return (
    <section id="como-funciona" className="py-24 bg-[var(--color-primary-pale)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary-light)] opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-4">
            {content.title} <span className="italic text-[var(--color-primary)]">{content.accent}</span>
          </h2>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto rounded-full mt-6"></div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
          {steps.map((step, idx) => (
            <div 
              key={step.num}
              className={`flex-1 flex flex-col items-center text-center relative animate-fade-in-up delay-${(idx + 1) * 100}`}
            >
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-2xl font-bold font-[family-name:var(--font-playfair)] mb-8 shadow-lg shadow-rose-500/20 relative z-20">
                {step.num}
              </div>
              
              <h3 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-4">
                {step.title}
              </h3>
              
              <p className="text-[var(--color-muted)] max-w-xs mx-auto leading-relaxed">
                {step.desc}
              </p>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-20 z-10"></div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
