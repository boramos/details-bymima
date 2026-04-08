import { prisma } from "@/lib/prisma";

export class PassportService {
  static async getPassportByUser(userId: string) {
    return prisma.passportSubscription.findUnique({
      where: { userId },
    });
  }

  static async createPassport(userId: string, pricePaidCop: number, durationMonths: number = 12) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const existing = await prisma.passportSubscription.findUnique({
      where: { userId },
    });

    if (existing) {
      return prisma.passportSubscription.update({
        where: { userId },
        data: {
          status: "ACTIVE",
          startDate,
          endDate,
          pricePaidCop,
          autoRenew: true,
        },
      });
    }

    return prisma.passportSubscription.create({
      data: {
        userId,
        status: "ACTIVE",
        startDate,
        endDate,
        pricePaidCop,
        autoRenew: true,
      },
    });
  }

  static async cancelPassport(userId: string) {
    return prisma.passportSubscription.update({
      where: { userId },
      data: {
        status: "CANCELLED",
        autoRenew: false,
      },
    });
  }

  static async pausePassport(userId: string) {
    return prisma.passportSubscription.update({
      where: { userId },
      data: {
        status: "PAUSED",
      },
    });
  }

  static async resumePassport(userId: string) {
    return prisma.passportSubscription.update({
      where: { userId },
      data: {
        status: "ACTIVE",
      },
    });
  }

  static async isPassportActive(userId: string): Promise<boolean> {
    const passport = await this.getPassportByUser(userId);
    
    if (!passport) return false;
    if (passport.status !== "ACTIVE") return false;
    if (new Date(passport.endDate) < new Date()) {
      await prisma.passportSubscription.update({
        where: { userId },
        data: { status: "EXPIRED" },
      });
      return false;
    }

    return true;
  }

  static async renewPassport(userId: string, pricePaidCop: number) {
    const passport = await this.getPassportByUser(userId);
    
    if (!passport) {
      return this.createPassport(userId, pricePaidCop);
    }

    const newEndDate = new Date(passport.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + 12);

    return prisma.passportSubscription.update({
      where: { userId },
      data: {
        status: "ACTIVE",
        endDate: newEndDate,
        pricePaidCop,
      },
    });
  }
}
