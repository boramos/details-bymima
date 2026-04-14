export type OrderReceiptItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedLabels: string[];
};

export type OrderReceiptSnapshot = {
  orderId: string;
  customerEmail: string;
  customerName: string;
  date: string;
  items: OrderReceiptItem[];
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  passportPrice: number;
  passportApplied: boolean;
  total: number;
  deliveryMethod: string;
  locale: string;
};

export type GiftCardReceiptCard = {
  code: string;
  amount: number;
  recipientName: string | null;
  recipientEmail: string | null;
  deliveryMethod: string;
};

export type GiftCardReceiptData = {
  senderName: string;
  senderEmail: string;
  date: string;
  cards: GiftCardReceiptCard[];
  totalAmountUsd: number;
};
