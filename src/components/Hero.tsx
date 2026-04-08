import type { LandingDictionary } from "@/lib/i18n";

type HeroProps = {
  content: LandingDictionary["hero"];
};

export default function Hero({ content }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[var(--color-cream)]">
      {/* Decorative blobs */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-[var(--color-primary-pale)] rounded-full blur-3xl opacity-70 animate-float-slow"></div>
      <div className="absolute top-1/2 left-10 w-64 h-64 bg-[var(--color-primary-light)] rounded-full blur-3xl opacity-40 animate-float"></div>
      <div className="absolute -bottom-32 right-32 w-80 h-80 bg-[var(--color-sage)] rounded-full blur-3xl opacity-20 animate-float-slow delay-200"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-playfair)] leading-[1.1] text-balance">
              {content.title} <br />
              <span className="italic text-[var(--color-primary)] font-medium">{content.accent}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--color-muted)] max-w-2xl font-[family-name:var(--font-body)] leading-relaxed text-balance">
              {content.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="#servicios" 
                className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold rounded-full text-white bg-[var(--color-primary)] hover:bg-rose-600 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-rose-500/30"
              >
                {content.primaryCta}
              </a>
              <a 
                href="#nosotros" 
                className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold rounded-full text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary-pale)] transition-colors duration-300"
              >
                {content.secondaryCta}
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative animate-fade-in-up delay-200 hidden md:block">
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-light)] to-[var(--color-primary-pale)] rounded-[4rem] rounded-tl-full shadow-2xl overflow-hidden transform rotate-3">
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiPjwvcmVjdD48cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSI+PC9wYXRoPjwvc3ZnPg==')]"></div>
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-9xl filter drop-shadow-md animate-float">🌸</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl animate-float-slow delay-300">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="font-bold text-sm text-[var(--color-dark)]">{content.badgeTitle}</p>
                    <p className="text-xs text-[var(--color-muted)]">{content.badgeSubtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
