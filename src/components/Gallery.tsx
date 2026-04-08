import type { LandingDictionary } from "@/lib/i18n";

type GalleryProps = {
  content: LandingDictionary["gallery"];
};

export default function Gallery({ content }: GalleryProps) {
  const images = content.items;

  return (
    <section id="galeria" className="py-24 bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-4">
            {content.title} <span className="italic text-[var(--color-primary)]">{content.accent}</span>
          </h2>
          <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {images.map((item, index) => (
            <div 
              key={item.label} 
              className={`relative group aspect-[3/4] overflow-hidden rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 animate-fade-in-up delay-${(index % 3 + 1) * 100}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} opacity-80 group-hover:scale-105 transition-transform duration-700`}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiPjwvcmVjdD48cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSI+PC9wYXRoPjwvc3ZnPg==')] opacity-20 mix-blend-overlay"></div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-[family-name:var(--font-playfair)] font-medium text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center animate-fade-in-up delay-300">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold rounded-full text-white bg-[var(--color-dark)] hover:bg-black hover:-translate-y-1 transition-all duration-300 shadow-lg"
          >
            {content.cta}
          </a>
        </div>

      </div>
    </section>
  );
}
