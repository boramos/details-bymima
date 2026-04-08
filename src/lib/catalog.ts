import type { Locale } from "@/lib/i18n";

export type LocalizedText = Record<Locale, string>;

export type FilterKey = "category" | "color" | "style";

export type FilterOption = {
  key: string;
  label: LocalizedText;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  priceLabel: LocalizedText;
  imageEmoji: string;
  gradientClass: string;
  colors: string[];
  categories: string[];
  styles: string[];
  tags: string[];
  bestSeller: boolean;
};

export type ProductOptionInputType = "single" | "multi";

export type ProductOptionChoice = {
  key: string;
  label: LocalizedText;
  priceDeltaCop: number;
  imageUrl?: string;
  presetSelections?: Record<string, string[]>;
};

export type ProductOptionGroup = {
  key: string;
  label: LocalizedText;
  description?: LocalizedText;
  inputType: ProductOptionInputType;
  required: boolean;
  choices: ProductOptionChoice[];
};

export type CatalogProductDetail = CatalogProduct & {
  basePriceCop: number;
  longDescription: LocalizedText;
  optionGroups: ProductOptionGroup[];
};

export type CatalogPageDefinition = {
  key: string;
  slugSegments: string[];
  title: LocalizedText;
  eyebrow: LocalizedText;
  description: LocalizedText;
  heroAccent: LocalizedText;
};

export type EventShowcase = {
  pageKey: string;
  consultationEyebrow: LocalizedText;
  consultationTitle: LocalizedText;
  consultationBody: LocalizedText;
  consultationCta: LocalizedText;
  gallery: Array<{
    title: LocalizedText;
    description: LocalizedText;
    emoji: string;
    gradientClass: string;
  }>;
};

export const categoryOptions: FilterOption[] = [
  { key: "bouquet", label: { es: "Bouquets", en: "Bouquets" } },
  { key: "box", label: { es: "Cajas", en: "Boxes" } },
  { key: "centerpiece", label: { es: "Centros de mesa", en: "Centerpieces" } },
  { key: "basket", label: { es: "Canastas", en: "Baskets" } },
  { key: "orchid", label: { es: "Orquídeas", en: "Orchids" } },
];

export const colorOptions: FilterOption[] = [
  { key: "pink", label: { es: "Rosado", en: "Pink" } },
  { key: "white", label: { es: "Blanco", en: "White" } },
  { key: "red", label: { es: "Rojo", en: "Red" } },
  { key: "yellow", label: { es: "Amarillo", en: "Yellow" } },
  { key: "purple", label: { es: "Lila", en: "Lilac" } },
  { key: "peach", label: { es: "Durazno", en: "Peach" } },
  { key: "green", label: { es: "Verde", en: "Green" } },
  { key: "blue", label: { es: "Azul", en: "Blue" } },
];

export const styleOptions: FilterOption[] = [
  { key: "romantic", label: { es: "Romántico", en: "Romantic" } },
  { key: "classic", label: { es: "Clásico", en: "Classic" } },
  { key: "luxury", label: { es: "Lujoso", en: "Luxury" } },
  { key: "playful", label: { es: "Alegre", en: "Playful" } },
  { key: "minimal", label: { es: "Minimal", en: "Minimal" } },
  { key: "garden", label: { es: "Garden style", en: "Garden style" } },
];

export const filterGroups: Array<{ key: FilterKey; label: LocalizedText; options: FilterOption[] }> = [
  { key: "category", label: { es: "Categorías", en: "Categories" }, options: categoryOptions },
  { key: "color", label: { es: "Colores", en: "Colors" }, options: colorOptions },
  { key: "style", label: { es: "Estilo", en: "Style" }, options: styleOptions },
];

export const catalogPages: CatalogPageDefinition[] = [
  {
    key: "about",
    slugSegments: ["about"],
    eyebrow: { es: "Marca", en: "Brand" },
    title: { es: "Nosotros", en: "About" },
    heroAccent: { es: "con intención", en: "with intention" },
    description: {
      es: "Conoce la misión, la historia detrás del producto y una selección de arreglos que representan el estilo de Details by MIMA.",
      en: "Discover the mission, the story behind the product, and a curated selection of arrangements that reflect the Details by MIMA style.",
    },
  },
  {
    key: "contact",
    slugSegments: ["contact"],
    eyebrow: { es: "Atención personalizada", en: "Personal service" },
    title: { es: "Contacto", en: "Contact" },
    heroAccent: { es: "para tu ocasión", en: "for your occasion" },
    description: {
      es: "Habla con nuestro equipo y explora los arreglos que solemos recomendar para pedidos rápidos y entregas especiales.",
      en: "Speak with our team and explore the arrangements we usually recommend for quick orders and meaningful deliveries.",
    },
  },
  {
    key: "order",
    slugSegments: ["order"],
    eyebrow: { es: "Catálogo completo", en: "Full catalog" },
    title: { es: "Ordenar", en: "Order" },
    heroAccent: { es: "todo el catálogo", en: "the full catalog" },
    description: {
      es: "Encuentra todos los arreglos disponibles, filtra por categoría, color y estilo, y elige el detalle perfecto.",
      en: "Browse every available arrangement, filter by category, color, and style, and choose the perfect floral detail.",
    },
  },
  {
    key: "mothers-day",
    slugSegments: ["mothers-day"],
    eyebrow: { es: "Temporada especial", en: "Seasonal favorites" },
    title: { es: "Día de la Madre", en: "Mother's Day" },
    heroAccent: { es: "lleno de cariño", en: "full of love" },
    description: {
      es: "Selección pensada para consentir a mamá con flores delicadas, tonos suaves y presentaciones memorables.",
      en: "A curated selection designed to celebrate mom with delicate blooms, soft palettes, and memorable presentation.",
    },
  },
  {
    key: "occasions",
    slugSegments: ["occasions"],
    eyebrow: { es: "Colección por ocasión", en: "Occasion collection" },
    title: { es: "Ocasiones", en: "Occasions" },
    heroAccent: { es: "para cada momento", en: "for every moment" },
    description: {
      es: "Explora arreglos pensados para celebrar, agradecer, sorprender o acompañar momentos importantes.",
      en: "Explore arrangements designed to celebrate, thank, surprise, or accompany meaningful moments.",
    },
  },
  {
    key: "occasions/valentines-day",
    slugSegments: ["occasions", "valentines-day"],
    eyebrow: { es: "Momento romántico", en: "Romantic moment" },
    title: { es: "San Valentín", en: "Valentine's Day" },
    heroAccent: { es: "que enamora", en: "made to wow" },
    description: {
      es: "Bouquets y cajas románticas en tonos intensos para declaraciones llenas de emoción.",
      en: "Romantic bouquets and floral boxes in rich tones for declarations full of feeling.",
    },
  },
  {
    key: "occasions/new-baby",
    slugSegments: ["occasions", "new-baby"],
    eyebrow: { es: "Nueva llegada", en: "New arrival" },
    title: { es: "Recién nacido", en: "New Baby" },
    heroAccent: { es: "con ternura", en: "with tenderness" },
    description: {
      es: "Arreglos suaves y luminosos para celebrar la llegada de un bebé con delicadeza.",
      en: "Soft, luminous arrangements to celebrate a new baby with sweetness and grace.",
    },
  },
  {
    key: "occasions/birthday",
    slugSegments: ["occasions", "birthday"],
    eyebrow: { es: "Celebración", en: "Celebration" },
    title: { es: "Cumpleaños", en: "Birthday" },
    heroAccent: { es: "con color", en: "with color" },
    description: {
      es: "Diseños alegres y vibrantes para sorprender en cumpleaños con un regalo inolvidable.",
      en: "Bright, joyful designs to surprise someone on their birthday with an unforgettable gift.",
    },
  },
  {
    key: "occasions/anniversary",
    slugSegments: ["occasions", "anniversary"],
    eyebrow: { es: "Amor duradero", en: "Lasting love" },
    title: { es: "Aniversario", en: "Anniversary" },
    heroAccent: { es: "con elegancia", en: "with elegance" },
    description: {
      es: "Composiciones sofisticadas para marcar aniversarios con un gesto especial y refinado.",
      en: "Sophisticated floral compositions for anniversaries that deserve an elegant gesture.",
    },
  },
  {
    key: "occasions/graduation",
    slugSegments: ["occasions", "graduation"],
    eyebrow: { es: "Logro importante", en: "Important milestone" },
    title: { es: "Graduación", en: "Graduation" },
    heroAccent: { es: "para celebrar", en: "to celebrate" },
    description: {
      es: "Arreglos modernos para celebrar grandes logros con alegría y orgullo.",
      en: "Modern arrangements to celebrate major achievements with joy and pride.",
    },
  },
  {
    key: "occasions/thank-you",
    slugSegments: ["occasions", "thank-you"],
    eyebrow: { es: "Gratitud", en: "Gratitude" },
    title: { es: "Gracias", en: "Thank You" },
    heroAccent: { es: "con estilo", en: "with style" },
    description: {
      es: "Opciones delicadas para agradecer de manera cálida, elegante y memorable.",
      en: "Graceful options for saying thank you in a warm, elegant, and memorable way.",
    },
  },
  {
    key: "occasions/get-well",
    slugSegments: ["occasions", "get-well"],
    eyebrow: { es: "Acompañar y cuidar", en: "Care and comfort" },
    title: { es: "Recupérate pronto", en: "Get Well" },
    heroAccent: { es: "con calidez", en: "with warmth" },
    description: {
      es: "Flores frescas y suaves para acompañar procesos de recuperación con cariño.",
      en: "Fresh and gentle flowers to accompany recovery with warmth and encouragement.",
    },
  },
  {
    key: "occasions/just-because",
    slugSegments: ["occasions", "just-because"],
    eyebrow: { es: "Sin motivo especial", en: "Just because" },
    title: { es: "Porque sí", en: "Just Because" },
    heroAccent: { es: "para sorprender", en: "to delight" },
    description: {
      es: "Detalles espontáneos para hacer del día de alguien algo más bonito.",
      en: "Spontaneous floral gestures to make someone’s day feel extra special.",
    },
  },
  {
    key: "sympathy",
    slugSegments: ["sympathy"],
    eyebrow: { es: "Acompañamiento", en: "Thoughtful support" },
    title: { es: "Condolencias", en: "Sympathy" },
    heroAccent: { es: "con respeto", en: "with respect" },
    description: {
      es: "Diseños sobrios y delicados para acompañar momentos sensibles con serenidad y cuidado.",
      en: "Soft, respectful floral designs to accompany sensitive moments with care and grace.",
    },
  },
  {
    key: "events",
    slugSegments: ["events"],
    eyebrow: { es: "Momentos para compartir", en: "Shared moments" },
    title: { es: "Eventos", en: "Events" },
    heroAccent: { es: "a tu estilo", en: "your way" },
    description: {
      es: "Colección para celebraciones y montajes especiales, desde bodas íntimas hasta eventos sociales al aire libre.",
      en: "A collection for celebrations and special floral setups, from intimate weddings to outdoor social gatherings.",
    },
  },
  {
    key: "events/weddings",
    slugSegments: ["events", "weddings"],
    eyebrow: { es: "Gran día", en: "The big day" },
    title: { es: "Bodas", en: "Weddings" },
    heroAccent: { es: "memorables", en: "made memorable" },
    description: {
      es: "Propuestas florales para bodas civiles, religiosas e íntimas con estilo elegante y coherente.",
      en: "Floral proposals for civil, church, and intimate weddings with an elegant, cohesive feel.",
    },
  },
  {
    key: "events/baby-shower",
    slugSegments: ["events", "baby-shower"],
    eyebrow: { es: "Celebración dulce", en: "Sweet celebration" },
    title: { es: "Baby shower", en: "Baby Shower" },
    heroAccent: { es: "lleno de detalle", en: "full of detail" },
    description: {
      es: "Flores suaves y diseños alegres para recibir a tu bebé en un ambiente delicado y especial.",
      en: "Soft florals and cheerful styling for baby showers that feel tender and polished.",
    },
  },
  {
    key: "events/gender-reveal",
    slugSegments: ["events", "gender-reveal"],
    eyebrow: { es: "Momento sorpresa", en: "Surprise moment" },
    title: { es: "Revelación de sexo", en: "Gender Reveal" },
    heroAccent: { es: "con emoción", en: "with excitement" },
    description: {
      es: "Arreglos pensados para mesas, fondos y detalles visuales para una revelación inolvidable.",
      en: "Arrangements designed for tables, backdrops, and visual details for an unforgettable reveal.",
    },
  },
  {
    key: "events/picnic",
    slugSegments: ["events", "picnic"],
    eyebrow: { es: "Al aire libre", en: "Outdoor mood" },
    title: { es: "Picnic", en: "Picnic" },
    heroAccent: { es: "con encanto", en: "with charm" },
    description: {
      es: "Composiciones ligeras y románticas para picnics especiales, pedidas de mano o celebraciones pequeñas.",
      en: "Light, romantic designs for special picnics, proposals, or small celebrations outdoors.",
    },
  },
  {
    key: "events/corporate-events",
    slugSegments: ["events", "corporate-events"],
    eyebrow: { es: "Montaje floral", en: "Floral styling" },
    title: { es: "Eventos corporativos", en: "Corporate Events" },
    heroAccent: { es: "bien resueltos", en: "done beautifully" },
    description: {
      es: "Opciones para lanzamientos, cenas de marca y reuniones especiales con un look profesional.",
      en: "Options for launches, branded dinners, and special gatherings with a polished professional look.",
    },
  },
  {
    key: "subscriptions",
    slugSegments: ["subscriptions"],
    eyebrow: { es: "Flores recurrentes", en: "Recurring flowers" },
    title: { es: "Suscripciones", en: "Subscriptions" },
    heroAccent: { es: "todo el mes", en: "all month long" },
    description: {
      es: "Arreglos pensados para entregas frecuentes en hogar, oficina o regalos recurrentes con estilo.",
      en: "Floral arrangements designed for recurring home, office, or gifting deliveries with style.",
    },
  },
  {
    key: "account",
    slugSegments: ["account"],
    eyebrow: { es: "Experiencia de cliente", en: "Customer experience" },
    title: { es: "Mi cuenta", en: "My Account" },
    heroAccent: { es: "y favoritos", en: "and favorites" },
    description: {
      es: "Explora favoritos, ideas para repetir pedidos y una selección recomendada para clientes frecuentes.",
      en: "Explore favorites, reorder inspiration, and a recommended edit for returning customers.",
    },
  },
];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "rose-cloud",
    slug: "rose-cloud",
    name: { es: "Nube Rosé", en: "Rosé Cloud" },
    description: {
      es: "Bouquet envolvente en rosados empolvados con acabado romántico y delicado.",
      en: "An enveloping bouquet in dusty pinks with a soft romantic finish.",
    },
    priceLabel: { es: "$34 USD", en: "$34 USD" },
    imageEmoji: "🌸",
    gradientClass: "from-rose-200 via-pink-200 to-rose-100",
    colors: ["pink", "white"],
    categories: ["bouquet"],
    styles: ["romantic", "garden"],
    tags: ["order", "mothers-day", "occasions", "occasions/birthday", "occasions/anniversary", "about", "account"],
    bestSeller: true,
  },
  {
    id: "ivory-promise",
    slug: "ivory-promise",
    name: { es: "Promesa Marfil", en: "Ivory Promise" },
    description: {
      es: "Bouquet blanco con notas verdes para bodas civiles y aniversarios elegantes.",
      en: "A white bouquet with fresh green notes for civil weddings and elegant anniversaries.",
    },
    priceLabel: { es: "$38 USD", en: "$38 USD" },
    imageEmoji: "🤍",
    gradientClass: "from-stone-100 via-white to-emerald-50",
    colors: ["white", "green"],
    categories: ["bouquet"],
    styles: ["classic", "minimal"],
    tags: ["order", "events", "events/weddings", "occasions/anniversary", "sympathy"],
    bestSeller: true,
  },
  {
    id: "golden-sunrise",
    slug: "golden-sunrise",
    name: { es: "Amanecer Dorado", en: "Golden Sunrise" },
    description: {
      es: "Ramo luminoso en amarillos y duraznos para cumpleaños y agradecimientos cálidos.",
      en: "A bright bouquet in yellow and peach tones for birthdays and heartfelt thank-yous.",
    },
    priceLabel: { es: "$32 USD", en: "$32 USD" },
    imageEmoji: "🌼",
    gradientClass: "from-amber-100 via-yellow-100 to-orange-100",
    colors: ["yellow", "peach"],
    categories: ["bouquet"],
    styles: ["playful", "garden"],
    tags: ["order", "occasions", "occasions/birthday", "occasions/thank-you", "mothers-day"],
    bestSeller: true,
  },
  {
    id: "romantic-box",
    slug: "romantic-box",
    name: { es: "Caja Romance", en: "Romantic Box" },
    description: {
      es: "Caja floral compacta con rosas rojas y acentos suaves para fechas especiales.",
      en: "A compact floral box with red roses and soft accents for meaningful dates.",
    },
    priceLabel: { es: "$39 USD", en: "$39 USD" },
    imageEmoji: "🎁",
    gradientClass: "from-rose-300 via-red-200 to-pink-200",
    colors: ["red", "pink"],
    categories: ["box"],
    styles: ["romantic", "luxury"],
    tags: ["order", "occasions", "occasions/valentines-day", "occasions/anniversary", "subscriptions"],
    bestSeller: true,
  },
  {
    id: "luna-centerpiece",
    slug: "luna-centerpiece",
    name: { es: "Centro Luna", en: "Luna Centerpiece" },
    description: {
      es: "Centro de mesa delicado en blancos y lilas para cenas y celebraciones íntimas.",
      en: "A delicate centerpiece in whites and lilacs for dinners and intimate celebrations.",
    },
    priceLabel: { es: "$42 USD", en: "$42 USD" },
    imageEmoji: "🕯️",
    gradientClass: "from-violet-100 via-white to-rose-50",
    colors: ["white", "purple"],
    categories: ["centerpiece"],
    styles: ["classic", "minimal"],
    tags: ["order", "events", "events/weddings", "events/corporate-events", "contact"],
    bestSeller: true,
  },
  {
    id: "blush-basket",
    slug: "blush-basket",
    name: { es: "Canasta Blush", en: "Blush Basket" },
    description: {
      es: "Canasta amplia para baby shower y recién nacidos con flores suaves y aire tierno.",
      en: "A generous floral basket for baby showers and newborn celebrations with a tender feel.",
    },
    priceLabel: { es: "$45 USD", en: "$45 USD" },
    imageEmoji: "🧺",
    gradientClass: "from-pink-100 via-rose-100 to-stone-50",
    colors: ["pink", "white"],
    categories: ["basket"],
    styles: ["garden", "playful"],
    tags: ["order", "events", "events/baby-shower", "occasions/new-baby", "mothers-day"],
    bestSeller: true,
  },
  {
    id: "orchid-whisper",
    slug: "orchid-whisper",
    name: { es: "Susurro de Orquídeas", en: "Orchid Whisper" },
    description: {
      es: "Diseño de orquídeas para oficinas, suscripciones y regalos elegantes de larga duración.",
      en: "An orchid arrangement for offices, subscriptions, and elegant gifts with staying power.",
    },
    priceLabel: { es: "$48 USD", en: "$48 USD" },
    imageEmoji: "🪷",
    gradientClass: "from-fuchsia-100 via-violet-100 to-pink-50",
    colors: ["purple", "white"],
    categories: ["orchid"],
    styles: ["luxury", "minimal"],
    tags: ["order", "subscriptions", "account", "about", "contact"],
    bestSeller: false,
  },
  {
    id: "fiesta-bloom",
    slug: "fiesta-bloom",
    name: { es: "Bloom Fiesta", en: "Fiesta Bloom" },
    description: {
      es: "Explosión de color para cumpleaños, graduaciones y celebraciones llenas de energía.",
      en: "A burst of color for birthdays, graduations, and celebrations full of energy.",
    },
    priceLabel: { es: "$35 USD", en: "$35 USD" },
    imageEmoji: "🎉",
    gradientClass: "from-fuchsia-200 via-orange-100 to-yellow-100",
    colors: ["pink", "yellow", "peach"],
    categories: ["bouquet"],
    styles: ["playful", "luxury"],
    tags: ["order", "occasions", "occasions/birthday", "occasions/graduation", "events/picnic"],
    bestSeller: true,
  },
  {
    id: "serene-embrace",
    slug: "serene-embrace",
    name: { es: "Abrazo Sereno", en: "Serene Embrace" },
    description: {
      es: "Arreglo sobrio para condolencias en tonos crema y verdes suaves.",
      en: "A restrained arrangement for sympathy moments in cream and soft green tones.",
    },
    priceLabel: { es: "$41 USD", en: "$41 USD" },
    imageEmoji: "🕊️",
    gradientClass: "from-stone-100 via-slate-100 to-emerald-50",
    colors: ["white", "green"],
    categories: ["centerpiece"],
    styles: ["classic", "minimal"],
    tags: ["order", "sympathy", "contact"],
    bestSeller: false,
  },
  {
    id: "picnic-bliss",
    slug: "picnic-bliss",
    name: { es: "Picnic Bliss", en: "Picnic Bliss" },
    description: {
      es: "Bouquet ligero y fresco para experiencias outdoor, aniversarios y picnics especiales.",
      en: "A light, fresh bouquet for outdoor experiences, anniversaries, and special picnics.",
    },
    priceLabel: { es: "$31 USD", en: "$31 USD" },
    imageEmoji: "🌿",
    gradientClass: "from-green-100 via-lime-50 to-yellow-50",
    colors: ["green", "yellow", "white"],
    categories: ["bouquet"],
    styles: ["garden", "minimal"],
    tags: ["order", "events", "events/picnic", "occasions/just-because", "mothers-day"],
    bestSeller: false,
  },
  {
    id: "reveal-glow",
    slug: "reveal-glow",
    name: { es: "Glow Reveal", en: "Reveal Glow" },
    description: {
      es: "Caja moderna para revelación de sexo con mezcla suave de tonos pastel.",
      en: "A modern floral box for gender reveal celebrations with a soft pastel mix.",
    },
    priceLabel: { es: "$37 USD", en: "$37 USD" },
    imageEmoji: "🩵",
    gradientClass: "from-sky-100 via-pink-100 to-violet-100",
    colors: ["blue", "pink", "white"],
    categories: ["box"],
    styles: ["playful", "luxury"],
    tags: ["order", "events", "events/gender-reveal", "events/baby-shower"],
    bestSeller: false,
  },
  {
    id: "city-luxe",
    slug: "city-luxe",
    name: { es: "City Luxe", en: "City Luxe" },
    description: {
      es: "Diseño contemporáneo para eventos corporativos y ambientes sofisticados.",
      en: "A contemporary floral design for corporate events and sophisticated settings.",
    },
    priceLabel: { es: "$49 USD", en: "$49 USD" },
    imageEmoji: "🏙️",
    gradientClass: "from-slate-100 via-rose-50 to-zinc-100",
    colors: ["white", "purple", "green"],
    categories: ["centerpiece"],
    styles: ["luxury", "minimal"],
    tags: ["order", "events", "events/corporate-events", "subscriptions", "account"],
    bestSeller: false,
  },
  {
    id: "tulip-kiss",
    slug: "tulip-kiss",
    name: { es: "Tulip Kiss", en: "Tulip Kiss" },
    description: {
      es: "Bouquet compacto y dulce para gracias, porque sí y detalles cotidianos con encanto.",
      en: "A sweet compact bouquet for thank-yous, just-because gifts, and charming everyday gestures.",
    },
    priceLabel: { es: "$30 USD", en: "$30 USD" },
    imageEmoji: "🌷",
    gradientClass: "from-pink-100 via-rose-50 to-peach-50",
    colors: ["pink", "peach"],
    categories: ["bouquet"],
    styles: ["romantic", "playful"],
    tags: ["order", "occasions", "occasions/thank-you", "occasions/just-because", "contact"],
    bestSeller: false,
  },
  {
    id: "lavender-note",
    slug: "lavender-note",
    name: { es: "Nota Lavanda", en: "Lavender Note" },
    description: {
      es: "Arreglo sereno para recuperar ánimo y acompañar con suavidad.",
      en: "A serene arrangement created to uplift and comfort with softness.",
    },
    priceLabel: { es: "$33 USD", en: "$33 USD" },
    imageEmoji: "💜",
    gradientClass: "from-violet-100 via-fuchsia-50 to-stone-50",
    colors: ["purple", "white"],
    categories: ["box"],
    styles: ["classic", "garden"],
    tags: ["order", "occasions", "occasions/get-well", "sympathy", "subscriptions"],
    bestSeller: false,
  },
  {
    id: "bride-garden",
    slug: "bride-garden",
    name: { es: "Bride Garden", en: "Bride Garden" },
    description: {
      es: "Bouquet principal para novias con silueta orgánica y textura romántica.",
      en: "A main bridal bouquet with an organic silhouette and romantic texture.",
    },
    priceLabel: { es: "$46 USD", en: "$46 USD" },
    imageEmoji: "👰",
    gradientClass: "from-rose-100 via-white to-emerald-50",
    colors: ["white", "pink", "green"],
    categories: ["bouquet"],
    styles: ["garden", "luxury"],
    tags: ["order", "events", "events/weddings", "occasions/anniversary"],
    bestSeller: true,
  },
  {
    id: "sunny-office",
    slug: "sunny-office",
    name: { es: "Sunny Office", en: "Sunny Office" },
    description: {
      es: "Arreglo modular para recepción, escritorio o entregas corporativas frecuentes.",
      en: "A modular arrangement for reception desks, workspaces, or recurring corporate deliveries.",
    },
    priceLabel: { es: "$40 USD", en: "$40 USD" },
    imageEmoji: "☀️",
    gradientClass: "from-yellow-100 via-amber-50 to-lime-50",
    colors: ["yellow", "green"],
    categories: ["centerpiece"],
    styles: ["playful", "minimal"],
    tags: ["order", "events", "events/corporate-events", "subscriptions", "contact"],
    bestSeller: false,
  },
];

export const eventShowcases: EventShowcase[] = [
  {
    pageKey: "events",
    consultationEyebrow: { es: "Decoración floral a medida", en: "Tailored floral styling" },
    consultationTitle: { es: "Cuéntanos tu evento y lo diseñamos contigo", en: "Tell us about your event and we’ll shape it with you" },
    consultationBody: {
      es: "Antes de montar cualquier evento preferimos conversar contigo, entender el espacio, el estilo y el presupuesto para proponerte una decoración verdaderamente personalizada.",
      en: "Before we style any event, we prefer to talk with you, understand the space, style, and budget, and then propose something truly tailored.",
    },
    consultationCta: { es: "Hacer una consulta", en: "Start a consultation" },
    gallery: [
      { title: { es: "Bodas íntimas", en: "Intimate weddings" }, description: { es: "Ceremonias con mesas, bouquet y fondos florales suaves.", en: "Ceremonies with tablescapes, bouquets, and soft floral backdrops." }, emoji: "🤍", gradientClass: "from-rose-100 via-stone-50 to-emerald-50" },
      { title: { es: "Baby shower", en: "Baby shower" }, description: { es: "Escenarios delicados y llenos de color para celebrar una nueva vida.", en: "Soft, colorful scenes to celebrate a new life." }, emoji: "🧸", gradientClass: "from-pink-100 via-sky-50 to-white" },
      { title: { es: "Picnics especiales", en: "Special picnics" }, description: { es: "Montajes al aire libre con flores, textiles y detalles románticos.", en: "Outdoor setups with florals, textiles, and romantic details." }, emoji: "🧺", gradientClass: "from-lime-50 via-yellow-50 to-rose-100" },
      { title: { es: "Eventos de marca", en: "Brand events" }, description: { es: "Decoración floral editorial para lanzamientos y encuentros corporativos.", en: "Editorial floral styling for launches and corporate gatherings." }, emoji: "✨", gradientClass: "from-slate-100 via-white to-rose-50" },
    ],
  },
  {
    pageKey: "events/weddings",
    consultationEyebrow: { es: "Bodas con identidad", en: "Weddings with identity" },
    consultationTitle: { es: "Hablemos de tu boda antes de definir las flores", en: "Let’s talk about your wedding before we define the florals" },
    consultationBody: {
      es: "Creamos propuestas de decoración, bouquets, centros de mesa y rincones especiales según el estilo de tu boda y el tipo de celebración que imaginas.",
      en: "We create decor proposals, bouquets, centerpieces, and special corners based on your wedding style and the celebration you envision.",
    },
    consultationCta: { es: "Quiero cotizar mi boda", en: "I want a wedding quote" },
    gallery: [
      { title: { es: "Ceremonia civil", en: "Civil ceremony" }, description: { es: "Flores orgánicas y limpias para ceremonias elegantes y sobrias.", en: "Organic, clean florals for elegant civil ceremonies." }, emoji: "💍", gradientClass: "from-white via-rose-50 to-emerald-50" },
      { title: { es: "Mesa principal", en: "Main table" }, description: { es: "Composición protagonista para fotos, brindis y cenas memorables.", en: "Statement styling for photos, toasts, and memorable dinners." }, emoji: "🍽️", gradientClass: "from-rose-100 via-white to-amber-50" },
      { title: { es: "Bouquet de novia", en: "Bridal bouquet" }, description: { es: "Diseños con movimiento y textura para complementar tu look.", en: "Textured, organic bouquets designed to complement your look." }, emoji: "👰", gradientClass: "from-pink-100 via-stone-50 to-green-50" },
      { title: { es: "Rincón floral", en: "Floral corner" }, description: { es: "Backdrops y espacios decorados para fotos y ambientación.", en: "Backdrops and styled floral corners for atmosphere and photos." }, emoji: "🌿", gradientClass: "from-emerald-50 via-white to-rose-100" },
    ],
  },
  {
    pageKey: "events/baby-shower",
    consultationEyebrow: { es: "Celebración dulce", en: "Sweet celebration" },
    consultationTitle: { es: "Cuéntanos la idea del baby shower y lo aterrizamos juntas", en: "Share the baby shower vision and we’ll bring it to life together" },
    consultationBody: {
      es: "Diseñamos mesas, fondos, arreglos y detalles florales que se adaptan al espacio, la paleta y el tipo de celebración que estás preparando.",
      en: "We design tables, backdrops, arrangements, and floral details tailored to the space, palette, and celebration you are planning.",
    },
    consultationCta: { es: "Consultar baby shower", en: "Ask about a baby shower" },
    gallery: [
      { title: { es: "Mesa principal", en: "Main table" }, description: { es: "Florales suaves y capas de textura para la mesa central.", en: "Soft florals and layered textures for the central table." }, emoji: "🍼", gradientClass: "from-pink-100 via-sky-50 to-white" },
      { title: { es: "Entrada", en: "Entrance" }, description: { es: "Bienvenida floral para crear un primer impacto delicado.", en: "A floral welcome moment that feels soft and special." }, emoji: "🎀", gradientClass: "from-white via-rose-50 to-sky-100" },
      { title: { es: "Detalles de mesa", en: "Table details" }, description: { es: "Mini arreglos para dulces, recuerdos y ambientación.", en: "Mini arrangements for sweets, favors, and atmosphere." }, emoji: "🌸", gradientClass: "from-rose-50 via-pink-100 to-stone-50" },
      { title: { es: "Rincón de fotos", en: "Photo corner" }, description: { es: "Escenarios ligeros para capturar el momento con ternura.", en: "Light sets created to capture the celebration beautifully." }, emoji: "📸", gradientClass: "from-sky-50 via-white to-pink-100" },
    ],
  },
  {
    pageKey: "events/gender-reveal",
    consultationEyebrow: { es: "Momento sorpresa", en: "Reveal moment" },
    consultationTitle: { es: "Creamos una revelación delicada, no una decoración genérica", en: "We create a thoughtful reveal, not generic decor" },
    consultationBody: {
      es: "Nos encargamos de la dirección floral y visual para que la revelación tenga armonía, sorpresa y un estilo cuidado en cada rincón.",
      en: "We handle the floral and visual direction so the reveal feels cohesive, surprising, and beautifully styled." ,
    },
    consultationCta: { es: "Consultar revelación", en: "Ask about a reveal" },
    gallery: [
      { title: { es: "Mesa de revelación", en: "Reveal table" }, description: { es: "Paleta suave para que el gran momento tenga foco y belleza.", en: "A soft palette so the big moment feels intentional and beautiful." }, emoji: "🩵", gradientClass: "from-sky-100 via-pink-100 to-white" },
      { title: { es: "Fondos florales", en: "Floral backdrops" }, description: { es: "Elementos visuales que acompañan fotos y videos del reveal.", en: "Visual elements designed for photos and reveal videos." }, emoji: "☁️", gradientClass: "from-white via-violet-50 to-sky-100" },
      { title: { es: "Dulces y detalles", en: "Desserts and details" }, description: { es: "Mini arreglos para mesas auxiliares y estaciones de postres.", en: "Mini arrangements for side tables and dessert stations." }, emoji: "🧁", gradientClass: "from-pink-100 via-white to-sky-50" },
      { title: { es: "Zona de invitados", en: "Guest area" }, description: { es: "Ambientación envolvente para que todo el evento se sienta coherente.", en: "A polished guest area so the whole event feels consistent." }, emoji: "🎈", gradientClass: "from-slate-50 via-pink-50 to-blue-100" },
    ],
  },
  {
    pageKey: "events/picnic",
    consultationEyebrow: { es: "Outdoor styling", en: "Outdoor styling" },
    consultationTitle: { es: "Antes del picnic, definimos el mood contigo", en: "Before the picnic, we define the mood with you" },
    consultationBody: {
      es: "Creamos picnics florales para aniversarios, pedidas de mano, celebraciones privadas y momentos con una estética muy cuidada.",
      en: "We create floral picnic experiences for anniversaries, proposals, private celebrations, and beautifully styled moments.",
    },
    consultationCta: { es: "Quiero mi picnic", en: "Plan my picnic" },
    gallery: [
      { title: { es: "Picnic romántico", en: "Romantic picnic" }, description: { es: "Textiles, flores y vajilla para una experiencia íntima.", en: "Textiles, florals, and tableware for an intimate setup." }, emoji: "🧺", gradientClass: "from-yellow-50 via-rose-50 to-green-50" },
      { title: { es: "Celebración al atardecer", en: "Sunset setup" }, description: { es: "Decoración cálida para encuentros al aire libre con encanto editorial.", en: "Warm styling for outdoor gatherings with editorial charm." }, emoji: "🌇", gradientClass: "from-amber-100 via-rose-100 to-lime-50" },
      { title: { es: "Mesa baja", en: "Low table styling" }, description: { es: "Capas y volúmenes para que el picnic se vea completo y especial.", en: "Layered details that make the picnic feel complete and special." }, emoji: "🍓", gradientClass: "from-rose-50 via-white to-yellow-50" },
      { title: { es: "Detalles florales", en: "Floral details" }, description: { es: "Pequeños arreglos que hacen la diferencia en las fotos y la atmósfera.", en: "Small arrangements that elevate the atmosphere and photography." }, emoji: "🌷", gradientClass: "from-pink-100 via-stone-50 to-green-50" },
    ],
  },
  {
    pageKey: "events/corporate-events",
    consultationEyebrow: { es: "Eventos de marca", en: "Brand events" },
    consultationTitle: { es: "Diseñamos la ambientación floral según tu marca y formato", en: "We shape the floral styling around your brand and event format" },
    consultationBody: {
      es: "Trabajamos decoración floral para cenas de marca, lanzamientos, activaciones y eventos corporativos con una propuesta visual coherente.",
      en: "We create floral styling for brand dinners, launches, activations, and corporate events with a cohesive visual direction.",
    },
    consultationCta: { es: "Consultar evento corporativo", en: "Ask about a corporate event" },
    gallery: [
      { title: { es: "Cena de marca", en: "Brand dinner" }, description: { es: "Centros y detalles alineados a una narrativa elegante.", en: "Centerpieces and details aligned with an elegant narrative." }, emoji: "🥂", gradientClass: "from-stone-100 via-white to-rose-50" },
      { title: { es: "Lanzamiento", en: "Launch event" }, description: { es: "Flores como parte de la atmósfera y del storytelling del espacio.", en: "Florals used as part of the event atmosphere and spatial storytelling." }, emoji: "🚀", gradientClass: "from-slate-100 via-zinc-50 to-pink-50" },
      { title: { es: "Mesas de recepción", en: "Reception tables" }, description: { es: "Composiciones limpias y contemporáneas para espacios corporativos.", en: "Clean, contemporary compositions for corporate environments." }, emoji: "🏢", gradientClass: "from-zinc-100 via-white to-emerald-50" },
      { title: { es: "Activaciones", en: "Activations" }, description: { es: "Rincones florales pensados para experiencia de marca y contenido.", en: "Floral moments designed for brand experience and content capture." }, emoji: "✨", gradientClass: "from-white via-rose-50 to-amber-50" },
    ],
  },
];

export function getCatalogPageBySegments(segments: string[]): CatalogPageDefinition | null {
  return catalogPages.find((page) =>
    page.slugSegments.length === segments.length &&
    page.slugSegments.every((segment, index) => segment === segments[index])
  ) ?? null;
}

export function getProductsForPage(pageKey: string): CatalogProduct[] {
  if (pageKey === "order") {
    return catalogProducts;
  }

  return catalogProducts.filter((product) => product.tags.includes(pageKey));
}

export function getBestSellerProducts(limit = 8): CatalogProduct[] {
  return catalogProducts.filter((product) => product.bestSeller).slice(0, limit);
}

export function getEventShowcaseByPageKey(pageKey: string): EventShowcase | null {
  return eventShowcases.find((entry) => entry.pageKey === pageKey) ?? null;
}

export function getFilterOptionLabel(groupKey: FilterKey, optionKey: string, locale: Locale): string {
  const group = filterGroups.find((entry) => entry.key === groupKey);
  return group?.options.find((option) => option.key === optionKey)?.label[locale] ?? optionKey;
}

function parseCopAmount(priceLabel: string): number {
  const digits = priceLabel.replace(/[^\d]/g, "");
  return Number(digits || 0);
}

function ensureExpandedPalette(product: CatalogProduct): string[] {
  const fallbackPalette = ["pink", "white", "red", "peach", "purple", "yellow"];
  const merged = [...product.colors];

  for (const color of fallbackPalette) {
    if (!merged.includes(color)) {
      merged.push(color);
    }

    if (merged.length >= 5) {
      break;
    }
  }

  return merged;
}

function buildPaletteChoices(product: CatalogProduct): ProductOptionChoice[] {
  return ensureExpandedPalette(product).map((color, index) => ({
    key: color,
    label: {
      es: getFilterOptionLabel("color", color, "es"),
      en: getFilterOptionLabel("color", color, "en"),
    },
    priceDeltaCop: index === 0 ? 0 : Math.min(10, 5 + index),
  }));
}

function buildGiftAddOnGroups(): ProductOptionGroup[] {
  return [
    {
      key: "configuration",
      label: { es: "Configuration", en: "Configuration" },
      description: { es: "Elige una base y luego personalízala a tu gusto.", en: "Choose a base setup and then customize it your way." },
      inputType: "single",
      required: true,
      choices: [
        {
          key: "basic",
          label: { es: "Basic", en: "Basic" },
          priceDeltaCop: 0,
          imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
          presetSelections: {
            chocolates: ["classic"],
            "self-care": [],
            card: [],
          },
        },
        {
          key: "premium",
          label: { es: "Premium", en: "Premium" },
          priceDeltaCop: 0,
          imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80",
          presetSelections: {
            chocolates: ["classic"],
            "self-care": ["body-cream-bbw", "body-mist-bbw"],
            card: ["dedication-card"],
          },
        },
        {
          key: "deluxe",
          label: { es: "Deluxe", en: "Deluxe" },
          priceDeltaCop: 0,
          imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
          presetSelections: {
            chocolates: ["premium"],
            "self-care": ["body-cream-bbw", "body-mist-bbw", "aromatic-candle"],
            card: ["dedication-card"],
          },
        },
        {
          key: "luxury",
          label: { es: "Luxury", en: "Luxury" },
          priceDeltaCop: 0,
          imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
          presetSelections: {
            chocolates: ["premium"],
            "self-care": ["body-cream-vs", "body-mist-vs", "aromatic-candle"],
            card: ["dedication-card"],
          },
        },
      ],
    },
    {
      key: "chocolates",
      label: { es: "Chocolates", en: "Chocolates" },
      description: { es: "Elige tu estilo favorito.", en: "Choose your favorite style." },
      inputType: "single",
      required: true,
      choices: [
        {
          key: "classic",
          label: { es: "Classic chocolate", en: "Classic chocolate" },
          priceDeltaCop: 0,
          imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
        },
        {
          key: "premium",
          label: { es: "Premium chocolate", en: "Premium chocolate" },
          priceDeltaCop: 9,
          imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
    {
      key: "self-care",
      label: { es: "Self care", en: "Self care" },
      description: { es: "Elige crema, jabón, colonia, vela o combínalos como quieras.", en: "Choose cream, soap, cologne, candle, or mix them however you want." },
      inputType: "multi",
      required: false,
      choices: [
        {
          key: "body-cream-bbw",
          label: { es: "Bath & Body Works cream", en: "Bath & Body Works cream" },
          priceDeltaCop: 8,
          imageUrl: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80",
        },
        {
          key: "soft-soap",
          label: { es: "Hand soap", en: "Hand soap" },
          priceDeltaCop: 7,
          imageUrl: "https://images.unsplash.com/photo-1607006483225-3e9fc3b5c8eb?auto=format&fit=crop&w=600&q=80",
        },
        {
          key: "body-mist-bbw",
          label: { es: "Bath & Body Works mist", en: "Bath & Body Works mist" },
          priceDeltaCop: 8,
          imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
        },
        {
          key: "aromatic-candle",
          label: { es: "Aromatic candle", en: "Aromatic candle" },
          priceDeltaCop: 9,
          imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
        },
        {
          key: "body-cream-vs",
          label: { es: "Victoria's Secret cream", en: "Victoria's Secret cream" },
          priceDeltaCop: 10,
          imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        },
        {
          key: "body-mist-vs",
          label: { es: "Victoria's Secret mist", en: "Victoria's Secret mist" },
          priceDeltaCop: 10,
          imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
    {
      key: "card",
      label: { es: "Dedicatoria", en: "Dedication card" },
      description: { es: "Incluye una tarjeta para tu dedicatoria o mensaje personal.", en: "Include a card for your dedication or personal message." },
      inputType: "single",
      required: false,
      choices: [
        {
          key: "dedication-card",
          label: { es: "Dedication card", en: "Dedication card" },
          priceDeltaCop: 5,
          imageUrl: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  ];
}

function buildLongDescription(product: CatalogProduct): LocalizedText {
  return {
    es: `${product.description.es} Personalízalo eligiendo el color de presentación y los extras que quieres incluir para que tu regalo se sienta totalmente tuyo.`,
    en: `${product.description.en} Personalize it by choosing the color presentation and the gift extras you want to include so the final gift feels fully yours.`,
  };
}

function buildOptionGroups(product: CatalogProduct): ProductOptionGroup[] {
  return [
    {
      key: "palette",
      label: { es: "Paleta de color", en: "Color palette" },
      description: { es: "Elige el color que más te guste viendo las imágenes debajo del producto.", en: "Choose the color you like most using the thumbnails below the product." },
      inputType: "single",
      required: true,
      choices: buildPaletteChoices(product),
    },
    ...buildGiftAddOnGroups(),
  ];
}

export function getProductStartingPriceCop(product: CatalogProduct): number {
  return parseCopAmount(product.priceLabel.es);
}

export function formatPriceCop(amountCop: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "es" ? "en-US" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCop);
}

export function getAllProductSlugs(): string[] {
  return catalogProducts.map((product) => product.slug);
}

export function getProductBySlug(slug: string): CatalogProductDetail | null {
  const product = catalogProducts.find((entry) => entry.slug === slug);

  if (!product) {
    return null;
  }

  return {
    ...product,
    basePriceCop: getProductStartingPriceCop(product),
    longDescription: buildLongDescription(product),
    optionGroups: buildOptionGroups(product),
  };
}
