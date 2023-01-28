import axios, { AxiosResponse } from 'axios';
import MonogramScraper from '../scrapers/monogramScraper';
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
import { MonogramHelper } from '../helper/monogramHelper';

export class MonogramClient {
  private static vendor: string = Vendor.Monogram;
  private static baseUrl: string = BaseUrl.Monogram;
  private static monogramProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: MonogramScraper = new MonogramScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const monogramResponse: AxiosResponse<IShopifyProductResponse> =
      await axios.get(VendorApiUrl.Monogram);
    const monogramData: IShopifyProductResponseData[] =
      monogramResponse.data.products;
    for (const item of monogramData) {
      if (
        !unwantedTitles.some(
          (unwantedString) =>
            item.title.includes(unwantedString) ||
            item.handle.toLowerCase().includes(unwantedString)
        )
      ) {
        const productDetails = await MonogramHelper.getProductInfo(
          this.factory.getProductUrl(item, this.baseUrl)
        );
        const brand = this.factory.getBrand(item);
        const country = this.factory.getCountry(item, productDetails);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded(item.published_at);
        const handle = this.factory.getHandle(item.handle);
        const imageUrl = this.factory.getImageUrl(item.images);
        const price = this.factory.getPrice(item.variants);
        const process = this.factory.getProcess(item, productDetails);
        const processCategory = this.factory.getProcessCategory(process);
        const productUrl = this.factory.getProductUrl(item, this.baseUrl);
        const isSoldOut = this.factory.getSoldOut(item.variants);
        const title = this.factory.getTitle(item);
        const variety = this.factory.getVariety(item, productDetails);
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
        this.monogramProducts.push(product);
      }
    }
    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.monogramProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await MonogramClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
