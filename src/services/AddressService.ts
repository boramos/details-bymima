import { prisma } from "@/lib/prisma";

export class AddressService {
  static async getAddressesByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  static async getAddressById(id: string, userId: string) {
    return prisma.address.findFirst({
      where: { id, userId },
    });
  }

  static async createAddress(userId: string, data: {
    street: string;
    city: string;
    postalCode: string;
    country?: string;
    deliveryInstructions?: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        ...data,
        userId,
        country: data.country || "United States",
      },
    });
  }

  static async updateAddress(id: string, userId: string, data: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    deliveryInstructions?: string;
  }) {
    return prisma.address.updateMany({
      where: { id, userId },
      data,
    });
  }

  static async setDefaultAddress(id: string, userId: string) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return prisma.address.updateMany({
      where: { id, userId },
      data: { isDefault: true },
    });
  }

  static async deleteAddress(id: string, userId: string) {
    return prisma.address.deleteMany({
      where: { id, userId },
    });
  }

  static async getDefaultAddress(userId: string) {
    return prisma.address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }
}
