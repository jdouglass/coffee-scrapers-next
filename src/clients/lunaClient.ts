import axios, { AxiosResponse } from 'axios';
import LunaScraper from '../scrapers/lunaScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { LunaHelper } from '../helper/lunaHelper';

export class LunaClient {
  private static vendor: string = Vendor.Luna;
  private static baseUrl: string = BaseUrl.Luna;
  private static lunaProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: LunaScraper = new LunaScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const productUrls = await LunaHelper.getProductUrls(
      this.baseUrl + '/product-category/coffee/',
      '/product/'
    );

    const lunaResponse: AxiosResponse<IWordpressProductResponseData[]> =
      await axios.get(VendorApiUrl.Luna);

    const lunaResponseFiltered: IWordpressProductResponseData[] =
      lunaResponse.data.filter((item) => {
        return productUrls.includes(item.link);
      });

    productUrls.sort();
    lunaResponseFiltered.sort((a, b) => (a.link > b.link ? 1 : -1));

    for (let i = 0; i < productUrls.length; i++) {
      const productTitle = await LunaHelper.getTitle(productUrls[i]);
      if (
        !unwantedTitles.some((unwantedString) =>
          productTitle.toLowerCase().includes(unwantedString.toLowerCase())
        )
      ) {
        const $ = await LunaHelper.getProductElement(productUrls[i]);
        const brand = this.vendor;
        const country = this.factory.getCountry($);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded();
        const handle = this.factory.getHandle(lunaResponseFiltered[i].slug);
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
