CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionKey" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "PromoSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageKey" TEXT NOT NULL DEFAULT 'home',
    "locale" TEXT NOT NULL,
    "badge" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "backgroundClass" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "SiteContent_sectionKey_locale_key" ON "SiteContent"("sectionKey", "locale");

CREATE INDEX "SiteContent_sectionKey_idx" ON "SiteContent"("sectionKey");

CREATE INDEX "SiteContent_locale_idx" ON "SiteContent"("locale");

CREATE INDEX "PromoSection_pageKey_locale_active_sortOrder_idx" ON "PromoSection"("pageKey", "locale", "active", "sortOrder");

ALTER TABLE "Product" ADD COLUMN "imagePath" TEXT;
ALTER TABLE "Product" ADD COLUMN "imagePaths" TEXT NOT NULL DEFAULT '[]';
