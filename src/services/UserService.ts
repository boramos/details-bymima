import { prisma } from "@/lib/prisma";

export class UserService {
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        passport: true,
      },
    });
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        addresses: true,
        passport: true,
      },
    });
  }

  static async createUser(data: {
    email: string;
    name?: string;
    passwordHash?: string;
    phone?: string;
  }) {
    return prisma.user.create({
      data: {
        ...data,
        role: "CUSTOMER",
      },
    });
  }

  static async updateUser(id: string, data: {
    name?: string;
    phone?: string;
    image?: string;
  }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async hasActivePassport(userId: string): Promise<boolean> {
    const passport = await prisma.passportSubscription.findUnique({
      where: { userId },
    });

    if (!passport) return false;

    return passport.status === "ACTIVE" && new Date(passport.endDate) > new Date();
  }
}
