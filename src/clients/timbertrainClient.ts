import axios, { AxiosResponse } from 'axios';
import TimbertrainScraper from '../scrapers/timbertrainScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { TimbertrainHelper } from '../helper/timbertrainHelper';

export class TimbertrainClient {
  private static vendor: string = Vendor.Timbertrain;
  private static baseUrl: string = BaseUrl.Timbertrain;
  private static timbertrainProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: TimbertrainScraper = new TimbertrainScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const productUrls = await TimbertrainHelper.getProductUrls(
      this.baseUrl + '/product-category/coffee/',
      '/shop/'
    );

    const timbertrainResponse: AxiosResponse<IWordpressProductResponseData[]> =
      await axios.get(VendorApiUrl.Timbertrain);

    const timbertrainResponseFiltered: IWordpressProductResponseData[] =
      timbertrainResponse.data.filter((item) => {
        return productUrls.includes(item.link);
      });

    productUrls.sort();
    timbertrainResponseFiltered.sort((a, b) => (a.link > b.link ? 1 : -1));

    for (let i = 0; i < timbertrainResponseFiltered.length; i++) {
      const productTitle = await TimbertrainHelper.getTitle(
        timbertrainResponseFiltered[i].link
      );
      if (
        !unwantedTitles.some((unwantedString) => {
          productTitle.toLowerCase().includes(unwantedString.toLowerCase());
        })
      ) {
        const $ = await TimbertrainHelper.getProductElement(
          timbertrainResponseFiltered[i].link
        );
        const brand = this.vendor;
        const country = this.factory.getCountry($);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded(
          timbertrainResponseFiltered[i]
        );
        const handle = this.factory.getHandle(
          timbertrainResponseFiltered[i].slug
        );
        const imageUrl = this.factory.getImageUrl($);
        const price = this.factory.getPrice($);
        const process = this.factory.getProcess($);
        const processCategory = this.factory.getProcessCategory(process);
        const isSoldOut = this.factory.getSoldOut($);
        const title = this.factory.getTitle($);
        const variety = this.factory.getVariety($);
        const weight = this.factory.getWeight($);
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
          productUrl: timbertrainResponseFiltered[i].link,
          isSoldOut,
          title,
          variety,
          weight,
          vendor: this.vendor,
        };
        if (this.config.logProducts) {
          console.log(product);
        }
        this.timbertrainProducts.push(product);
      }
    }

    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.timbertrainProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await TimbertrainClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
