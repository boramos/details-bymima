# Changelog - Details by MIMA

## [2026-04-08] Sistema de Configuración Centralizado + Mejoras UX

### 🎯 Nuevas Funcionalidades

#### Sistema de Configuración Centralizado
- **Tabla `SiteConfig` en Base de Datos**
  - Almacena todas las configuraciones del sitio (precios, umbrales, tasas)
  - Campos: `key`, `value`, `valueType`, `category`, `description`
  - Índices en `key` y `category` para búsquedas rápidas

- **ConfigService**
  - Servicio centralizado para manejar configuraciones
  - Caché en memoria de 5 minutos para optimizar rendimiento
  - Métodos: `get()`, `getMany()`, `getOrDefault()`, `set()`, `delete()`, `clearCache()`
  - Inicialización automática de valores por defecto

- **API Endpoint `/api/config`**
  - GET endpoint para obtener configuraciones en el frontend
  - Retorna todas las configuraciones de pricing, delivery y tax

- **Script de Inicialización**
  - `scripts/init-config.ts` - Inicializa valores por defecto en BD
  - Comando: `npx tsx scripts/init-config.ts`

#### Configuraciones Disponibles
| Configuración | Valor Default | Categoría | Descripción |
|---|---|---|---|
| `passport_price_usd` | 19.99 | pricing | Precio anual Passport subscription |
| `free_delivery_threshold_usd` | 100 | delivery | Umbral para envío gratis |
| `delivery_standard_usd` | 4 | delivery | Precio envío estándar (3-5 días) |
| `delivery_tomorrow_usd` | 7 | delivery | Precio envío mañana |
| `delivery_today_usd` | 10 | delivery | Precio envío mismo día (antes 12pm) |
| `delivery_pickup_usd` | 0 | delivery | Precio pickup (siempre gratis) |
| `tax_rate` | 0.07 | tax | Tasa de impuestos (7%) |

---

### 🔧 Mejoras Técnicas

#### Eliminación de Hardcode
**Antes:**
```typescript
const DELIVERY_PRICES = { standard: 4, tomorrow: 7, today: 10 };
const freeDeliveryApplied = subtotal > 100;
const taxes = subtotal * 0.07;
```

**Después:**
```typescript
const deliveryPrices = await getDeliveryPrices();
const threshold = await ConfigService.get("free_delivery_threshold_usd");
const taxRate = await ConfigService.get("tax_rate");
```

#### Archivos Modificados
- `/src/lib/checkout.ts`
  - Reemplazado `DELIVERY_PRICES` hardcoded con `getDeliveryPrices()` async
  - Umbral envío gratis ahora viene de ConfigService
  - Tasa de impuestos dinámica desde BD
  
- `/src/lib/pricing.ts`
  - `calculateProductPrice()` acepta `freeDeliveryThreshold` como parámetro
  - Permite calcular precios con diferentes umbrales según configuración

- `/prisma/schema.prisma`
  - Nueva tabla `SiteConfig` agregada
  - Migración exitosa aplicada

---

### 🎨 Mejoras de UX

#### Formulario de Checkout Simplificado
- **Campo de teléfono removido**
  - Eliminado del estado del formulario
  - Eliminado del UI (input visual)
  - Se solicitará después en el perfil de usuario
  - Compatibilidad mantenida con backend (envía string vacío)

#### Home - Best Sellers Grid
- **Grid de productos mejorado**
  - Cambio de 6 productos a 8 productos
  - Layout: `sm:grid-cols-2 lg:grid-cols-4`
  - Muestra 2 filas completas de 4 columnas
  - Visualmente más balanceado

#### Navbar - Cuenta de Usuario
- **Botón de cuenta icon-only**
  - Removido texto "Mi Cuenta" / "My Account"
  - Solo muestra ícono de usuario
  - Más profesional y limpio
  - Consistente en desktop y mobile

#### Auto-Buy Simplificado
- **De modal complejo a select simple**
  - Cambió de checkbox + modal a dropdown directo
  - Opciones: None, Weekly, Monthly, Quarterly, Annually
  - UX más fluida y menos clicks

#### Internacionalización (i18n)
- **Hardcode en español eliminado**
  - `SubscriptionsModal.tsx` - 4 textos corregidos
  - Nuevas keys i18n:
    - `subscribeModalNextPurchase`
    - `emailPlaceholder`
    - `submitting`
    - `continueButton`
  - Ahora respeta correctamente el locale (ES/EN)

#### Página de Producto - Orden Visual
- **Elementos reordenados**
  - Nuevo orden: Delivery Method → Passport → Auto-Buy
  - Mejor flujo de decisión del usuario
  - Jerarquía visual mejorada

#### Navegación
- **Subscriptions removido del menú**
  - Ya no aparece en navbar links
  - Accesible solo desde login o modal de home
  - Menú más limpio y enfocado

#### Auto-Buy vs Subscribe & Save
- **Badge 10% OFF corregido**
  - Removido de Auto-Buy selector (no tiene descuento)
  - Permanece en Subscribe & Save modal (correcto)
  - Confusión eliminada

---

### ✅ Verificación Completa del Backend

#### 21 APIs Funcionando
| Categoría | Endpoints | Estado |
|---|---|---|
| **Auth** | `/api/auth/[...nextauth]`, `/api/auth/register` | ✅ |
| **Productos** | `/api/products`, `/api/products/[slug]` | ✅ |
| **Carrito** | `/api/cart`, `/api/cart/[id]` | ✅ |
| **Checkout** | `/api/checkout/quote`, `/api/checkout/stripe/session`, `/api/checkout/paypal/order`, `/api/checkout/paypal/capture` | ✅ |
| **Órdenes** | `/api/orders`, `/api/orders/[id]` | ✅ |
| **Direcciones** | `/api/addresses`, `/api/addresses/[id]`, `/api/addresses/[id]/default` | ✅ |
| **Passport** | `/api/passport` | ✅ |
| **AutoBuy** | `/api/autobuy`, `/api/autobuy/[id]`, `/api/autobuy/[id]/pause`, `/api/autobuy/[id]/resume` | ✅ |
| **Config** | `/api/config` | ✅ Nuevo |

#### Flujo de Checkout Verificado
1. ✅ Usuario selecciona producto → `/api/products/[slug]`
2. ✅ Agrega al carrito → `/api/cart` (POST)
3. ✅ Va a checkout → `/api/checkout/quote` (calcula con ConfigService)
4. ✅ Confirma pago → `/api/checkout/stripe/session` o `/api/checkout/paypal/order`
5. ✅ Completa pago → Webhook crea orden
6. ✅ Consulta órdenes → `/api/orders`

#### Conexiones Frontend ↔ Backend
| Funcionalidad | Frontend | Backend | Estado |
|---|---|---|---|
| Quote (cotización) | `CheckoutPageExperience` | `/api/checkout/quote` | ✅ |
| Stripe checkout | `CheckoutPageExperience` | `/api/checkout/stripe/session` | ✅ |
| PayPal checkout | `CheckoutPageExperience` | `/api/checkout/paypal/order` | ✅ |
| Delivery method | localStorage + state | Enviado en cada request | ✅ |
| Passport selection | localStorage + state | `hasPassport` en request | ✅ |
| Customer data | form state (sin phone) | `customer` object en request | ✅ |
| Cart items | CartProvider | `items` array en request | ✅ |

---

### 🏗️ Estructura de Archivos

#### Nuevos Archivos
```
/src/services/ConfigService.ts          # Servicio de configuración centralizado
/src/app/api/config/route.ts           # API endpoint para configuraciones
/scripts/init-config.ts                # Script inicialización de config
```

#### Archivos Modificados
```
/prisma/schema.prisma                  # + SiteConfig model
/src/lib/checkout.ts                   # Usa ConfigService
/src/lib/pricing.ts                    # Parámetro freeDeliveryThreshold
/src/components/checkout/CheckoutPageExperience.tsx  # Sin phone field
/src/components/home/BestSellers.tsx   # Grid 8 productos
/src/components/Navbar.tsx             # Icon-only account, sin subscriptions
/src/components/home/SubscriptionsModal.tsx  # i18n completo
/src/components/product/ProductDetailExperience.tsx  # Auto-Buy simple, orden elementos
/src/lib/i18n.ts                       # + 4 nuevas keys
```

---

### 📊 Métricas

- **Build Status**: ✅ Exitoso
- **TypeScript Errors**: 0
- **APIs Verificadas**: 21/21
- **Páginas Generadas**: 59
- **Tiempo de Build**: ~1.5s

---

### 🚀 Próximos Pasos Recomendados

1. **Panel Admin**
   - Crear interfaz para editar configuraciones sin código
   - CRUD completo para `SiteConfig`
   - Vista categorizada (pricing, delivery, tax, features)

2. **Frontend Dynamic Pricing**
   - Actualizar textos en `i18n.ts` que muestran "$19.99" y "$100"
   - Consumir `/api/config` en componentes que muestran precios
   - Sincronizar con valores de BD en tiempo real

3. **Más Configuraciones**
   - Descuentos y promociones configurables
   - Horarios de same-day delivery
   - Límites de productos por orden
   - Mensajes de marketing personalizables

4. **Testing**
   - Tests unitarios para ConfigService
   - Tests de integración para checkout flow
   - Tests E2E con Playwright

---

### 🐛 Bugs Corregidos

1. ✅ Hardcode español en modal de suscripciones cuando el idioma era inglés
2. ✅ Grid de Best Sellers mostraba 6 productos (visualmente desequilibrado)
3. ✅ Badge 10% OFF aparecía incorrectamente en Auto-Buy
4. ✅ Navegación mostraba "Subscriptions" cuando solo debía estar en login/modal
5. ✅ Teléfono se pedía en checkout cuando debería estar en perfil
6. ✅ Precios hardcoded impedían cambios sin redespliegue

---

### 📝 Notas Técnicas

#### Prisma Migration
```bash
npx prisma generate      # Genera cliente con SiteConfig
npx prisma db push       # Aplica cambios a BD
npx tsx scripts/init-config.ts  # Inicializa valores
```

#### ConfigService Cache
- TTL: 5 minutos
- Invalidación manual: `ConfigService.clearCache()`
- Auto-refresh en próxima consulta después de TTL

#### Backward Compatibility
- Campo `phone` en checkout APIs acepta string vacío
- Valores por defecto en ConfigService.getOrDefault()
- Fallback a 100, 4, 7, 10, 0.07 si BD no disponible

---

## Autor
- **Fecha**: 2026-04-08
- **Versión**: 0.1.0
- **Framework**: Next.js 16.2.2
- **Base de Datos**: SQLite (Prisma)
