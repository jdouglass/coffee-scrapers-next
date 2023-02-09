import MatchstickScraper from '../scrapers/matchstickScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { ApiService } from '../service/apiService';

export class MatchstickClient {
  private static vendor: string = Vendor.Matchstick;
  private static baseUrl: string = BaseUrl.Matchstick;
  private static products: Array<IProduct> = new Array<IProduct>();
  private static factory: MatchstickScraper = new MatchstickScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const shopifyApi = new ApiService(VendorApiUrl.Matchstick);
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
    await MatchstickClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
