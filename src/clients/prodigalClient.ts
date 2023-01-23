import axios, { AxiosResponse } from 'axios';
import ProdigalScraper from '../scraperFactory/prodigalScraper';
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

export class ProdigalClient {
  private static vendor: string = Vendor.Prodigal;
  private static baseUrl: string = BaseUrl.Prodigal;
  private static prodigalProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: ProdigalScraper = new ProdigalScraper();
  private static config: IConfig = configData;

  public static async run(): Promise<void> {
    const prodigalResponse: AxiosResponse<IShopifyProductResponse> =
      await axios.get(VendorApiUrl.Prodigal);
    const prodigalData: IShopifyProductResponseData[] =
      prodigalResponse.data.products;
    for (const item of prodigalData) {
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
        this.prodigalProducts.push(product);
      }
    }
    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.prodigalProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await ProdigalClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
