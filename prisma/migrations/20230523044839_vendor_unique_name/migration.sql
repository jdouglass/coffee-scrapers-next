/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `vendor_info` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vendor_info_name_key" ON "vendor_info"("name");
