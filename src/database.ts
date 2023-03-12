import { PrismaClient } from '@prisma/client';
import Helper from './helper/helper';
import { IProduct } from './interfaces/product';
import config from './config.json';

export class ProductsDatabase {
  private static prisma: PrismaClient = new PrismaClient();

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

  private static async addOrUpdateProduct(product: IProduct): Promise<void> {
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
  }

  public static async updateDb(scrapedProducts: IProduct[]): Promise<void> {
    if (!config.useDatabase) {
      return;
    }
    const dbProducts: { product_url: string }[] =
      await this.getProductUrlsByVendor(scrapedProducts[0].vendor);

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
      await this.addOrUpdateProduct(product);
    }
  }
}
