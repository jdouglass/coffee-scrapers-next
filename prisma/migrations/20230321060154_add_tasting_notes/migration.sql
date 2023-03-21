/*
  Warnings:

  - A unique constraint covering the columns `[base_url]` on the table `vendor_info` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "tasting_notes" TEXT[];

-- AlterTable
ALTER TABLE "vendor_info" ADD COLUMN     "api_url" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "vendor_info_base_url_key" ON "vendor_info"("base_url");
