import RevolverScraper from '../scrapers/revolverScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { ApiService } from '../service/apiService';

export class RevolverClient {
  private static vendor: string = Vendor.Revolver;
  private static baseUrl: string = BaseUrl.Revolver;
  private static products: Array<IProduct> = new Array<IProduct>();
  private static factory: RevolverScraper = new RevolverScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const shopifyApi = new ApiService(VendorApiUrl.Revolver);
    const shopifyProducts = await shopifyApi.fetchShopifyProducts();
    for (const item of shopifyProducts) {
      const brand = this.factory.getBrand(item);
      const country = this.factory.getCountry(item);
      const process = this.factory.getProcess(item);
      const product: IProduct = {
        brand,
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
        title: this.factory.getTitle(item, brand, country),
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
    await RevolverClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
