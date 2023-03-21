-- CreateTable
CREATE TABLE "vendor_info" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "base_url" TEXT NOT NULL,
    "country_location" TEXT NOT NULL,

    CONSTRAINT "vendor_info_pkey" PRIMARY KEY ("id")
);
