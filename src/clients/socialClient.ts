import axios, { AxiosResponse } from 'axios';
import SocialScraper from '../scraperFactory/socialScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IShopifyProductResponse } from '../interfaces/shopify/shopifyProductResponse.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import configData from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export class SocialClient {
  private static vendor: string = Vendor.Social;
  private static baseUrl: string = BaseUrl.Social;
  private static socialProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: SocialScraper = new SocialScraper();
  private static config: IConfig = configData;

  public static async run(): Promise<void> {
    const socialResponse: AxiosResponse<IShopifyProductResponse> =
      await axios.get(VendorApiUrl.Social);
    const socialData: IShopifyProductResponseData[] =
      socialResponse.data.products;
    for (const item of socialData) {
      if (
        !unwantedTitles.some((unwantedString) =>
          item.title.includes(unwantedString)
        )
      ) {
        const brand = this.vendor;
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
          brand,
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
        this.socialProducts.push(product);
      }
    }
    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.socialProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await SocialClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
