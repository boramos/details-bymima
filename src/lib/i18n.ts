export const SUPPORTED_LOCALES = ["es", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE_NAME = "preferred-locale";
export const LOCALE_HEADER_NAME = "x-request-locale";

type NavbarLink = {
  name: string;
  href?: string;
  emphasis?: boolean;
  children?: Array<{
    name: string;
    href: string;
  }>;
};

type Dictionary = {
  metadata: {
    title: string;
    description: string;
  };
  navbar: {
    ariaLabel: string;
    brandTagline: string;
    openMenuLabel: string;
    closeMenuLabel: string;
    cartLabel: string;
    cartAriaLabel: string;
    links: NavbarLink[];
  };
  homeBanner: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    featuredCard: {
      eyebrow: string;
      title: string;
      body: string;
    };
    highlights: Array<{
      eyebrow: string;
      title: string;
      body: string;
    }>;
  };
  bestSellers: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    cta: string;
  };
  hero: {
    title: string;
    accent: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    badgeTitle: string;
    badgeSubtitle: string;
  };
  about: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    intro: string;
    quote: string;
    missionTitle: string;
    missionBody: string;
    storyTitle: string;
    storyBody: string;
    mapTitle: string;
    mapAddress: string;
    faqTitle: string;
    faqs: Array<{
      question: string;
      answer: string;
    }>;
    values: Array<{
      title: string;
      body: string;
    }>;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  services: {
    title: string;
    accent: string;
    description: string;
    items: Array<{
      title: string;
      desc: string;
      icon: string;
    }>;
  };
  howItWorks: {
    title: string;
    accent: string;
    steps: Array<{
      num: string;
      title: string;
      desc: string;
    }>;
  };
  gallery: {
    title: string;
    accent: string;
    description: string;
    cta: string;
    items: Array<{
      label: string;
      bg: string;
    }>;
  };
  testimonials: {
    title: string;
    accent: string;
    items: Array<{
      text: string;
      author: string;
      stars: number;
    }>;
  };
  contact: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    whatsappCta: string;
    hoursTitle: string;
    hours: string[];
    mapTitle: string;
    mapAddress: string;
    faqTitle: string;
    faqs: Array<{
      question: string;
      answer: string;
    }>;
    formTitle: string;
    fields: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      message: string;
      messagePlaceholder: string;
    };
    submitLabel: string;
  };
  catalogUi: {
    filtersTitle: string;
    clearFiltersLabel: string;
    searchPlaceholder: string;
    resultsLabel: string;
    emptyStateTitle: string;
    emptyStateBody: string;
    orderNowLabel: string;
    bestSellerBadge: string;
    viewDetailsLabel: string;
    startingAtLabel: string;
  };
  productUi: {
    backToCatalogLabel: string;
    startingAtLabel: string;
    priceSummaryLabel: string;
    basePriceLabel: string;
    customizationLabel: string;
    noteLabel: string;
      notePlaceholder: string;
      addToCartLabel: string;
      addedToCartLabel: string;
      buyNowLabel: string;
      quantityLabel: string;
      includesLabel: string;
  };
  cartUi: {
    title: string;
    accent: string;
    emptyTitle: string;
    emptyBody: string;
    continueShoppingLabel: string;
    summaryTitle: string;
    subtotalLabel: string;
    clearCartLabel: string;
    checkoutLabel: string;
    quantityLabel: string;
    removeLabel: string;
    noteLabel: string;
  };
    checkoutUi: {
      title: string;
      accent: string;
      summaryTitle: string;
      deliveryTitle: string;
      pickupTitle: string;
      standardDeliveryLabel: string;
      tomorrowDeliveryLabel: string;
      todayDeliveryLabel: string;
      pickupLabel: string;
      freeDeliveryMessage: string;
      taxesLabel: string;
      totalLabel: string;
      customerTitle: string;
      paymentTitle: string;
      cardMethodLabel: string;
      paypalMethodLabel: string;
      cardDescription: string;
      paypalDescription: string;
      emailLabel: string;
      nameLabel: string;
      phoneLabel: string;
      addressLabel: string;
      cityLabel: string;
      postalCodeLabel: string;
      cardNumberLabel: string;
      cardNameLabel: string;
      cardExpiryLabel: string;
      cardCvcLabel: string;
      paypalEmailLabel: string;
      payWithCardLabel: string;
      payWithPaypalLabel: string;
      loadingQuoteLabel: string;
      missingCartLabel: string;
      checkoutDisclaimer: string;
      passportTitle: string;
      passportDescription: string;
      passportPromoPrice: string;
      passportRegularPrice: string;
      passportCheckboxLabel: string;
      passportApplied: string;
      subscribeAndSaveTitle: string;
      subscribeAndSaveDescription: string;
      subscribeAndSaveCheckboxLabel: string;
      subscribeAndSaveDiscount: string;
      subscribeModalNextPurchase: string;
      emailPlaceholder: string;
      submitting: string;
      continueButton: string;
      autoBuyModalTitle: string;
      autoBuyModalDescription: string;
      autoBuyFrequencyLabel: string;
      autoBuyFrequencyWeekly: string;
      autoBuyFrequencyBiweekly: string;
      autoBuyFrequencyMonthly: string;
      autoBuyCancelButton: string;
      autoBuyConfirmButton: string;
      deliveryMethodLabel: string;
      deliveryMethodPickup: string;
      deliveryMethodStandard: string;
      deliveryMethodTomorrow: string;
      deliveryMethodToday: string;
      deliveryPriceFree: string;
      deliveryPriceMemberDiscount: string;
    };
  checkoutSuccessUi: {
    title: string;
    subtitle: string;
    orderNumberLabel: string;
    dateLabel: string;
    deliveryTypePickup: string;
    deliveryTypeDelivery: string;
    storeAddress: string;
    registeredAddress: string;
    estimatedDeliveryLabel: string;
    estimatedDeliveryToday: string;
    estimatedDeliveryTomorrow: string;
    nextStepsTitle: string;
    nextStepEmailConfirmation: string;
    nextStepPreparation: string;
    nextStepPickupNotification: string;
    nextStepDeliveryNotification: string;
    continueShoppingButton: string;
    backToHomeButton: string;
  };
  footer: {
    brandTagline: string;
    description: string;
    linksTitle: string;
    links: Array<{
      label: string;
      href: string;
    }>;
    contactTitle: string;
    location: string;
    shipping: string;
    rights: string;
    madeWith: string;
    country: string;
  };
  loginUi: {
    pageTitle: string;
    pageSubtitle: string;
    tabLogin: string;
    tabRegister: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    passwordConfirmLabel: string;
    passwordConfirmPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    loginButton: string;
    registerButton: string;
    orDivider: string;
    googleButton: string;
    appleButton: string;
    forgotPassword: string;
    loginSuccess: string;
    errorInvalidCredentials: string;
    errorGeneric: string;
    errorPasswordMismatch: string;
    backToHome: string;
    accountTitle: string;
    accountGreeting: string;
    accountEmail: string;
    accountRole: string;
    accountRoleCustomer: string;
    accountRoleAdmin: string;
    logoutButton: string;
    myOrdersTitle: string;
    myOrdersEmpty: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  es: {
    metadata: {
      title: "Details by MIMA | Arreglos Florales Hechos a Mano",
      description:
        "Arreglos florales artesanales para los momentos que importan. Cada detalle, hecho con amor. Envíos en toda la ciudad.",
    },
    navbar: {
      ariaLabel: "Navegación principal",
      brandTagline: "arreglos florales hechos a mano",
      openMenuLabel: "Abrir menú",
      closeMenuLabel: "Cerrar menú",
      cartLabel: "Carrito",
      cartAriaLabel: "Abrir carrito",
      links: [
        { name: "Inicio", href: "/" },
        { name: "Ordenar", href: "/order", emphasis: true },
        { name: "Día de la Madre", href: "/mothers-day" },
        {
          name: "Ocasiones",
          children: [
            { name: "Cumpleaños", href: "/occasions/birthday" },
            { name: "Love and Romance", href: "/occasions/valentines-day" },
            { name: "San Valentín", href: "/occasions/valentines-day" },
            { name: "Recién nacido", href: "/occasions/new-baby" },
            { name: "Aniversario", href: "/occasions/anniversary" },
            { name: "Graduación", href: "/occasions/graduation" },
            { name: "Gracias", href: "/occasions/thank-you" },
            { name: "Recupérate pronto", href: "/occasions/get-well" },
          ],
        },
        { name: "Nosotros", href: "/about" },
        { name: "Contacto", href: "/contact" },
        { name: "Suscripciones", href: "/subscriptions" },
        { name: "Mi Cuenta", href: "/account" },
      ],
    },
    homeBanner: {
      eyebrow: "Colección floral curada",
      title: "Flowers",
      accent: "& Thoughtful Gifts",
      description:
        "Beautiful gift boxes and floral arrangements to celebrate the moments that matter most.",
      primaryCtaLabel: "Compra ahora",
      primaryCtaHref: "/order",
      secondaryCtaLabel: "Conocer nuestra historia",
      secondaryCtaHref: "/about",
      featuredCard: {
        eyebrow: "Nuevo recorrido",
        title: "Compra por ocasión, evento o estilo",
        body: "Ahora cada menú tiene su propia página con filtros por categorías, colores y estilos para elegir más fácil.",
      },
      highlights: [
        {
          eyebrow: "Best sellers",
          title: "Los más vendidos",
          body: "Una selección rápida para quienes quieren acertar sin perder tiempo buscando.",
        },
        {
          eyebrow: "Eventos",
          title: "Montajes y celebraciones",
          body: "Desde bodas hasta picnics y baby showers con arreglos pensados para el ambiente.",
        },
      ],
    },
    bestSellers: {
      eyebrow: "Favoritos de clientes",
      title: "Best",
      accent: "sellers",
      description:
        "Estos son los arreglos más vendidos y más recomendados para regalar sin fallar.",
      cta: "Ver catálogo completo",
    },
    hero: {
      title: "Regalos que hablan",
      accent: "desde el corazón",
      description:
        "Arreglos florales artesanales para los momentos que importan. Cada detalle, hecho con amor.",
      primaryCta: "Ver Arreglos",
      secondaryCta: "Nuestra Historia",
      badgeTitle: "100% artesanal",
      badgeSubtitle: "Diseñado a mano",
    },
    about: {
      eyebrow: "Nosotros",
      title: "La historia detrás de",
      accent: "cada arreglo",
      description: "Una historia nacida del amor, la familia y los regalos con intención.",
      intro:
        "Details by MIMA nació para convertir flores en regalos con intención: piezas hechas a mano que acompañan momentos importantes y cuentan algo verdadero sobre quien las envía.",
      quote:
        "Creamos regalos y cajas con arreglos florales, chocolates, cremas y detalles elegidos para que cada entrega se sienta especial desde el primer vistazo.",
      missionTitle: "Nuestra misión",
      missionBody:
        "Crear arreglos que se sientan personales, cálidos y memorables, combinando flores frescas, diseño artesanal y una atención cuidadosa a cada detalle para que cada entrega tenga significado.",
      storyTitle: "La historia detrás del producto",
      storyBody:
        "Todo empezó con la idea de que un arreglo floral no debía sentirse genérico. Por eso cada creación se diseña desde la emoción de la ocasión, el estilo de la persona que recibe el regalo y la calidad de materiales que realmente elevan la experiencia.",
      mapTitle: "Nuestra ubicación",
      mapAddress: "Palmetto Bay, Miami, Florida",
      faqTitle: "Preguntas frecuentes",
      faqs: [
        {
          question: "¿Con cuánta anticipación debo hacer mi pedido?",
          answer: "Te recomendamos ordenar con al menos 2 días de anticipación, aunque también manejamos opciones urgentes según disponibilidad.",
        },
        {
          question: "¿Puedo personalizar mi caja de regalo?",
          answer: "Sí. Puedes elegir colores, chocolates, self care, dedicatoria y otros detalles para que el regalo se sienta totalmente tuyo.",
        },
        {
          question: "¿Puedo recoger mi pedido en tienda?",
          answer: "Sí, ofrecemos pick up in store además de entrega en el área de Miami.",
        },
      ],
      values: [
        {
          title: "Diseño con intención",
          body: "Cada composición se piensa para transmitir una emoción concreta, no solo para verse bonita.",
        },
        {
          title: "Hecho a mano",
          body: "Seleccionamos flores y detalles uno a uno para lograr acabados delicados y auténticos.",
        },
        {
          title: "Momentos memorables",
          body: "Creamos regalos que acompañan celebraciones, agradecimientos y gestos de amor con sensibilidad.",
        },
      ],
      stats: [
        { value: "500+", label: "clientes felices" },
        { value: "100%", label: "hecho a mano" },
        { value: "Envíos", label: "a toda la ciudad" },
      ],
    },
    services: {
      title: "Nuestros",
      accent: "Arreglos",
      description:
        "Cada creación es única, hecha con flores frescas de temporada y el toque mágico de MIMA.",
      items: [
        {
          title: "Bouquets Personalizados",
          desc: "Ramos a medida para cualquier ocasión. Bodas, cumpleaños, aniversarios.",
          icon: "💐",
        },
        {
          title: "Cajas de Flores",
          desc: "Elegantes cajas sorpresa con arreglos florales y detalles especiales.",
          icon: "🎁",
        },
        {
          title: "Arreglos de Mesa",
          desc: "Centros de mesa para eventos y celebraciones que dejan huella.",
          icon: "✨",
        },
        {
          title: "Regalos Especiales",
          desc: "Combina flores con chocolates, vinos y más para un regalo inolvidable.",
          icon: "🍾",
        },
      ],
    },
    howItWorks: {
      title: "Tu pedido en",
      accent: "3 pasos",
      steps: [
        {
          num: "01",
          title: "Elige tu arreglo",
          desc: "Navega nuestro catálogo y selecciona el arreglo perfecto para la ocasión.",
        },
        {
          num: "02",
          title: "Personaliza",
          desc: "Añade un mensaje, elige los colores y dinos cualquier detalle especial.",
        },
        {
          num: "03",
          title: "Recibe con amor",
          desc: "Entregamos con cuidado para que cada detalle llegue perfecto.",
        },
      ],
    },
    gallery: {
      title: "Creaciones que",
      accent: "enamoran",
      description:
        "Cada arreglo es diseñado a mano con las flores más frescas y los materiales más cuidadosamente seleccionados.",
      cta: "Ver más en Instagram",
      items: [
        { label: "Bouquet Primavera", bg: "from-rose-400 to-rose-200" },
        { label: "Caja Romántica", bg: "from-pink-300 to-red-400" },
        { label: "Arreglo Boda", bg: "from-rose-100 to-rose-300" },
        { label: "Centro de Mesa", bg: "from-red-200 to-rose-400" },
        { label: "Bouquet Elegante", bg: "from-rose-300 to-pink-500" },
        { label: "Detalle Especial", bg: "from-rose-400 to-red-300" },
      ],
    },
    testimonials: {
      title: "Lo que dicen",
      accent: "nuestros clientes",
      items: [
        {
          text: "El arreglo que pedí para el cumpleaños de mi mamá fue absolutamente hermoso. MIMA superó todas mis expectativas.",
          author: "María G.",
          stars: 5,
        },
        {
          text: "Pedí un bouquet para mi boda y fue perfecto. Las flores duraron más de una semana y el servicio fue impecable.",
          author: "Laura V.",
          stars: 5,
        },
        {
          text: "Siempre que necesito un regalo especial, recurro a Details by MIMA. Los detalles que agregan son únicos.",
          author: "Ana P.",
          stars: 5,
        },
        {
          text: "La presentación de la caja fue impecable y se sintió realmente premium desde el primer vistazo.",
          author: "Camila R.",
          stars: 5,
        },
        {
          text: "Pedí un regalo para una amiga y quedó fascinada con la combinación de flores y detalles.",
          author: "Sofía M.",
          stars: 5,
        },
        {
          text: "La atención fue muy cercana y me ayudaron a personalizar todo justo como lo quería.",
          author: "Valentina C.",
          stars: 5,
        },
        {
          text: "El arreglo llegó precioso y la calidad de las flores se notó inmediatamente.",
          author: "Daniela T.",
          stars: 5,
        },
        {
          text: "Perfecto para regalar algo distinto y elegante, sin sentirse genérico.",
          author: "Paula L.",
          stars: 5,
        },
        {
          text: "Me encantó poder elegir los detalles y ver que todo llegó tal como lo imaginé.",
          author: "Mariana F.",
          stars: 5,
        },
        {
          text: "La dedicación en cada detalle hace que la experiencia se sienta muy especial.",
          author: "Andrea V.",
          stars: 5,
        },
        {
          text: "Fue uno de los regalos más bonitos que he enviado. Se nota el cuidado en todo.",
          author: "Isabella N.",
          stars: 5,
        },
        {
          text: "Desde el empaque hasta la entrega, todo se sintió pensado con muchísimo cariño.",
          author: "Lucía B.",
          stars: 5,
        },
      ],
    },
    contact: {
      eyebrow: "Contáctanos",
      title: "¿Lista para sorprender a alguien",
      accent: "especial?",
      description:
        "Contáctanos y creemos juntas el arreglo perfecto para tu ocasión.",
      whatsappCta: "Chat por WhatsApp",
      hoursTitle: "Horario de tienda",
      hours: [
        "Lunes · 9:00 AM - 8:00 PM",
        "Martes · 9:00 AM - 8:00 PM",
        "Miércoles · 9:00 AM - 8:00 PM",
        "Jueves · 9:00 AM - 8:00 PM",
        "Viernes · 9:00 AM - 8:00 PM",
        "Sábado · 10:00 AM - 6:00 PM",
        "Domingo · Cerrado",
      ],
      mapTitle: "Palmetto Bay, Miami, Florida",
      mapAddress: "Palmetto Bay, Miami, Florida",
      faqTitle: "Preguntas frecuentes",
      faqs: [
        {
          question: "¿Con cuánta anticipación debo hacer mi pedido?",
          answer: "Te recomendamos ordenar con al menos 2 días de anticipación, aunque también manejamos opciones urgentes según disponibilidad.",
        },
        {
          question: "¿Puedo personalizar mi caja de regalo?",
          answer: "Sí. Puedes elegir colores, chocolates, self care, dedicatoria y otros detalles para que el regalo se sienta totalmente tuyo.",
        },
        {
          question: "¿Puedo recoger mi pedido en tienda?",
          answer: "Sí, ofrecemos pick up in store además de entrega en el área de Miami.",
        },
      ],
      formTitle: "Envíanos un mensaje",
      fields: {
        name: "Nombre",
        namePlaceholder: "Tu nombre completo",
        email: "Email",
        emailPlaceholder: "tu@email.com",
        message: "Mensaje",
        messagePlaceholder: "Cuéntanos sobre tu ocasión especial...",
      },
      submitLabel: "Enviar Mensaje",
    },
    catalogUi: {
      filtersTitle: "Filtrar productos",
      clearFiltersLabel: "Limpiar",
      searchPlaceholder: "Buscar por nombre",
      resultsLabel: "{count} productos · {filters} filtros activos",
      emptyStateTitle: "No encontramos productos con esos filtros",
      emptyStateBody: "Prueba con menos filtros o busca otro nombre para descubrir más opciones.",
      orderNowLabel: "Pedir este arreglo",
      bestSellerBadge: "Best seller",
      viewDetailsLabel: "Ver detalles",
      startingAtLabel: "Desde",
    },
    productUi: {
      backToCatalogLabel: "Volver al catálogo",
      startingAtLabel: "Desde",
      priceSummaryLabel: "Resumen de precio",
      basePriceLabel: "Precio base",
      customizationLabel: "Personaliza tu regalo",
      noteLabel: "Mensaje para la tarjeta",
      notePlaceholder: "Escribe aquí el mensaje o instrucciones especiales...",
      addToCartLabel: "Agregar al carrito",
      addedToCartLabel: "Agregado al carrito",
      buyNowLabel: "Comprar ahora",
      quantityLabel: "Cantidad",
      includesLabel: "Incluye",
    },
    cartUi: {
      title: "Tu",
      accent: "carrito",
      emptyTitle: "Tu carrito está vacío",
      emptyBody: "Cuando agregues un arreglo personalizado, aparecerá aquí con todas sus opciones.",
      continueShoppingLabel: "Seguir comprando",
      summaryTitle: "Resumen",
      subtotalLabel: "Subtotal",
      clearCartLabel: "Vaciar carrito",
      checkoutLabel: "Ir al checkout",
      quantityLabel: "Cantidad",
      removeLabel: "Quitar",
      noteLabel: "Nota",
    },
    checkoutUi: {
      title: "Finaliza tu",
      accent: "compra",
      summaryTitle: "Resumen del pedido",
      deliveryTitle: "Método de entrega",
      pickupTitle: "Recoger en tienda",
      standardDeliveryLabel: "Standard · 2 días",
      tomorrowDeliveryLabel: "Tomorrow · next day",
      todayDeliveryLabel: "Same day",
      pickupLabel: "Pick up in store",
      freeDeliveryMessage: "Free delivery en compras mayores a $100",
      taxesLabel: "Taxes",
      totalLabel: "Total",
      customerTitle: "Tus datos",
      paymentTitle: "Método de pago",
      cardMethodLabel: "Tarjeta",
      paypalMethodLabel: "PayPal",
      cardDescription: "Procesa el pago con tarjeta en checkout seguro de Stripe.",
      paypalDescription: "Continúa con PayPal para aprobar y procesar el pago.",
      emailLabel: "Email",
      nameLabel: "Nombre completo",
      phoneLabel: "Teléfono",
      addressLabel: "Dirección",
      cityLabel: "Ciudad",
      postalCodeLabel: "ZIP Code",
      cardNumberLabel: "Card number",
      cardNameLabel: "Name on card",
      cardExpiryLabel: "Expiry",
      cardCvcLabel: "CVC",
      paypalEmailLabel: "PayPal email",
      payWithCardLabel: "Pagar con tarjeta",
      payWithPaypalLabel: "Pagar con PayPal",
      loadingQuoteLabel: "Actualizando total...",
      missingCartLabel: "Tu carrito está vacío. Agrega un producto antes de continuar al checkout.",
      checkoutDisclaimer: "Los totales se validan en servidor antes de procesar cualquier pago.",
      passportTitle: "Passport",
      passportDescription: "Envíos gratis todo el año por un único pago.",
      passportPromoPrice: "$19.99",
      passportRegularPrice: "$29.99",
      passportCheckboxLabel: "Passport - Free Delivery All Year",
      passportApplied: "Passport aplicado",
      subscribeAndSaveTitle: "Suscríbete y Ahorra",
      subscribeAndSaveDescription: "Recibe tus productos favoritos automáticamente y ahorra un 10%.",
      subscribeAndSaveCheckboxLabel: "Suscríbete y Ahorra (10% descuento)",
      subscribeAndSaveDiscount: "10% de descuento",
      subscribeModalNextPurchase: "en tu próxima compra",
      emailPlaceholder: "tu@email.com",
      submitting: "Enviando...",
      continueButton: "Continuar",
      autoBuyModalTitle: "Configurar Auto-Compra",
      autoBuyModalDescription: "Elige con qué frecuencia quieres recibir este pedido automáticamente.",
      autoBuyFrequencyLabel: "Frecuencia de entrega",
      autoBuyFrequencyWeekly: "Semanal",
      autoBuyFrequencyBiweekly: "Quincenal",
      autoBuyFrequencyMonthly: "Mensual",
      autoBuyCancelButton: "Cancelar",
      autoBuyConfirmButton: "Confirmar",
      deliveryMethodLabel: "Método de entrega",
      deliveryMethodPickup: "Recoger en tienda",
      deliveryMethodStandard: "Entrega estándar",
      deliveryMethodTomorrow: "Entrega mañana",
      deliveryMethodToday: "Entrega hoy",
      deliveryPriceFree: "Gratis",
      deliveryPriceMemberDiscount: "Descuento para miembros",
    },
    checkoutSuccessUi: {
      title: "¡Pedido Confirmado!",
      subtitle: "Gracias por tu compra. Hemos recibido tu orden.",
      orderNumberLabel: "Número de Orden",
      dateLabel: "Fecha",
      deliveryTypePickup: "Recoge en Tienda",
      deliveryTypeDelivery: "Entrega a Domicilio",
      storeAddress: "Calle 123 #45-67, Local 2",
      registeredAddress: "Dirección registrada en tu perfil",
      estimatedDeliveryLabel: "Entrega Estimada",
      estimatedDeliveryToday: "Hoy - Recoge en tienda",
      estimatedDeliveryTomorrow: "Mañana",
      nextStepsTitle: "Próximos Pasos",
      nextStepEmailConfirmation: "Recibirás un correo de confirmación con los detalles de tu pedido",
      nextStepPreparation: "Preparamos tu pedido con el mayor cuidado",
      nextStepPickupNotification: "Te notificaremos cuando esté listo para recoger",
      nextStepDeliveryNotification: "Te notificaremos cuando esté en camino",
      continueShoppingButton: "Seguir Comprando",
      backToHomeButton: "Volver al Inicio",
    },
    footer: {
      brandTagline: "arreglos florales hechos a mano",
      description:
        "Regalos que hablan desde el corazón. Cada detalle es elaborado artesanalmente para acompañarte en los momentos más especiales.",
      linksTitle: "Enlaces",
      links: [
        { label: "Inicio", href: "/" },
        { label: "Ordenar", href: "/order" },
        { label: "Nosotros", href: "/about" },
        { label: "Contacto", href: "/contact" },
      ],
      contactTitle: "Contacto",
      location: "Palmetto Bay, Miami, Florida",
      shipping: "Gift delivery across the Miami area",
      rights: "© 2025 Details by MIMA. Todos los derechos reservados.",
      madeWith: "Hecho con",
      country: "en Florida",
    },
    loginUi: {
      pageTitle: "Bienvenida de vuelta",
      pageSubtitle: "Inicia sesión para ver tus pedidos y gestionar tu cuenta.",
      tabLogin: "Iniciar sesión",
      tabRegister: "Crear cuenta",
      emailLabel: "Email",
      emailPlaceholder: "tu@email.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Tu contraseña",
      passwordConfirmLabel: "Confirmar contraseña",
      passwordConfirmPlaceholder: "Repite tu contraseña",
      phoneLabel: "Teléfono",
      phonePlaceholder: "+1 (305) 555-0123",
      nameLabel: "Nombre completo",
      namePlaceholder: "Tu nombre",
      loginButton: "Iniciar sesión",
      registerButton: "Crear cuenta",
      orDivider: "o continúa con",
      googleButton: "Continuar con Google",
      appleButton: "Continuar con Apple",
      forgotPassword: "¿Olvidaste tu contraseña?",
      loginSuccess: "¡Bienvenida!",
      errorInvalidCredentials: "Email o contraseña incorrectos.",
      errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
      errorPasswordMismatch: "Las contraseñas no coinciden.",
      backToHome: "Volver al inicio",
      accountTitle: "Mi cuenta",
      accountGreeting: "Hola",
      accountEmail: "Email",
      accountRole: "Rol",
      accountRoleCustomer: "Cliente",
      accountRoleAdmin: "Administradora",
      logoutButton: "Cerrar sesión",
      myOrdersTitle: "Mis pedidos",
      myOrdersEmpty: "Aún no tienes pedidos. ¡Explora el catálogo y haz tu primer pedido!",
    },
  },
  en: {
    metadata: {
      title: "Details by MIMA | Made for special moments",
      description:
        "Made for special moments, with floral arrangements created for the moments that matter. Every detail, made with love. Citywide delivery available.",
    },
    navbar: {
      ariaLabel: "Primary navigation",
      brandTagline: "Made for special moments",
      openMenuLabel: "Open menu",
      closeMenuLabel: "Close menu",
      cartLabel: "Cart",
      cartAriaLabel: "Open cart",
      links: [
        { name: "Home", href: "/" },
        { name: "Order", href: "/order", emphasis: true },
        { name: "Mother's Day", href: "/mothers-day" },
        {
          name: "Occasions",
          children: [
            { name: "Birthday", href: "/occasions/birthday" },
            { name: "Love and Romance", href: "/occasions/valentines-day" },
            { name: "Valentine's Day", href: "/occasions/valentines-day" },
            { name: "New Baby", href: "/occasions/new-baby" },
            { name: "Anniversary", href: "/occasions/anniversary" },
            { name: "Graduation", href: "/occasions/graduation" },
            { name: "Thank You", href: "/occasions/thank-you" },
            { name: "Get Well", href: "/occasions/get-well" },
          ],
        },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Subscriptions", href: "/subscriptions" },
        { name: "My Account", href: "/account" },
      ],
    },
    homeBanner: {
      eyebrow: "Curated floral collections",
      title: "Flowers",
      accent: "& Thoughtful Gifts",
      description:
        "Beautiful gift boxes and floral arrangements to celebrate the moments that matter most.",
      primaryCtaLabel: "Shop now",
      primaryCtaHref: "/order",
      secondaryCtaLabel: "Discover our story",
      secondaryCtaHref: "/about",
      featuredCard: {
        eyebrow: "New shopping flow",
        title: "Shop by occasion, event, or style",
        body: "Every menu now has its own page, plus filters by category, color, and style to make choosing easier.",
      },
      highlights: [
        {
          eyebrow: "Best sellers",
          title: "Most loved picks",
          body: "A fast edit of the arrangements customers order again and again.",
        },
        {
          eyebrow: "Events",
          title: "Styling for celebrations",
          body: "From weddings to picnics and baby showers, each setup has its own floral edit.",
        },
      ],
    },
    bestSellers: {
      eyebrow: "Customer favorites",
      title: "Best",
      accent: "sellers",
      description:
        "These are the top-selling arrangements and the safest picks when you want to impress quickly.",
      cta: "See the full catalog",
    },
    hero: {
      title: "Gifts that speak",
      accent: "from the heart",
      description:
        "Made for special moments, with floral arrangements for the times that matter most. Every detail, made with love.",
      primaryCta: "Browse Arrangements",
      secondaryCta: "Our Story",
      badgeTitle: "Made for special moments",
      badgeSubtitle: "Designed by hand",
    },
      about: {
        eyebrow: "About",
        title: "The story behind",
        accent: "every arrangement",
        description: "A story shaped by love, family traditions, and meaningful gifting.",
        intro:
          "Details by Mima was inspired by my grandmother.\n\nI started this business on Mother’s Day, remembering the moments from my childhood when I would go with her to buy gifts for all the mothers in our family. She believed that special dates should never pass unnoticed and that a thoughtful gift could make someone feel truly loved.\n\nDetails by Mima was created to help people celebrate life’s special moments with beautiful gift boxes filled with flowers, chocolates, and thoughtful details.\n\n✨ Inspired by love, family traditions, and meaningful moments.",
        quote: "",
      missionTitle: "Our mission",
      missionBody:
        "We craft arrangements that feel personal, warm, and memorable by combining fresh flowers, artisanal design, and thoughtful attention to every detail so each delivery carries meaning.",
      storyTitle: "The story behind our product",
        storyBody: "",
      mapTitle: "Our location",
      mapAddress: "Palmetto Bay, Miami, Florida",
      faqTitle: "Frequently asked questions",
      faqs: [
        {
          question: "How far in advance should I place my order?",
          answer: "We recommend placing your order at least 2 days in advance, although we can also handle urgent requests depending on availability.",
        },
        {
          question: "Can I customize my gift box?",
          answer: "Yes. You can choose colors, chocolates, self care, a dedication card, and other details to make the gift feel fully yours.",
        },
        {
          question: "Can I pick up my order in store?",
          answer: "Yes, we offer pick up in store in addition to delivery across the Miami area.",
        },
      ],
      values: [
        {
          title: "Intentional design",
          body: "Each composition is shaped to express a feeling, not simply to look beautiful.",
        },
        {
          title: "Made by hand",
          body: "We select flowers and finishing details one by one for a delicate, authentic result.",
        },
        {
          title: "Memorable moments",
          body: "We create gifts that accompany celebrations, gratitude, and loving gestures with care.",
        },
      ],
      stats: [
        { value: "500+", label: "happy clients" },
        { value: "100%", label: "handmade" },
        { value: "Delivery", label: "across the city" },
      ],
    },
    services: {
      title: "Our",
      accent: "Arrangements",
      description:
        "Every creation is one of a kind, made with fresh seasonal flowers and MIMA's signature touch.",
      items: [
        {
          title: "Custom Bouquets",
          desc: "Tailored bouquets for any occasion—weddings, birthdays, and anniversaries.",
          icon: "💐",
        },
        {
          title: "Flower Boxes",
          desc: "Elegant surprise boxes with floral arrangements and thoughtful extras.",
          icon: "🎁",
        },
        {
          title: "Table Arrangements",
          desc: "Centerpieces for events and celebrations that leave a lasting impression.",
          icon: "✨",
        },
        {
          title: "Special Gifts",
          desc: "Pair flowers with chocolates, wine, and more for an unforgettable gift.",
          icon: "🍾",
        },
      ],
    },
    howItWorks: {
      title: "Your order in",
      accent: "3 steps",
      steps: [
        {
          num: "01",
          title: "Choose your arrangement",
          desc: "Browse the collection and select the perfect arrangement for the occasion.",
        },
        {
          num: "02",
          title: "Personalize it",
          desc: "Add a message, pick your colors, and share any special details with us.",
        },
        {
          num: "03",
          title: "Receive it with love",
          desc: "We deliver with care so every detail arrives beautifully and on time.",
        },
      ],
    },
    gallery: {
      title: "Creations that",
      accent: "make hearts bloom",
      description:
        "Every arrangement is crafted by hand with the freshest flowers and carefully selected materials.",
      cta: "See more on Instagram",
      items: [
        { label: "Spring Bouquet", bg: "from-rose-400 to-rose-200" },
        { label: "Romantic Box", bg: "from-pink-300 to-red-400" },
        { label: "Wedding Arrangement", bg: "from-rose-100 to-rose-300" },
        { label: "Table Centerpiece", bg: "from-red-200 to-rose-400" },
        { label: "Elegant Bouquet", bg: "from-rose-300 to-pink-500" },
        { label: "Signature Gift", bg: "from-rose-400 to-red-300" },
      ],
    },
    testimonials: {
      title: "What",
      accent: "our clients say",
      items: [
        {
          text: "The arrangement I ordered for my mom's birthday was absolutely beautiful. MIMA exceeded every expectation.",
          author: "María G.",
          stars: 5,
        },
        {
          text: "I ordered a bouquet for my wedding and it was perfect. The flowers lasted more than a week and the service was flawless.",
          author: "Laura V.",
          stars: 5,
        },
        {
          text: "Whenever I need a meaningful gift, I come back to Details by MIMA. The extra touches always feel special.",
          author: "Ana P.",
          stars: 5,
        },
        {
          text: "The presentation of the box felt premium from the very first moment.",
          author: "Camila R.",
          stars: 5,
        },
        {
          text: "I ordered a gift for a friend and she was in love with the flowers and details.",
          author: "Sofía M.",
          stars: 5,
        },
        {
          text: "The team helped me personalize everything and the result felt exactly right.",
          author: "Valentina C.",
          stars: 5,
        },
        {
          text: "The arrangement arrived beautifully and the flower quality stood out immediately.",
          author: "Daniela T.",
          stars: 5,
        },
        {
          text: "Perfect when you want to send something elegant that never feels generic.",
          author: "Paula L.",
          stars: 5,
        },
        {
          text: "I loved being able to choose the details and then seeing everything arrive exactly as imagined.",
          author: "Mariana F.",
          stars: 5,
        },
        {
          text: "The care behind every detail makes the whole experience feel incredibly special.",
          author: "Andrea V.",
          stars: 5,
        },
        {
          text: "It was one of the most beautiful gifts I’ve ever sent. You can feel the care in everything.",
          author: "Isabella N.",
          stars: 5,
        },
        {
          text: "From packaging to delivery, every step felt intentional and full of heart.",
          author: "Lucía B.",
          stars: 5,
        },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Ready to surprise someone",
      accent: "special?",
      description:
        "Get in touch and let's create the perfect arrangement for your occasion together.",
      whatsappCta: "Chat on WhatsApp",
      hoursTitle: "Store hours",
      hours: [
        "Monday · 9:00 AM - 8:00 PM",
        "Tuesday · 9:00 AM - 8:00 PM",
        "Wednesday · 9:00 AM - 8:00 PM",
        "Thursday · 9:00 AM - 8:00 PM",
        "Friday · 9:00 AM - 8:00 PM",
        "Saturday · 10:00 AM - 6:00 PM",
        "Sunday · Closed",
      ],
      mapTitle: "Palmetto Bay, Miami, Florida",
      mapAddress: "Palmetto Bay, Miami, Florida",
      faqTitle: "Frequently asked questions",
      faqs: [
        {
          question: "How far in advance should I place my order?",
          answer: "We recommend placing your order at least 2 days in advance, although we can also handle urgent requests depending on availability.",
        },
        {
          question: "Can I customize my gift box?",
          answer: "Yes. You can choose colors, chocolates, self care, a dedication card, and other details to make the gift feel fully yours.",
        },
        {
          question: "Can I pick up my order in store?",
          answer: "Yes, we offer pick up in store in addition to delivery across the Miami area.",
        },
      ],
      formTitle: "Send us a message",
      fields: {
        name: "Name",
        namePlaceholder: "Your full name",
        email: "Email",
        emailPlaceholder: "you@email.com",
        message: "Message",
        messagePlaceholder: "Tell us about your special occasion...",
      },
      submitLabel: "Send Message",
    },
    catalogUi: {
      filtersTitle: "Filter products",
      clearFiltersLabel: "Clear",
      searchPlaceholder: "Search by product name",
      resultsLabel: "{count} products · {filters} active filters",
      emptyStateTitle: "No products matched those filters",
      emptyStateBody: "Try fewer filters or search for a different name to discover more options.",
      orderNowLabel: "Order this arrangement",
      bestSellerBadge: "Best seller",
      viewDetailsLabel: "View details",
      startingAtLabel: "Starting at",
    },
    productUi: {
      backToCatalogLabel: "Back to catalog",
      startingAtLabel: "Starting at",
      priceSummaryLabel: "Price summary",
      basePriceLabel: "Base price",
      customizationLabel: "Customize your gift",
      noteLabel: "Message for the card",
      notePlaceholder: "Write the message or any special instructions here...",
      addToCartLabel: "Add to cart",
      addedToCartLabel: "Added to cart",
      buyNowLabel: "Buy now",
      quantityLabel: "Quantity",
      includesLabel: "Includes",
    },
    cartUi: {
      title: "Your",
      accent: "cart",
      emptyTitle: "Your cart is empty",
      emptyBody: "Once you add a personalized arrangement, it will appear here with all selected options.",
      continueShoppingLabel: "Continue shopping",
      summaryTitle: "Summary",
      subtotalLabel: "Subtotal",
      clearCartLabel: "Clear cart",
      checkoutLabel: "Go to checkout",
      quantityLabel: "Quantity",
      removeLabel: "Remove",
      noteLabel: "Note",
    },
    checkoutUi: {
      title: "Complete your",
      accent: "checkout",
      summaryTitle: "Order summary",
      deliveryTitle: "Delivery method",
      pickupTitle: "Pick up in store",
      standardDeliveryLabel: "Standard · 2 days",
      tomorrowDeliveryLabel: "Tomorrow · next day",
      todayDeliveryLabel: "Same day",
      pickupLabel: "Pick up in store",
      freeDeliveryMessage: "Free delivery on orders over $100",
      taxesLabel: "Taxes",
      totalLabel: "Total",
      customerTitle: "Your details",
      paymentTitle: "Payment method",
      cardMethodLabel: "Card",
      paypalMethodLabel: "PayPal",
      cardDescription: "Process your card payment through secure Stripe checkout.",
      paypalDescription: "Continue with PayPal to approve and process your payment.",
      emailLabel: "Email",
      nameLabel: "Full name",
      phoneLabel: "Phone",
      addressLabel: "Address",
      cityLabel: "City",
      postalCodeLabel: "ZIP code",
      cardNumberLabel: "Card number",
      cardNameLabel: "Name on card",
      cardExpiryLabel: "Expiry",
      cardCvcLabel: "CVC",
      paypalEmailLabel: "PayPal email",
      payWithCardLabel: "Pay with card",
      payWithPaypalLabel: "Pay with PayPal",
      loadingQuoteLabel: "Updating total...",
      missingCartLabel: "Your cart is empty. Add a product before continuing to checkout.",
      checkoutDisclaimer: "Totals are validated on the server before any payment is processed.",
      passportTitle: "Passport",
      passportDescription: "Free delivery all year round with a single payment.",
      passportPromoPrice: "$19.99",
      passportRegularPrice: "$29.99",
      passportCheckboxLabel: "Passport - Free Delivery All Year",
      passportApplied: "Passport applied",
      subscribeAndSaveTitle: "Subscribe & Save",
      subscribeAndSaveDescription: "Get your favorite products automatically and save 10%.",
      subscribeAndSaveCheckboxLabel: "Subscribe & Save (10% off)",
      subscribeAndSaveDiscount: "10% discount",
      subscribeModalNextPurchase: "on your next purchase",
      emailPlaceholder: "you@email.com",
      submitting: "Submitting...",
      continueButton: "Continue",
      autoBuyModalTitle: "Configure Auto-Buy",
      autoBuyModalDescription: "Choose how often you want to receive this order automatically.",
      autoBuyFrequencyLabel: "Delivery frequency",
      autoBuyFrequencyWeekly: "Weekly",
      autoBuyFrequencyBiweekly: "Bi-weekly",
      autoBuyFrequencyMonthly: "Monthly",
      autoBuyCancelButton: "Cancel",
      autoBuyConfirmButton: "Confirm",
      deliveryMethodLabel: "Delivery method",
      deliveryMethodPickup: "Store pickup",
      deliveryMethodStandard: "Standard delivery",
      deliveryMethodTomorrow: "Delivery tomorrow",
      deliveryMethodToday: "Delivery today",
      deliveryPriceFree: "Free",
      deliveryPriceMemberDiscount: "Member discount",
    },
    checkoutSuccessUi: {
      title: "Order Confirmed!",
      subtitle: "Thank you for your purchase. We have received your order.",
      orderNumberLabel: "Order Number",
      dateLabel: "Date",
      deliveryTypePickup: "Store Pickup",
      deliveryTypeDelivery: "Home Delivery",
      storeAddress: "123 Main St #45-67, Unit 2",
      registeredAddress: "Address registered in your profile",
      estimatedDeliveryLabel: "Estimated Delivery",
      estimatedDeliveryToday: "Today - Pick up in store",
      estimatedDeliveryTomorrow: "Tomorrow",
      nextStepsTitle: "Next Steps",
      nextStepEmailConfirmation: "You will receive a confirmation email with your order details",
      nextStepPreparation: "We prepare your order with the utmost care",
      nextStepPickupNotification: "We will notify you when it's ready for pickup",
      nextStepDeliveryNotification: "We will notify you when it's on the way",
      continueShoppingButton: "Continue Shopping",
      backToHomeButton: "Back to Home",
    },
    footer: {
      brandTagline: "Made for special moments",
      description:
        "Gifts that speak from the heart. Every detail is made for special moments and created to accompany your most meaningful celebrations.",
      linksTitle: "Links",
      links: [
        { label: "Home", href: "/" },
        { label: "Order", href: "/order" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
      contactTitle: "Contact",
      location: "Palmetto Bay, Miami, Florida",
      shipping: "Gift delivery across the Miami area",
      rights: "© 2025 Details by MIMA. All rights reserved.",
      madeWith: "Made with",
      country: "in Florida",
    },
    loginUi: {
      pageTitle: "Welcome back",
      pageSubtitle: "Sign in to view your orders and manage your account.",
      tabLogin: "Sign in",
      tabRegister: "Create account",
      emailLabel: "Email",
      emailPlaceholder: "you@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Your password",
      passwordConfirmLabel: "Confirm password",
      passwordConfirmPlaceholder: "Repeat your password",
      phoneLabel: "Phone",
      phonePlaceholder: "+1 (305) 555-0123",
      nameLabel: "Full name",
      namePlaceholder: "Your name",
      loginButton: "Sign in",
      registerButton: "Create account",
      orDivider: "or continue with",
      googleButton: "Continue with Google",
      appleButton: "Continue with Apple",
      forgotPassword: "Forgot your password?",
      loginSuccess: "Welcome!",
      errorInvalidCredentials: "Incorrect email or password.",
      errorGeneric: "Something went wrong. Please try again.",
      errorPasswordMismatch: "Passwords do not match.",
      backToHome: "Back to home",
      accountTitle: "My account",
      accountGreeting: "Hello",
      accountEmail: "Email",
      accountRole: "Role",
      accountRoleCustomer: "Customer",
      accountRoleAdmin: "Admin",
      logoutButton: "Sign out",
      myOrdersTitle: "My orders",
      myOrdersEmpty: "No orders yet. Browse the catalog and place your first order!",
    },
  },
};

export type LandingDictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): LandingDictionary {
  return dictionaries[locale];
}

export function normalizeLocale(value?: string | null): Locale | null {
  if (!value) return null;

  const normalized = value.toLowerCase();
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("en")) return "en";

  return null;
}

export function resolveLocaleFromAcceptLanguage(header?: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const candidates = header.split(",").map((part) => part.split(";")[0]?.trim());

  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);
    if (locale) return locale;
  }

  return DEFAULT_LOCALE;
}

export function resolvePreferredLocale(options: {
  queryLocale?: string | null;
  cookieLocale?: string | null;
  headerLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  return (
    normalizeLocale(options.queryLocale) ??
    normalizeLocale(options.cookieLocale) ??
    normalizeLocale(options.headerLocale) ??
    resolveLocaleFromAcceptLanguage(options.acceptLanguage)
  );
}
