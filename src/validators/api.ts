import { z } from "zod";

export const CartItemCreateSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  selections: z.any(),
  note: z.string().optional(),
});

export const CartItemUpdateSchema = z.object({
  quantity: z.number().int().min(1),
});

export const AddressCreateSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const AddressUpdateSchema = z.object({
  street: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

export const OrderCreateSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  items: z.array(z.object({
    productId: z.string(),
    productSlug: z.string(),
    productName: z.string(),
    quantity: z.number().int().min(1),
    unitPriceCop: z.number().int().min(0),
    selections: z.any(),
    note: z.string().optional(),
  })),
  subtotalCop: z.number().int().min(0),
  taxCop: z.number().int().min(0),
  deliveryFeeCop: z.number().int().min(0),
  discountCop: z.number().int().min(0).optional(),
  totalCop: z.number().int().min(0),
  deliveryMethod: z.enum(["PICKUP", "STANDARD", "TOMORROW", "TODAY"]),
  deliveryAddressId: z.string().optional(),
  scheduledDeliveryDate: z.string().datetime().optional(),
  paymentMethod: z.enum(["CARD", "PAYPAL"]),
  notes: z.string().optional(),
});

export const PassportCreateSchema = z.object({
  pricePaidCop: z.number().int().min(0),
  durationMonths: z.number().int().min(1).optional(),
});

export const AutoBuyCreateSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  selections: z.any(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  deliveryAddressId: z.string().optional(),
  paymentMethod: z.enum(["CARD", "PAYPAL"]),
  reminderEnabled: z.boolean().optional(),
  reminderDaysBefore: z.number().int().min(0).max(30).optional(),
});

export const AutoBuyUpdateSchema = z.object({
  quantity: z.number().int().min(1).optional(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
  endDate: z.string().datetime().optional(),
  deliveryAddressId: z.string().optional(),
  paymentMethod: z.enum(["CARD", "PAYPAL"]).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderDaysBefore: z.number().int().min(0).max(30).optional(),
});

export type CartItemCreateInput = z.infer<typeof CartItemCreateSchema>;
export type CartItemUpdateInput = z.infer<typeof CartItemUpdateSchema>;
export type AddressCreateInput = z.infer<typeof AddressCreateSchema>;
export type AddressUpdateInput = z.infer<typeof AddressUpdateSchema>;
export type OrderCreateInput = z.infer<typeof OrderCreateSchema>;
export type PassportCreateInput = z.infer<typeof PassportCreateSchema>;
export type AutoBuyCreateInput = z.infer<typeof AutoBuyCreateSchema>;
export type AutoBuyUpdateInput = z.infer<typeof AutoBuyUpdateSchema>;
