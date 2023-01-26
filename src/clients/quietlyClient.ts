import QuietlyScraper from '../scrapers/quietlyScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IConfig } from '../interfaces/config';
import configData from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { ApiService } from '../service/apiService';

export class QuietlyClient {
  private static vendor: string = Vendor.Quietly;
  private static baseUrl: string = BaseUrl.Quietly;
  private static products: Array<IProduct> = new Array<IProduct>();
  private static factory: QuietlyScraper = new QuietlyScraper();
  private static config: IConfig = configData;

  public static async run(): Promise<void> {
    const shopifyApi = new ApiService(VendorApiUrl.Quietly);
    const shopifyProducts = await shopifyApi.fetchShopifyProducts();
    for (const item of shopifyProducts) {
      const country = this.factory.getCountry(item);
      const process = this.factory.getProcess(item);
      const product: IProduct = {
        brand: this.vendor,
        country,
        continent: this.factory.getContinent(country),
        dateAdded: this.factory.getDateAdded(item.published_at),
        handle: this.factory.getHandle(item.handle),
        imageUrl: this.factory.getImageUrl(item.images),
        price: this.factory.getPrice(item.variants),
        process,
        processCategory: this.factory.getProcessCategory(process),
        productUrl: this.factory.getProductUrl(item, this.baseUrl),
        isSoldOut: this.factory.getSoldOut(item.variants),
        title: this.factory.getTitle(item),
        variety: this.factory.getVariety(item),
        weight: this.factory.getWeight(item),
        vendor: this.vendor,
      };
      if (this.config.logProducts) {
        console.log(product);
      }
      this.products.push(product);
    }
    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.products);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await QuietlyClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
