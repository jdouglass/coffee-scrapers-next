import EightOunceScraper from '../scrapers/eightOunceScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IConfig } from '../interfaces/config';
import configData from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { ApiService } from '../service/apiService';
import { EightOunceHelper } from '../helper/eightOunceHelper';

export class EightOunceClient {
  private static vendor: string = Vendor.EightOunce;
  private static baseUrl: string = BaseUrl.EightOunce;
  private static products: Array<IProduct> = new Array<IProduct>();
  private static factory: EightOunceScraper = new EightOunceScraper();
  private static config: IConfig = configData;

  public static async run(): Promise<void> {
    const shopifyApi = new ApiService(VendorApiUrl.EightOunce);
    const shopifyProducts = await shopifyApi.fetchShopifyProducts();
    for (const item of shopifyProducts) {
      const productDetails = await EightOunceHelper.getProductInfo(
        this.factory.getProductUrl(item, this.baseUrl)
      );
      const country = this.factory.getCountry(item, productDetails);
      const process = this.factory.getProcess(item, productDetails);
      const product: IProduct = {
        brand: this.factory.getBrand(item),
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
        variety: this.factory.getVariety(item, productDetails),
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
    await EightOunceClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
