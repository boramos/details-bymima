import { prisma } from "@/lib/prisma";

export class OrderService {
  static async createOrder(data: {
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: Array<{
      productId: string;
      productSlug: string;
      productName: string;
      quantity: number;
      unitPriceCop: number;
      selections: any;
      note?: string;
    }>;
    subtotalCop: number;
    taxCop: number;
    deliveryFeeCop: number;
    discountCop?: number;
    totalCop: number;
    deliveryMethod: string;
    deliveryAddressId?: string;
    scheduledDeliveryDate?: Date;
    paymentMethod: string;
    notes?: string;
  }) {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        subtotalCop: data.subtotalCop,
        taxCop: data.taxCop,
        deliveryFeeCop: data.deliveryFeeCop,
        discountCop: data.discountCop || 0,
        totalCop: data.totalCop,
        status: "PENDING",
        deliveryMethod: data.deliveryMethod,
        deliveryAddressId: data.deliveryAddressId,
        scheduledDeliveryDate: data.scheduledDeliveryDate,
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            productSlug: item.productSlug,
            productName: item.productName,
            quantity: item.quantity,
            unitPriceCop: item.unitPriceCop,
            lineTotalCop: item.quantity * item.unitPriceCop,
            selections: JSON.stringify(item.selections),
            note: item.note,
          })),
        },
      },
      include: {
        items: true,
        deliveryAddress: true,
      },
    });
  }

  static async getOrdersByUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        deliveryAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getOrderById(id: string, userId: string) {
    return prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        deliveryAddress: true,
      },
    });
  }

  static async getOrderByNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        deliveryAddress: true,
      },
    });
  }

  static async updateOrderStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  static async updatePaymentStatus(id: string, paymentStatus: string, paidAt?: Date) {
    return prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        paidAt: paidAt || new Date(),
      },
    });
  }
}
