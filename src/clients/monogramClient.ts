import axios, { AxiosResponse } from 'axios';
import MonogramScraper from '../scraperFactory/monogramScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IShopifyProductResponse } from '../interfaces/shopify/shopifyProductResponse';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import puppeteer from 'puppeteer';
import { puppeteerConfig } from '../puppeteerConfig';
import { VendorApiUrl } from '../enums/vendorApiUrls';

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
        const browser = await puppeteer.launch(puppeteerConfig);
        const page = await browser.newPage();
        await page.goto(this.factory.getProductUrl(item, this.baseUrl));
        const brand = this.factory.getBrand(item);
        const country = await this.factory.getCountry(item, page);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded(item.published_at);
        const handle = this.factory.getHandle(item.handle);
        const imageUrl = this.factory.getImageUrl(item.images);
        const price = this.factory.getPrice(item.variants);
        const process = await this.factory.getProcess(item, page);
        const processCategory = this.factory.getProcessCategory(process);
        const productUrl = this.factory.getProductUrl(item, this.baseUrl);
        const isSoldOut = this.factory.getSoldOut(item.variants);
        const title = this.factory.getTitle(item);
        const variety = await this.factory.getVariety(item, page);
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
        await browser.close();
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
