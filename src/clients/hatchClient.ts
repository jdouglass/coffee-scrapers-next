import HatchScraper from '../scrapers/hatchScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { HatchHelper } from '../helper/hatchHelper';
import { load } from 'cheerio';
import { CoffeeType } from '../enums/coffeeTypes';

export class HatchClient {
  private static vendor: string = Vendor.Hatch;
  private static baseUrl: string = BaseUrl.Hatch;
  private static hatchProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: HatchScraper = new HatchScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    console.log('Hatch Scraper started');
    const vendorLocation = await ProductsDatabase.getVendorCountryLocation(
      this.vendor
    );
    const productCategories = ['foundation', 'seasonal', 'premium', 'peak'];
    const currency = await ProductsDatabase.getCountryCurrency(vendorLocation);
    const productUrls = await HatchHelper.getProductUrls(
      this.baseUrl,
      '/shop/',
      productCategories
    );
    try {
      for (const url of productUrls) {
        const slug = url.split('/')[url.split('/').length - 1];
        const hatchDOM = await fetch(url);
        const $ = load(await hatchDOM.text());

        const brand = this.vendor;
        const country = this.factory.getCountry($);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded();
        const handle = this.factory.getHandle(slug);
        const imageUrl = this.factory.getImageUrl($);
        const price = this.factory.getPrice($);
        const process = this.factory.getProcess($);
        const processCategory = this.factory.getProcessCategory(process);
        const productUrl = this.factory.getProductUrl(url);
        const isSoldOut = this.factory.getSoldOut($);
        const tastingNotes = this.factory.getTastingNotes($);
        const tastingNotesString = this.factory.getTastingNotesString($);
        const title = this.factory.getTitle($);
        const variety = this.factory.getVariety($);
        const varietyString = this.factory.getVarietyString($);
        const weight = this.factory.getWeight($);
        const type = CoffeeType.RoastedWholeBean;

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
          tastingNotes,
          tastingNotesString,
          title,
          variety,
          varietyString,
          weight,
          vendor: this.vendor,
          vendorLocation,
          currency,
          type,
        };
        if (this.config.logProducts) {
          console.log(product);
        }
        this.hatchProducts.push(product);
      }

      if (this.config.useDatabase) {
        await ProductsDatabase.updateDb(this.hatchProducts, this.vendor);
      }
    } catch (err) {
      console.error(err);
    }
    console.log('Hatch Scraper ended');
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
