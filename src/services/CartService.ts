import { prisma } from "@/lib/prisma";

export class CartService {
  static async getCartItems(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async addToCart(userId: string, productId: string, quantity: number, selections: any, note?: string) {
    const selectionsString = JSON.stringify(selections);
    
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        note: note || null,
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          selections: selectionsString,
        },
        include: {
          product: true,
        },
      });
    }

    return prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
        selections: selectionsString,
        note,
      },
      include: {
        product: true,
      },
    });
  }

  static async updateCartItem(id: string, userId: string, quantity: number) {
    return prisma.cartItem.updateMany({
      where: {
        id,
        userId,
      },
      data: { quantity },
    });
  }

  static async removeFromCart(id: string, userId: string) {
    return prisma.cartItem.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }

  static async clearCart(userId: string) {
    return prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  static async getCartCount(userId: string): Promise<number> {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      select: { quantity: true },
    });

    return items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
  }
}
