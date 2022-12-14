import axios, { AxiosResponse } from 'axios';
import AngryRoasterScraper from '../scraperFactory/angryRoasterScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IShopifyProductResponse } from '../interfaces/shopify/shopifyProductResponse';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';

export class AngryRoasterClient {
  private static vendor: string = Vendor.TheAngryRoaster;
  private static baseUrl: string = BaseUrl.TheAngryRoaster;
  private static angryRoasterProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: AngryRoasterScraper = new AngryRoasterScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const angryRoasterResponse: AxiosResponse<IShopifyProductResponse> =
      await axios.get(
        'https://www.theangryroaster.com/collections/all/products.json?limit=250'
      );
    const angryRoasterData: IShopifyProductResponseData[] =
      angryRoasterResponse.data.products;
    for (const item of angryRoasterData) {
      if (
        !unwantedTitles.some(
          (unwantedString) =>
            item.title.includes(unwantedString) ||
            item.handle.includes(unwantedString)
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
        this.angryRoasterProducts.push(product);
      }
    }
    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.angryRoasterProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await AngryRoasterClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
