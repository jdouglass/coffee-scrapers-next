import axios, { AxiosResponse } from 'axios';
import LunaScraper from '../scrapers/lunaScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import puppeteer from 'puppeteer';
import Helper from '../helper/helper';
import { BaseUrl } from '../enums/baseUrls';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { Vendor } from '../enums/vendors';
import { puppeteerConfig } from '../puppeteerConfig';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export class LunaClient {
  private static vendor: string = Vendor.Luna;
  private static baseUrl: string = BaseUrl.Luna;
  private static lunaProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: LunaScraper = new LunaScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const productUrls = await Helper.getProductUrls(
      this.baseUrl + '/product-category/coffee',
      '/product/',
      '/product-category/coffee'
    );

    const lunaResponse: AxiosResponse<IWordpressProductResponseData[]> =
      await axios.get(VendorApiUrl.Luna);

    const lunaResponseFiltered: IWordpressProductResponseData[] =
      lunaResponse.data.filter((item) => {
        return productUrls.includes(item.link);
      });

    for (let i = 0; i < productUrls.length; i++) {
      const browser = await puppeteer.launch(puppeteerConfig);
      const page = await browser.newPage();
      await page.goto(productUrls[i]);
      const productTitleElement = await page.$('.product_title entry-title');
      const productTitle =
        (await productTitleElement?.evaluate((el) => el.textContent)) ?? '';
      if (
        !unwantedTitles.some((unwantedString) =>
          productTitle.includes(unwantedString)
        )
      ) {
        const brand = this.vendor;
        const country = await this.factory.getCountry(page);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded();
        const handle = this.factory.getHandle(lunaResponseFiltered[i].slug);
        const imageUrl = await this.factory.getImageUrl(page);
        const price = await this.factory.getPrice(page);
        const process = await this.factory.getProcess(page);
        const processCategory = this.factory.getProcessCategory(process);
        const isSoldOut = await this.factory.getSoldOut(page);
        const title = await this.factory.getTitle(page);
        const variety = await this.factory.getVariety(page);
        const weight = await this.factory.getWeight(page);
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
          productUrl: productUrls[i],
          isSoldOut,
          title,
          variety,
          weight,
          vendor: this.vendor,
        };
        if (this.config.logProducts) {
          console.log(product);
        }
        this.lunaProducts.push(product);
      }
      await browser.close();
    }

    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.lunaProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await LunaClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
