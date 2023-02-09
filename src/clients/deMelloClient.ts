import axios, { AxiosResponse } from 'axios';
import DeMelloScraper from '../scrapers/deMelloScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { DeMelloHelper } from '../helper/deMelloHelper';

export class DeMelloClient {
  private static vendor: string = Vendor.DeMello;
  private static baseUrl: string = BaseUrl.DeMello;
  private static deMelloProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: DeMelloScraper = new DeMelloScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const productUrls = await DeMelloHelper.getProductUrls(
      this.baseUrl + '/product-category/coffee/',
      '/shop/'
    );

    const deMelloResponse: AxiosResponse<IWordpressProductResponseData[]> =
      await axios.get(VendorApiUrl.DeMello);

    const deMelloResponseFiltered: IWordpressProductResponseData[] =
      deMelloResponse.data.filter((item) => {
        return productUrls.includes(item.link);
      });

    productUrls.sort();
    deMelloResponseFiltered.sort((a, b) => (a.link > b.link ? 1 : -1));

    for (let i = 0; i < deMelloResponseFiltered.length; i++) {
      if (
        !unwantedTitles.some((unwantedString) => {
          deMelloResponseFiltered[i].link.includes(
            unwantedString.toLowerCase()
          );
        })
      ) {
        const $ = await DeMelloHelper.getProductElement(
          deMelloResponseFiltered[i].link
        );
        const brand = this.vendor;
        const country = this.factory.getCountry($);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded(deMelloResponseFiltered[i]);
        const handle = this.factory.getHandle(deMelloResponseFiltered[i].slug);
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
          productUrl: deMelloResponseFiltered[i].link,
          isSoldOut,
          title,
          variety,
          weight,
          vendor: this.vendor,
        };
        if (this.config.logProducts) {
          console.log(product);
        }
        this.deMelloProducts.push(product);
      }
    }

    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.deMelloProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await DeMelloClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
