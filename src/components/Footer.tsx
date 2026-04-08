import Link from "next/link";

import BrandMark from "@/components/BrandMark";
import type { LandingDictionary } from "@/lib/i18n";

type FooterProps = {
  content: LandingDictionary["footer"];
};

export default function Footer({ content }: FooterProps) {
  return (
    <footer className="bg-[var(--color-dark)] text-white pt-16 pb-8 overflow-hidden relative">
      <div className="absolute -top-64 -right-64 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-10">
          
          <div className="md:col-span-5 space-y-6">
            <div>
              <BrandMark tagline={content.brandTagline} tone="light" />
            </div>
            <p className="text-white/70 max-w-sm leading-relaxed text-balance">
              {content.description}
            </p>
            <div className="flex items-center gap-4 pt-4">
              <a href="https://www.instagram.com/detailsbymima/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors duration-300">
                <span className="sr-only">Instagram</span>
                <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://wa.me/+17866308753" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors duration-300">
                <span className="sr-only">WhatsApp</span>
                <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] transition-colors duration-300">
                <span className="sr-only">Facebook</span>
                <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[var(--color-dark)] transition-colors duration-300">
                <span className="sr-only">TikTok</span>
                <svg aria-hidden="true" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.35V2h-3.12v13.18a2.67 2.67 0 1 1-2.67-2.67c.24 0 .47.03.69.09V9.43a5.8 5.8 0 0 0-.69-.04A5.79 5.79 0 1 0 15.82 15V8.33a7.9 7.9 0 0 0 4.62 1.48V6.69h-.85Z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-6">
            <h4 className="text-xl font-bold font-[family-name:var(--font-playfair)]">{content.linksTitle}</h4>
            <ul className="space-y-4">
              {content.links.map((link) => (
                <li key={link.label}><Link href={link.href} className="text-white/70 hover:text-white transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-6">
            <h4 className="text-xl font-bold font-[family-name:var(--font-playfair)]">{content.contactTitle}</h4>
            <ul className="space-y-4">
              <li className="flex items-start text-white/70">
                <svg aria-hidden="true" className="w-5 h-5 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{content.location}<br />{content.shipping}</span>
              </li>
              <li className="flex items-center text-white/70">
                <svg aria-hidden="true" className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>786-630-8753</span>
              </li>
              <li className="flex items-center text-white/70">
                <svg aria-hidden="true" className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>hola@detailsbymima.com</span>
              </li>
            </ul>
          </div>
          
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <p>{content.rights}</p>
          <p className="flex items-center gap-2">
            {content.madeWith} <span className="text-[var(--color-primary)] text-lg animate-pulse">❤️</span> {content.country}
          </p>
        </div>
      </div>
    </footer>
  );
}
