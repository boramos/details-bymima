# Details by MIMA

E-commerce floral shop con sistema de suscripciones, auto-buy recurrente, y checkout completo integrado con Stripe y PayPal.

## 🌟 Características Principales

### Sistema de Productos
- Catálogo completo de arreglos florales
- Opciones personalizables (tamaño, colores, extras)
- Sistema de precios dinámico basado en selecciones
- Best sellers destacados en home
- Imágenes con emoji y gradientes personalizados

### Checkout Completo
- Cotización en tiempo real
- Múltiples métodos de entrega:
  - 📦 Pickup (gratis)
  - 🚚 Standard (3-5 días)
  - ⚡ Tomorrow (próximo día)
  - 🔥 Same Day (antes de 12pm)
- Integración con Stripe y PayPal
- Cálculo automático de impuestos
- Envío gratis en compras > $100 USD

### Passport Subscription
- Suscripción anual por $19.99
- Envío gratis todo el año
- Precio promocional configurable
- Auto-renovación opcional

### Auto-Buy (Compra Recurrente)
- Frecuencias: Semanal, Mensual, Trimestral, Anual
- Recordatorios configurables
- Pausa/resume en cualquier momento
- Historial de ejecuciones

### Sistema de Configuración
- Precios y umbrales configurables sin código
- Almacenados en base de datos
- API endpoint para frontend
- Caché optimizado (5 min TTL)

### Autenticación
- NextAuth v5 con múltiples providers
- Registro con email/password
- OAuth providers (Google, etc.)
- Roles: ADMIN, CUSTOMER

### Multilenguaje (i18n)
- Español e Inglés
- Switching dinámico
- Contenido completo traducido

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16.2.2 (App Router)
- **React**: 19.x
- **Base de Datos**: SQLite con Prisma ORM
- **Autenticación**: NextAuth v5
- **Pagos**: Stripe + PayPal
- **Estilos**: Tailwind CSS
- **TypeScript**: Strict mode
- **Deployment**: Vercel

---

## 📦 Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd details-bymima

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus keys

# Inicializar base de datos
npx prisma generate
npx prisma db push
npx prisma db seed

# Inicializar configuraciones
npx tsx scripts/init-config.ts

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔑 Variables de Entorno

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# PayPal
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-client-secret"

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 📂 Estructura del Proyecto

```
/src
  /app
    /[page]              # Páginas dinámicas
    /account             # Panel de usuario
    /api                 # API Routes
      /auth              # NextAuth endpoints
      /cart              # Carrito APIs
      /checkout          # Checkout + Payments
      /config            # Configuraciones
      /orders            # Órdenes
      /passport          # Subscripciones Passport
      /products          # Catálogo
    /cart                # Página carrito
    /checkout            # Página checkout
    /login               # Login/Register
    /product/[slug]      # Detalle producto
  /components
    /auth                # Login/Register forms
    /cart                # Cart components
    /catalog             # Product cards/grid
    /checkout            # Checkout flow
    /delivery            # Address/delivery forms
    /home                # Landing components
    /product             # Product detail
  /lib
    /cart.ts             # Cart utilities
    /catalog.ts          # Product catalog data
    /checkout.ts         # Checkout logic
    /i18n.ts             # Internationalization
    /pricing.ts          # Price calculations
    /prisma.ts           # Prisma client
  /services
    /ConfigService.ts    # Configuraciones centralizadas
    /ProductService.ts   # Productos CRUD
    /OrderService.ts     # Órdenes CRUD
    /CartService.ts      # Carrito CRUD
    /UserService.ts      # Usuarios CRUD
    /PassportService.ts  # Passport subscriptions
    /AutoBuyService.ts   # Auto-buy recurrente
/prisma
  /schema.prisma         # Database schema
  /seed.ts               # Data seeding
/scripts
  /init-config.ts        # Inicializar configs
```

---

## 🗄️ Esquema de Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema
- **Product**: Catálogo de productos
- **Order**: Órdenes completadas
- **OrderItem**: Items de cada orden
- **CartItem**: Items en carrito
- **Address**: Direcciones de entrega
- **PassportSubscription**: Suscripciones Passport
- **AutoBuy**: Compras recurrentes configuradas
- **AutoBuyExecution**: Historial de ejecuciones
- **SiteConfig**: Configuraciones del sitio

Ver `/prisma/schema.prisma` para detalles completos.

---

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor desarrollo

# Build
npm run build            # Build producción
npm run start            # Inicia servidor producción

# Database
npx prisma studio        # Abrir Prisma Studio
npx prisma generate      # Generar Prisma Client
npx prisma db push       # Aplicar cambios schema
npx prisma db seed       # Poblar datos iniciales

# Scripts
npx tsx scripts/init-config.ts  # Inicializar configuraciones
```

---

## 📋 Configuraciones Disponibles

Las configuraciones se almacenan en la tabla `SiteConfig` y son editables vía API o directamente en BD:

| Key | Default | Descripción |
|---|---|---|
| `passport_price_usd` | 19.99 | Precio anual Passport |
| `free_delivery_threshold_usd` | 100 | Umbral envío gratis |
| `delivery_standard_usd` | 4 | Envío estándar |
| `delivery_tomorrow_usd` | 7 | Envío mañana |
| `delivery_today_usd` | 10 | Envío mismo día |
| `delivery_pickup_usd` | 0 | Pickup (gratis) |
| `tax_rate` | 0.07 | Tasa impuestos (7%) |

**API Endpoint**: `GET /api/config`

---

## 🔐 Roles y Permisos

- **CUSTOMER**: Usuario estándar, puede comprar y gestionar órdenes
- **ADMIN**: Acceso completo al sistema (futuro: panel admin)

---

## 💳 Flujo de Checkout

1. Usuario agrega productos al carrito
2. Va a `/checkout`
3. Sistema genera quote en tiempo real (`/api/checkout/quote`)
4. Usuario completa datos y selecciona método de pago
5. Redirige a Stripe/PayPal para pago seguro
6. Webhook confirma pago y crea orden
7. Usuario ve confirmación en `/checkout/success`

---

## 🌍 Internacionalización

El sitio soporta español e inglés. Los textos se gestionan en `/src/lib/i18n.ts`.

**Cambiar idioma**: El locale se detecta automáticamente o se puede forzar con parámetro URL.

---

## 📝 Changelog

Ver [CHANGELOG.md](./CHANGELOG.md) para historial completo de cambios.

---

## 📄 Licencia

Privado - Todos los derechos reservados.

---

## 👤 Autor

**Details by MIMA**
