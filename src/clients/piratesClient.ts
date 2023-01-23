import axios, { AxiosResponse } from 'axios';
import PiratesScraper from '../scraperFactory/piratesScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IShopifyProductResponse } from '../interfaces/shopify/shopifyProductResponse.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export class PiratesClient {
  private static vendor: string = Vendor.Pirates;
  private static baseUrl: string = BaseUrl.PiratesOfCoffee;
  private static piratesProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: PiratesScraper = new PiratesScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const piratesResponse: AxiosResponse<IShopifyProductResponse> =
      await axios.get(VendorApiUrl.Pirates);
    const piratesData: IShopifyProductResponseData[] =
      piratesResponse.data.products;
    for (const item of piratesData) {
      if (
        !unwantedTitles.some((unwantedString) =>
          item.title.toLowerCase().includes(unwantedString.toLowerCase())
        )
      ) {
        const country = this.factory.getCountry(item);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded(item.published_at);
        const handle = this.factory.getHandle(item.handle);
        const imageUrl = this.factory.getImageUrl(item.images);
        const price = this.factory.getPrice(item.variants);
        const process = this.factory.getProcess(item);
        const processCategory = this.factory.getProcessCategory(process);
        const productUrl = this.factory.getProductUrl(item, this.baseUrl);
        const isSoldOut = this.factory.getSoldOut(item.variants);
        const title = this.factory.getTitle(item);
        const variety = this.factory.getVariety(item);
        const weight = this.factory.getWeight(item);
        const product: IProduct = {
          brand: this.vendor,
          country,
          continent,
          dateAdded,
          handle,
          imageUrl,
          price,
          process,
          processCategory,
          productUrl,
          isSoldOut,
          title,
          variety,
          weight,
          vendor: this.vendor,
        };
        if (this.config.logProducts) {
          console.log(product);
        }
        this.piratesProducts.push(product);
      }
    }
    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.piratesProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await PiratesClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
