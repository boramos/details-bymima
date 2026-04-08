import type { Locale } from "@/lib/i18n";

type TrustBadgesProps = {
  locale: Locale;
};

export default function TrustBadges({ locale }: TrustBadgesProps) {
  const content = locale === "es" ? {
    title: "Por qué elegirnos",
    badges: [
      {
        title: "Envío Seguro",
        description: "Entregas cuidadosas para que llegue perfecto.",
        icon: "🚚"
      },
      {
        title: "Calidad Premium",
        description: "Flores frescas seleccionadas a mano.",
        icon: "✨"
      },
      {
        title: "Atención 24/7",
        description: "Acompañamiento en cada paso de tu pedido.",
        icon: "💬"
      },
      {
        title: "Pagos Seguros",
        description: "Transacciones protegidas y encriptadas.",
        icon: "🔒"
      }
    ]
  } : {
    title: "Why choose us",
    badges: [
      {
        title: "Safe Delivery",
        description: "Careful delivery so it arrives perfectly.",
        icon: "🚚"
      },
      {
        title: "Premium Quality",
        description: "Hand-picked fresh flowers.",
        icon: "✨"
      },
      {
        title: "24/7 Support",
        description: "Guidance at every step of your order.",
        icon: "💬"
      },
      {
        title: "Secure Payments",
        description: "Protected and encrypted transactions.",
        icon: "🔒"
      }
    ]
  };

  return (
    <section className="bg-white py-12 md:py-16 border-y border-[var(--color-primary-light)]/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">{content.title}</h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {content.badges.map((badge) => (
            <div key={badge.title} className="flex flex-col items-center text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-pale)] text-2xl shadow-sm">
                {badge.icon}
              </span>
              <h3 className="mb-2 text-sm font-bold text-[var(--color-dark)]">{badge.title}</h3>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed max-w-[200px]">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
