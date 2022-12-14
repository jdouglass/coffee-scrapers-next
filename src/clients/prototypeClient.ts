import axios, { AxiosResponse } from 'axios';
import PrototypeScraper from '../scraperFactory/prototypeScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import puppeteer, { PuppeteerLaunchOptions } from 'puppeteer';
import Helper from '../helper/helper';
import { ICrateJoyProductResponseData } from '../interfaces/crateJoy/crateJoyProductResponseData';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { ISquareSpaceProductResponseData } from '../interfaces/squareSpace/squareSpaceResponseData';
import { ISquareSpaceProductResponse } from '../interfaces/squareSpace/squareSpaceProductResponse';

export class PrototypeClient {
  private static vendor: string = Vendor.Prototype;
  private static baseUrl: string = BaseUrl.Prototype;
  private static prototypeProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: PrototypeScraper = new PrototypeScraper();
  private static config: IConfig = config;
  private static puppeteerConfig: PuppeteerLaunchOptions = config.devMode
    ? { headless: config.isHeadless, timeout: config.timeout }
    : {
        headless: config.isHeadless,
        executablePath: config.chromePath,
        timeout: config.timeout,
      };

  public static async run(): Promise<void> {
    const productUrls = await Helper.getProductUrls(
      this.baseUrl + '/shop/',
      '/shop/',
      '/shop/'
    );

    for (const url of productUrls) {
      const id = url.split('/')[url.split('/').length - 1];
      const browser = await puppeteer.launch(this.puppeteerConfig);
      const page = await browser.newPage();
      await page.goto(url);
      const productTitleElement = await page.$('.ProductItem-details-title');
      const productTitle =
        (await productTitleElement?.evaluate((el) => el.textContent)) ?? '';
      if (
        !unwantedTitles.some((unwantedString) =>
          productTitle.includes(unwantedString)
        )
      ) {
        const prototypeResponse: AxiosResponse<ISquareSpaceProductResponse> =
          await axios.get(
            PrototypeClient.baseUrl + '/shop/' + id + '?format=json-pretty'
          );

        const brand = this.vendor;
        const country = this.factory.getCountry(prototypeResponse.data.item);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded(
          prototypeResponse.data.item
        );
        const handle = this.factory.getHandle(prototypeResponse.data.item);
        const imageUrl = this.factory.getImageUrl(
          prototypeResponse.data.item.items[0].assetUrl
        );
        const price = this.factory.getPrice(prototypeResponse.data.item);
        const process = this.factory.getProcess(prototypeResponse.data.item);
        const processCategory = this.factory.getProcessCategory(process);
        const productUrl = this.factory.getProductUrl(
          this.baseUrl,
          prototypeResponse.data.item
        );
        const isSoldOut = await this.factory.getSoldOut(page);
        const title = this.factory.getTitle(prototypeResponse.data.item);
        const variety = this.factory.getVariety(prototypeResponse.data.item);
        const weight = this.factory.getWeight(prototypeResponse.data.item);
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
        this.prototypeProducts.push(product);
      }
      await browser.close();
    }

    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.prototypeProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await PrototypeClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
