/*
  Warnings:

  - Made the column `name` on table `countries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `iso2` on table `countries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency` on table `countries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendor_location` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `default_currency` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `default_currency` on table `vendor_info` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "countries" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "iso2" SET NOT NULL,
ALTER COLUMN "currency" SET NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "on_sale" BOOLEAN,
ADD COLUMN     "sale_price" DECIMAL(6,2),
ADD COLUMN     "type" TEXT,
ALTER COLUMN "vendor_location" SET NOT NULL,
ALTER COLUMN "default_currency" SET NOT NULL;

-- AlterTable
ALTER TABLE "vendor_info" ALTER COLUMN "default_currency" SET NOT NULL;
