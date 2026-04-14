
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  emailVerified: 'emailVerified',
  name: 'name',
  image: 'image',
  passwordHash: 'passwordHash',
  phone: 'phone',
  twoFactorEnabled: 'twoFactorEnabled',
  twoFactorPhone: 'twoFactorPhone',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.AddressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  label: 'label',
  firstName: 'firstName',
  lastName: 'lastName',
  street: 'street',
  apartment: 'apartment',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  country: 'country',
  phone: 'phone',
  deliveryInstructions: 'deliveryInstructions',
  isDefault: 'isDefault',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  nameEs: 'nameEs',
  nameEn: 'nameEn',
  descriptionEs: 'descriptionEs',
  descriptionEn: 'descriptionEn',
  longDescriptionEs: 'longDescriptionEs',
  longDescriptionEn: 'longDescriptionEn',
  basePriceCop: 'basePriceCop',
  imagePath: 'imagePath',
  imagePaths: 'imagePaths',
  imageEmoji: 'imageEmoji',
  gradientClass: 'gradientClass',
  bestSeller: 'bestSeller',
  active: 'active',
  categories: 'categories',
  colors: 'colors',
  styles: 'styles',
  tags: 'tags',
  optionGroups: 'optionGroups',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IncludeCategoryScalarFieldEnum = {
  id: 'id',
  key: 'key',
  labelEs: 'labelEs',
  labelEn: 'labelEn',
  descriptionEs: 'descriptionEs',
  descriptionEn: 'descriptionEn',
  productCategories: 'productCategories',
  inputType: 'inputType',
  required: 'required',
  active: 'active',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IncludeItemScalarFieldEnum = {
  id: 'id',
  categoryId: 'categoryId',
  key: 'key',
  nameEs: 'nameEs',
  nameEn: 'nameEn',
  priceDeltaUsd: 'priceDeltaUsd',
  imagePath: 'imagePath',
  active: 'active',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IncludeConfigurationScalarFieldEnum = {
  id: 'id',
  key: 'key',
  labelEs: 'labelEs',
  labelEn: 'labelEn',
  descriptionEs: 'descriptionEs',
  descriptionEn: 'descriptionEn',
  productCategories: 'productCategories',
  active: 'active',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IncludeConfigurationItemScalarFieldEnum = {
  id: 'id',
  configurationId: 'configurationId',
  includeItemId: 'includeItemId'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  userId: 'userId',
  subtotalCop: 'subtotalCop',
  taxCop: 'taxCop',
  deliveryFeeCop: 'deliveryFeeCop',
  discountCop: 'discountCop',
  totalCop: 'totalCop',
  status: 'status',
  customerName: 'customerName',
  customerEmail: 'customerEmail',
  customerPhone: 'customerPhone',
  deliveryMethod: 'deliveryMethod',
  deliveryAddressId: 'deliveryAddressId',
  scheduledDeliveryDate: 'scheduledDeliveryDate',
  actualDeliveryDate: 'actualDeliveryDate',
  paymentMethod: 'paymentMethod',
  paymentStatus: 'paymentStatus',
  stripeSessionId: 'stripeSessionId',
  paypalOrderId: 'paypalOrderId',
  paidAt: 'paidAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  productSlug: 'productSlug',
  productName: 'productName',
  quantity: 'quantity',
  unitPriceCop: 'unitPriceCop',
  lineTotalCop: 'lineTotalCop',
  selections: 'selections',
  note: 'note',
  createdAt: 'createdAt'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  quantity: 'quantity',
  selections: 'selections',
  note: 'note',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SavedCardScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  last4: 'last4',
  brand: 'brand',
  expiryMonth: 'expiryMonth',
  expiryYear: 'expiryYear',
  cardCvc: 'cardCvc',
  nickname: 'nickname',
  isDefault: 'isDefault',
  createdAt: 'createdAt'
};

exports.Prisma.PassportSubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  pricePaidCop: 'pricePaidCop',
  stripeSubscriptionId: 'stripeSubscriptionId',
  paypalSubscriptionId: 'paypalSubscriptionId',
  autoRenew: 'autoRenew',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AutoBuyScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  productId: 'productId',
  quantity: 'quantity',
  selections: 'selections',
  frequency: 'frequency',
  startDate: 'startDate',
  endDate: 'endDate',
  nextScheduledDate: 'nextScheduledDate',
  status: 'status',
  reminderEnabled: 'reminderEnabled',
  reminderDaysBefore: 'reminderDaysBefore',
  deliveryAddressId: 'deliveryAddressId',
  paymentMethod: 'paymentMethod',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AutoBuyExecutionScalarFieldEnum = {
  id: 'id',
  autoBuyId: 'autoBuyId',
  orderId: 'orderId',
  scheduledFor: 'scheduledFor',
  executedAt: 'executedAt',
  status: 'status',
  errorMessage: 'errorMessage'
};

exports.Prisma.SiteConfigScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  valueType: 'valueType',
  description: 'description',
  category: 'category',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GiftCardCatalogScalarFieldEnum = {
  id: 'id',
  key: 'key',
  nameEs: 'nameEs',
  nameEn: 'nameEn',
  descriptionEs: 'descriptionEs',
  descriptionEn: 'descriptionEn',
  active: 'active',
  allowCustom: 'allowCustom',
  presetAmounts: 'presetAmounts',
  minCustomAmount: 'minCustomAmount',
  maxCustomAmount: 'maxCustomAmount',
  imagePath: 'imagePath',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GiftCardScalarFieldEnum = {
  id: 'id',
  catalogId: 'catalogId',
  purchaserUserId: 'purchaserUserId',
  code: 'code',
  initialAmountUsd: 'initialAmountUsd',
  remainingAmountUsd: 'remainingAmountUsd',
  status: 'status',
  recipientName: 'recipientName',
  recipientEmail: 'recipientEmail',
  recipientPhone: 'recipientPhone',
  message: 'message',
  deliveryMethod: 'deliveryMethod',
  deliveryAddress: 'deliveryAddress',
  senderName: 'senderName',
  senderEmail: 'senderEmail',
  senderPhone: 'senderPhone',
  orderNumber: 'orderNumber',
  paymentProvider: 'paymentProvider',
  paymentReference: 'paymentReference',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GiftCardRedemptionScalarFieldEnum = {
  id: 'id',
  giftCardId: 'giftCardId',
  userId: 'userId',
  orderId: 'orderId',
  amountUsd: 'amountUsd',
  createdAt: 'createdAt'
};

exports.Prisma.WishlistScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  isDefault: 'isDefault',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WishlistItemScalarFieldEnum = {
  id: 'id',
  wishlistId: 'wishlistId',
  productId: 'productId',
  productSlug: 'productSlug',
  productName: 'productName',
  addedAt: 'addedAt'
};

exports.Prisma.NewsletterSubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  email: 'email',
  active: 'active',
  source: 'source',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StoreCreditScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  amountUsd: 'amountUsd',
  remainingUsd: 'remainingUsd',
  reason: 'reason',
  note: 'note',
  status: 'status',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OtpCodeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  code: 'code',
  expiresAt: 'expiresAt',
  used: 'used',
  createdAt: 'createdAt'
};

exports.Prisma.SiteContentScalarFieldEnum = {
  id: 'id',
  sectionKey: 'sectionKey',
  locale: 'locale',
  value: 'value',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PromoSectionScalarFieldEnum = {
  id: 'id',
  pageKey: 'pageKey',
  locale: 'locale',
  badge: 'badge',
  title: 'title',
  description: 'description',
  ctaLabel: 'ctaLabel',
  ctaHref: 'ctaHref',
  backgroundClass: 'backgroundClass',
  active: 'active',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Address: 'Address',
  Product: 'Product',
  IncludeCategory: 'IncludeCategory',
  IncludeItem: 'IncludeItem',
  IncludeConfiguration: 'IncludeConfiguration',
  IncludeConfigurationItem: 'IncludeConfigurationItem',
  Order: 'Order',
  OrderItem: 'OrderItem',
  CartItem: 'CartItem',
  SavedCard: 'SavedCard',
  PassportSubscription: 'PassportSubscription',
  AutoBuy: 'AutoBuy',
  AutoBuyExecution: 'AutoBuyExecution',
  SiteConfig: 'SiteConfig',
  GiftCardCatalog: 'GiftCardCatalog',
  GiftCard: 'GiftCard',
  GiftCardRedemption: 'GiftCardRedemption',
  Wishlist: 'Wishlist',
  WishlistItem: 'WishlistItem',
  NewsletterSubscription: 'NewsletterSubscription',
  StoreCredit: 'StoreCredit',
  OtpCode: 'OtpCode',
  SiteContent: 'SiteContent',
  PromoSection: 'PromoSection'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
