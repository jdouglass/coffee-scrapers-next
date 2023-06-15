import { PrismaClient } from '@prisma/client';
import Helper from './helper/helper';
import { IProduct } from './interfaces/product';
import config from './config.json';
import { Vendor } from './enums/vendors';

export class ProductsDatabase {
  private static prisma: PrismaClient = new PrismaClient();

  public static async getCountryCurrency(country: string): Promise<string> {
    const currency = await this.prisma.countries.findFirst({
      where: {
        name: country,
      },
      select: {
        currency: true,
      },
    });
    return currency?.currency ? currency?.currency : 'Unknown';
  }

  public static async getVendorCountryLocation(
    vendor: string
  ): Promise<string> {
    const location = await this.prisma.vendor_info.findFirst({
      where: {
        name: vendor,
      },
      select: {
        country_location: true,
      },
    });
    return location?.country_location ? location?.country_location : 'Unknown';
  }

  private static async getProductUrlsByVendor(
    vendor: string
  ): Promise<{ product_url: string }[]> {
    return await this.prisma.products.findMany({
      where: {
        vendor: vendor,
      },
      select: {
        product_url: true,
      },
    });
  }

  private static async deleteProductByUrl(productUrl: string): Promise<void> {
    await this.prisma.products.delete({
      where: {
        product_url: productUrl,
      },
    });
  }

  private static async addOrUpdateProduct(
    product: IProduct,
    vendor: string
  ): Promise<void> {
    // Don't update the date_added if the vendor is Hatch Coffee
    // because Hatch doesn't have their timestamps in the Crate Joy API
    // so the date would always get updated whenever the scraper is run for Hatch
    if (
      vendor !== Vendor.Hatch &&
      vendor !== Vendor.Luna &&
      vendor !== Vendor.DeMello &&
      vendor !== Vendor.Timbertrain
    ) {
      try {
        await this.prisma.products.upsert({
          where: {
            product_url: product.productUrl,
          },
          create: {
            brand: product.brand,
            continent: product.continent,
            country: product.country,
            date_added: product.dateAdded,
            handle: product.handle,
            image_url: product.imageUrl,
            sold_out: product.isSoldOut,
            price: product.price,
            process: product.process,
            process_category: product.processCategory,
            product_url: product.productUrl,
            tasting_notes: product.tastingNotes,
            tasting_notes_string: product.tastingNotesString,
            title: product.title,
            variety_string: product.varietyString,
            vendor: product.vendor,
            vendor_location: product.vendorLocation,
            weight: product.weight,
            default_currency: product.currency,
            type: product.type,
          },
          update: {
            brand: product.brand,
            continent: product.continent,
            country: product.country,
            date_added: product.dateAdded,
            handle: product.handle,
            sold_out: product.isSoldOut,
            price: product.price,
            process: product.process,
            process_category: product.processCategory,
            tasting_notes: product.tastingNotes,
            tasting_notes_string: product.tastingNotesString,
            title: product.title,
            variety: product.variety,
            variety_string: product.varietyString,
            vendor: product.vendor,
            vendor_location: product.vendorLocation,
            weight: product.weight,
            default_currency: product.currency,
            type: product.type,
          },
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await this.prisma.products.upsert({
          where: {
            product_url: product.productUrl,
          },
          create: {
            brand: product.brand,
            continent: product.continent,
            country: product.country,
            date_added: product.dateAdded,
            handle: product.handle,
            image_url: product.imageUrl,
            sold_out: product.isSoldOut,
            price: product.price,
            process: product.process,
            process_category: product.processCategory,
            product_url: product.productUrl,
            tasting_notes: product.tastingNotes,
            tasting_notes_string: product.tastingNotesString,
            title: product.title,
            variety: product.variety,
            variety_string: product.varietyString,
            vendor: product.vendor,
            vendor_location: product.vendorLocation,
            weight: product.weight,
            default_currency: product.currency,
            type: product.type,
          },
          update: {
            brand: product.brand,
            continent: product.continent,
            country: product.country,
            handle: product.handle,
            sold_out: product.isSoldOut,
            price: product.price,
            process: product.process,
            process_category: product.processCategory,
            tasting_notes: product.tastingNotes,
            tasting_notes_string: product.tastingNotesString,
            title: product.title,
            variety: product.variety,
            variety_string: product.varietyString,
            vendor: product.vendor,
            vendor_location: product.vendorLocation,
            weight: product.weight,
            default_currency: product.currency,
            type: product.type,
          },
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async updateDb(
    scrapedProducts: IProduct[],
    vendor: string
  ): Promise<void> {
    if (!config.useDatabase) {
      return;
    }
    const dbProducts: { product_url: string }[] =
      await this.getProductUrlsByVendor(vendor);

    for (const dbProduct of dbProducts) {
      if (
        !scrapedProducts.some(
          (item: IProduct) => item.productUrl === dbProduct.product_url
        )
      ) {
        await this.deleteProductByUrl(dbProduct.product_url);
        await Helper.deleteFromBucket(dbProduct.product_url);
      }
    }

    for (const scrapedProduct of scrapedProducts) {
      let foundInDb = false;
      for (const dbProduct of dbProducts) {
        if (scrapedProduct.productUrl === dbProduct.product_url) {
          foundInDb = true;
        }
      }
      if (!foundInDb) {
        const newImageUrl = await Helper.uploadToBucket(scrapedProduct);
        scrapedProduct.imageUrl = newImageUrl;
      }
      foundInDb = false;
    }

    for (const product of scrapedProducts) {
      await this.addOrUpdateProduct(product, vendor);
    }
  }
}
