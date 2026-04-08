import { prisma } from "@/lib/prisma";

export class AutoBuyService {
  static async getAutoBuysByUser(userId: string) {
    return prisma.autoBuy.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getAutoBuyById(id: string, userId: string) {
    return prisma.autoBuy.findFirst({
      where: { id, userId },
      include: {
        product: true,
        executionLog: {
          orderBy: {
            executedAt: 'desc',
          },
        },
      },
    });
  }

  static async createAutoBuy(data: {
    userId: string;
    productId: string;
    quantity: number;
    selections: any;
    frequency: string;
    startDate: Date;
    endDate?: Date;
    deliveryAddressId?: string;
    paymentMethod: string;
    reminderEnabled?: boolean;
    reminderDaysBefore?: number;
  }) {
    const nextScheduledDate = this.calculateNextDate(data.startDate, data.frequency);

    return prisma.autoBuy.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        quantity: data.quantity,
        selections: JSON.stringify(data.selections),
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate,
        nextScheduledDate,
        status: "ACTIVE",
        deliveryAddressId: data.deliveryAddressId,
        paymentMethod: data.paymentMethod,
        reminderEnabled: data.reminderEnabled ?? true,
        reminderDaysBefore: data.reminderDaysBefore ?? 3,
      },
      include: {
        product: true,
      },
    });
  }

  static async updateAutoBuy(id: string, userId: string, data: {
    quantity?: number;
    frequency?: string;
    endDate?: Date;
    deliveryAddressId?: string;
    paymentMethod?: string;
    reminderEnabled?: boolean;
    reminderDaysBefore?: number;
  }) {
    return prisma.autoBuy.updateMany({
      where: { id, userId },
      data,
    });
  }

  static async pauseAutoBuy(id: string, userId: string) {
    return prisma.autoBuy.updateMany({
      where: { id, userId },
      data: { status: "PAUSED" },
    });
  }

  static async resumeAutoBuy(id: string, userId: string) {
    return prisma.autoBuy.updateMany({
      where: { id, userId },
      data: { status: "ACTIVE" },
    });
  }

  static async cancelAutoBuy(id: string, userId: string) {
    return prisma.autoBuy.updateMany({
      where: { id, userId },
      data: { status: "CANCELLED" },
    });
  }

  static async deleteAutoBuy(id: string, userId: string) {
    return prisma.autoBuy.deleteMany({
      where: { id, userId },
    });
  }

  static calculateNextDate(fromDate: Date, frequency: string): Date {
    const next = new Date(fromDate);
    
    switch (frequency) {
      case "WEEKLY":
        next.setDate(next.getDate() + 7);
        break;
      case "BIWEEKLY":
        next.setDate(next.getDate() + 14);
        break;
      case "MONTHLY":
        next.setMonth(next.getMonth() + 1);
        break;
    }

    return next;
  }

  static async recordExecution(autoBuyId: string, orderId: string | null, success: boolean, errorMessage?: string) {
    const autoBuy = await prisma.autoBuy.findUnique({
      where: { id: autoBuyId },
    });

    if (!autoBuy) return null;

    const nextScheduledDate = this.calculateNextDate(autoBuy.nextScheduledDate, autoBuy.frequency);

    await prisma.autoBuy.update({
      where: { id: autoBuyId },
      data: { nextScheduledDate },
    });

    return prisma.autoBuyExecution.create({
      data: {
        autoBuyId,
        orderId,
        scheduledFor: autoBuy.nextScheduledDate,
        status: success ? "SUCCESS" : "FAILED",
        errorMessage,
      },
    });
  }
}
