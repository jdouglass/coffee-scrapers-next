import axios, { AxiosResponse } from 'axios';
import HatchScraper from '../scraperFactory/hatchScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import puppeteer, { PuppeteerLaunchOptions } from 'puppeteer';
import Helper from '../helper/helper';
import { ICrateJoyProductResponseData } from '../interfaces/crateJoy/crateJoyProductResponseData';
import { BaseUrl } from '../enums/baseUrls';

export class HatchClient {
  private static vendor: string = 'Hatch Coffee Roasters';
  private static baseUrl: string = BaseUrl.Hatch;
  private static hatchProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: HatchScraper = new HatchScraper();
  private static config: IConfig = config;
  private static puppeteerConfig: PuppeteerLaunchOptions = config.devMode
    ? { headless: config.isHeadless }
    : {
        headless: config.isHeadless,
        executablePath: config.chromePath,
      };

  public static async run(): Promise<void> {
    const productUrls = await Helper.getHatchProductUrls(
      this.baseUrl + '/shop/all'
    );

    for (const url of productUrls) {
      const id = url.split('/')[url.split('/').length - 1];
      const browser = await puppeteer.launch(this.puppeteerConfig);
      const page = await browser.newPage();
      await page.goto(url);
      const productTitleElement = await page.$('.product-title');
      const productTitle =
        (await productTitleElement?.evaluate((el) => el.textContent)) ?? '';
      const productCategoryElement = await page.$('.product-category');
      const productCategory =
        (await productCategoryElement?.evaluate((el) => el.textContent)) ?? '';
      if (
        !unwantedTitles.some(
          (unwantedString) =>
            productTitle.includes(unwantedString) ||
            productCategory.includes(unwantedString)
        )
      ) {
        const hatchResponse: AxiosResponse<ICrateJoyProductResponseData> =
          await axios.get(HatchClient.baseUrl + '/v1/store/api/products/' + id);

        const brand = this.vendor;
        const country = await this.factory.getCountry(page);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded();
        const handle = this.factory.getHandle(hatchResponse.data.slug);
        const imageUrl = this.factory.getImageUrl(hatchResponse.data.images);
        const price = await this.factory.getPrice(page);
        const process = await this.factory.getProcess(page);
        const processCategory = this.factory.getProcessCategory(process);
        const productUrl = this.factory.getProductUrl(
          hatchResponse.data.id,
          this.baseUrl
        );
        const isSoldOut = await this.factory.getSoldOut(page);
        const title = await this.factory.getTitle(page);
        const variety = await this.factory.getVariety(page);
        const weight = this.factory.getWeight(hatchResponse.data.slug);
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
        this.hatchProducts.push(product);
      }
      await browser.close();
    }

    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.hatchProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await HatchClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
