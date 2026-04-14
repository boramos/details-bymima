import { prisma } from "@/lib/prisma";

type PrismaGiftCardCatalogRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.giftCardCatalog.findUnique>>
>;

type PrismaGiftCardRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.giftCard.findUnique>>
>;

export interface GiftCardCatalogWithParsedFields
  extends Omit<PrismaGiftCardCatalogRecord, "presetAmounts"> {
  presetAmounts: number[];
}

export interface GiftCardWithRedemptions extends PrismaGiftCardRecord {
  redemptions: {
    id: string;
    amountUsd: number;
    createdAt: Date;
    orderId: string | null;
  }[];
  catalog: GiftCardCatalogWithParsedFields | null;
}

export interface GiftCardCatalogUpsertInput {
  key: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  active?: boolean;
  allowCustom?: boolean;
  presetAmounts?: number[];
  minCustomAmount?: number;
  maxCustomAmount?: number;
  imagePath?: string | null;
}

export interface GiftCardCreateInput {
  catalogId?: string | null;
  purchaserUserId?: string | null;
  initialAmountUsd: number;
  status?: string;
  recipientName?: string | null;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  message?: string | null;
  deliveryMethod?: string;
  deliveryAddress?: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
  senderPhone?: string | null;
  orderNumber?: string | null;
  paymentProvider?: string | null;
  paymentReference?: string | null;
  expiresAt?: Date | null;
}

/**
 * GiftCardService - Handles all gift card business logic
 */
export class GiftCardService {
  // ─── Code Generation ────────────────────────────────────────────────────────

  /**
   * Generate a unique gift card code in format MIMA-XXXX-XXXX
   */
  static generateCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = () =>
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `MIMA-${segment()}-${segment()}`;
  }

  private static async generateUniqueCode(): Promise<string> {
    let code: string;
    let attempts = 0;

    do {
      code = GiftCardService.generateCode();
      const existing = await prisma.giftCard.findUnique({ where: { code } });
      if (!existing) return code;
      attempts++;
    } while (attempts < 20);

    throw new Error("Failed to generate unique gift card code after 20 attempts");
  }

  // ─── Catalog Methods ─────────────────────────────────────────────────────────

  private static parseCatalog(
    catalog: PrismaGiftCardCatalogRecord,
  ): GiftCardCatalogWithParsedFields {
    return {
      ...catalog,
      presetAmounts: JSON.parse(catalog.presetAmounts) as number[],
    };
  }

  /**
   * List all catalogs (optionally filter by active)
   */
  static async listCatalogs(activeOnly = false): Promise<GiftCardCatalogWithParsedFields[]> {
    const catalogs = await prisma.giftCardCatalog.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { createdAt: "asc" },
    });
    return catalogs.map(GiftCardService.parseCatalog);
  }

  /**
   * Get a single catalog by ID
   */
  static async getCatalogById(id: string): Promise<GiftCardCatalogWithParsedFields | null> {
    const catalog = await prisma.giftCardCatalog.findUnique({ where: { id } });
    return catalog ? GiftCardService.parseCatalog(catalog) : null;
  }

  /**
   * Create a new gift card catalog
   */
  static async createCatalog(
    input: GiftCardCatalogUpsertInput,
  ): Promise<GiftCardCatalogWithParsedFields> {
    const catalog = await prisma.giftCardCatalog.create({
      data: {
        key: input.key,
        nameEs: input.nameEs,
        nameEn: input.nameEn,
        descriptionEs: input.descriptionEs,
        descriptionEn: input.descriptionEn,
        active: input.active ?? true,
        allowCustom: input.allowCustom ?? true,
        presetAmounts: JSON.stringify(input.presetAmounts ?? [10, 20, 50, 100]),
        minCustomAmount: input.minCustomAmount ?? 10,
        maxCustomAmount: input.maxCustomAmount ?? 500,
        imagePath: input.imagePath ?? null,
      },
    });
    return GiftCardService.parseCatalog(catalog);
  }

  /**
   * Update an existing catalog
   */
  static async updateCatalog(
    id: string,
    input: Partial<GiftCardCatalogUpsertInput>,
  ): Promise<GiftCardCatalogWithParsedFields> {
    const data: Record<string, unknown> = { ...input };

    if (input.presetAmounts !== undefined) {
      data.presetAmounts = JSON.stringify(input.presetAmounts);
    }

    const catalog = await prisma.giftCardCatalog.update({
      where: { id },
      data,
    });
    return GiftCardService.parseCatalog(catalog);
  }

  /**
   * Delete a catalog (hard delete — only allowed when no gift cards reference it)
   */
  static async deleteCatalog(id: string): Promise<void> {
    const usedBy = await prisma.giftCard.count({ where: { catalogId: id } });
    if (usedBy > 0) {
      // Soft-disable instead of hard delete
      await prisma.giftCardCatalog.update({ where: { id }, data: { active: false } });
    } else {
      await prisma.giftCardCatalog.delete({ where: { id } });
    }
  }

  // ─── Gift Card Methods ────────────────────────────────────────────────────────

  /**
   * List all gift cards with optional status filter and pagination
   */
  static async listGiftCards(opts?: {
    status?: string;
    take?: number;
    skip?: number;
  }): Promise<GiftCardWithRedemptions[]> {
    const cards = await prisma.giftCard.findMany({
      where: opts?.status ? { status: opts.status } : undefined,
      include: {
        redemptions: {
          select: { id: true, amountUsd: true, createdAt: true, orderId: true },
          orderBy: { createdAt: "desc" },
        },
        catalog: true,
      },
      orderBy: { createdAt: "desc" },
      take: opts?.take,
      skip: opts?.skip,
    });

    return cards.map((card) => ({
      ...card,
      catalog: card.catalog ? GiftCardService.parseCatalog(card.catalog) : null,
    }));
  }

  /**
   * Get a single gift card by its code (public — for balance check)
   */
  static async getGiftCardByCode(code: string): Promise<GiftCardWithRedemptions | null> {
    const card = await prisma.giftCard.findUnique({
      where: { code },
      include: {
        redemptions: {
          select: { id: true, amountUsd: true, createdAt: true, orderId: true },
          orderBy: { createdAt: "desc" },
        },
        catalog: true,
      },
    });

    if (!card) return null;

    return {
      ...card,
      catalog: card.catalog ? GiftCardService.parseCatalog(card.catalog) : null,
    };
  }

  /**
   * Get a single gift card by ID
   */
  static async getGiftCardById(id: string): Promise<GiftCardWithRedemptions | null> {
    const card = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        redemptions: {
          select: { id: true, amountUsd: true, createdAt: true, orderId: true },
          orderBy: { createdAt: "desc" },
        },
        catalog: true,
      },
    });

    if (!card) return null;

    return {
      ...card,
      catalog: card.catalog ? GiftCardService.parseCatalog(card.catalog) : null,
    };
  }

  /**
   * Create a new gift card (generates unique code automatically)
   */
  static async createGiftCard(input: GiftCardCreateInput): Promise<GiftCardWithRedemptions> {
    const code = await GiftCardService.generateUniqueCode();

    const card = await prisma.giftCard.create({
      data: {
        code,
        catalogId: input.catalogId ?? null,
        purchaserUserId: input.purchaserUserId ?? null,
        initialAmountUsd: input.initialAmountUsd,
        remainingAmountUsd: input.initialAmountUsd,
        status: input.status ?? "ACTIVE",
        recipientName: input.recipientName ?? null,
        recipientEmail: input.recipientEmail ?? null,
        recipientPhone: input.recipientPhone ?? null,
        message: input.message ?? null,
        deliveryMethod: input.deliveryMethod ?? "EMAIL",
        deliveryAddress: input.deliveryAddress ?? null,
        senderName: input.senderName ?? null,
        senderEmail: input.senderEmail ?? null,
        senderPhone: input.senderPhone ?? null,
        orderNumber: input.orderNumber ?? null,
        paymentProvider: input.paymentProvider ?? null,
        paymentReference: input.paymentReference ?? null,
        expiresAt: input.expiresAt ?? null,
      },
      include: {
        redemptions: {
          select: { id: true, amountUsd: true, createdAt: true, orderId: true },
        },
        catalog: true,
      },
    });

    return {
      ...card,
      catalog: card.catalog ? GiftCardService.parseCatalog(card.catalog) : null,
    };
  }

  /**
   * Redeem (use) a gift card for a given amount
   * Returns updated gift card, or throws if not eligible
   */
  static async redeemGiftCard(opts: {
    code: string;
    amountUsd: number;
    userId?: string | null;
    orderId?: string | null;
  }): Promise<GiftCardWithRedemptions> {
    const card = await prisma.giftCard.findUnique({ where: { code: opts.code } });

    if (!card) throw new Error("Gift card not found");
    if (card.status !== "ACTIVE") throw new Error("Gift card is not active");
    if (card.expiresAt && card.expiresAt < new Date()) throw new Error("Gift card has expired");
    if (card.remainingAmountUsd < opts.amountUsd) {
      throw new Error(
        `Insufficient balance. Remaining: $${card.remainingAmountUsd}, requested: $${opts.amountUsd}`,
      );
    }

    const newRemaining = card.remainingAmountUsd - opts.amountUsd;

    const [, updated] = await prisma.$transaction([
      prisma.giftCardRedemption.create({
        data: {
          giftCardId: card.id,
          userId: opts.userId ?? null,
          orderId: opts.orderId ?? null,
          amountUsd: opts.amountUsd,
        },
      }),
      prisma.giftCard.update({
        where: { id: card.id },
        data: {
          remainingAmountUsd: newRemaining,
          status: newRemaining === 0 ? "REDEEMED" : "ACTIVE",
        },
        include: {
          redemptions: {
            select: { id: true, amountUsd: true, createdAt: true, orderId: true },
            orderBy: { createdAt: "desc" },
          },
          catalog: true,
        },
      }),
    ]);

    return {
      ...updated,
      catalog: updated.catalog ? GiftCardService.parseCatalog(updated.catalog) : null,
    };
  }

  static async activatePendingCards(
    cardIds: string[],
    paymentReference: string,
  ): Promise<GiftCardWithRedemptions[]> {
    await prisma.giftCard.updateMany({
      where: { id: { in: cardIds }, status: "PENDING_PAYMENT" },
      data: { status: "ACTIVE", paymentReference },
    });

    const cards = await prisma.giftCard.findMany({
      where: { id: { in: cardIds } },
      include: {
        redemptions: {
          select: { id: true, amountUsd: true, createdAt: true, orderId: true },
          orderBy: { createdAt: "desc" },
        },
        catalog: true,
      },
    });

    return cards.map((card) => ({
      ...card,
      catalog: card.catalog ? GiftCardService.parseCatalog(card.catalog) : null,
    }));
  }

  static async deactivateGiftCard(id: string): Promise<GiftCardWithRedemptions> {
    const card = await prisma.giftCard.update({
      where: { id },
      data: { status: "INACTIVE" },
      include: {
        redemptions: {
          select: { id: true, amountUsd: true, createdAt: true, orderId: true },
          orderBy: { createdAt: "desc" },
        },
        catalog: true,
      },
    });

    return {
      ...card,
      catalog: card.catalog ? GiftCardService.parseCatalog(card.catalog) : null,
    };
  }
}
