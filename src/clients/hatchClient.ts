import axios, { AxiosResponse } from 'axios';
import HatchScraper from '../scrapers/hatchScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { HatchHelper } from '../helper/hatchHelper';
import { load } from 'cheerio';
import { ICrateJoyProductResponseData } from '../interfaces/crateJoy/crateJoyProductResponseData.interface';

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
    const currency = await ProductsDatabase.getCountryCurrency(vendorLocation);
    const productUrls = await HatchHelper.getProductUrls(
      this.baseUrl + '/shop/all/',
      '/shop/product/'
    );
    try {
      for (let url of productUrls) {
        if (!url.includes('https')) {
          url = this.baseUrl + url;
        }
        const id = url.split('/')[url.split('/').length - 1];
        const productCategory = await HatchHelper.getProductCategory(url);
        if (
          !unwantedTitles.some((unwantedString) =>
            productCategory.toLowerCase().includes(unwantedString.toLowerCase())
          )
        ) {
          const hatchResponse: AxiosResponse<ICrateJoyProductResponseData> =
            await axios.get(
              HatchClient.baseUrl + '/v1/store/api/products/' + id
            );
          const hatchDOM = await fetch(
            HatchClient.baseUrl + '/shop/product/' + id
          );
          const $ = load(await hatchDOM.text());

          const brand = this.vendor;
          const country = this.factory.getCountry($);
          const continent = this.factory.getContinent(country);
          const dateAdded = this.factory.getDateAdded();
          const handle = this.factory.getHandle(hatchResponse.data.slug);
          const imageUrl = this.factory.getImageUrl(hatchResponse.data.images);
          const price = this.factory.getPrice($);
          const process = this.factory.getProcess($);
          const processCategory = this.factory.getProcessCategory(process);
          const productUrl = this.factory.getProductUrl(hatchResponse.data.id);
          const isSoldOut = this.factory.getSoldOut($);
          const tastingNotes = this.factory.getTastingNotes($);
          const title = this.factory.getTitle($);
          const variety = this.factory.getVariety($);
          const weight = this.factory.getWeight(
            hatchResponse.data.slug,
            hatchResponse.data.description
          );

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
            title,
            variety,
            weight,
            vendor: this.vendor,
            vendorLocation,
            currency,
          };
          if (this.config.logProducts) {
            console.log(product);
          }
          this.hatchProducts.push(product);
        }
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
