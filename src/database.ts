import { PrismaClient, products } from '@prisma/client';
import { Vendor } from './enums/vendors';
import Helper from './helper/helper';
import { IProduct } from './interfaces/product';
import config from './config.json';

export class ProductsDatabase {
  private static prisma: PrismaClient = new PrismaClient();

  private static async getProductsByVendor(
    vendor: string
  ): Promise<products[]> {
    return await this.prisma.products.findMany({
      where: {
        vendor: vendor,
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

  private static async addOrUpdateProduct(product: IProduct): Promise<void> {
    if (product.vendor !== Vendor.Hatch && product.vendor !== Vendor.Luna) {
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
            image_url: await Helper.uploadToBucket(product),
            sold_out: product.isSoldOut,
            price: product.price,
            process: product.process,
            process_category: product.processCategory,
            product_url: product.productUrl,
            title: product.title,
            variety: product.variety,
            vendor: product.vendor,
            weight: product.weight,
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
            title: product.title,
            variety: product.variety,
            vendor: product.vendor,
            weight: product.weight,
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
            image_url: await Helper.uploadToBucket(product),
            sold_out: product.isSoldOut,
            price: product.price,
            process: product.process,
            process_category: product.processCategory,
            product_url: product.productUrl,
            title: product.title,
            variety: product.variety,
            vendor: product.vendor,
            weight: product.weight,
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
            title: product.title,
            variety: product.variety,
            vendor: product.vendor,
            weight: product.weight,
          },
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async updateDb(scrapedProducts: IProduct[]): Promise<void> {
    if (!config.useDatabase) {
      return;
    }
    const dbProducts: products[] = await this.getProductsByVendor(
      scrapedProducts[0].vendor
    );

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

    for (const product of scrapedProducts) {
      await this.addOrUpdateProduct(product);
    }
  }
}
