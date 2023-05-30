import axios, { AxiosResponse } from 'axios';
import PrototypeScraper from '../scrapers/prototypeScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { ISquareSpaceProductResponse } from '../interfaces/squareSpace/squareSpaceProductResponse.interface';
import { ApiService } from '../service/apiService';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export class PrototypeClient {
  private static vendor: string = Vendor.Prototype;
  private static baseUrl: string = BaseUrl.Prototype;
  private static prototypeProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: PrototypeScraper = new PrototypeScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const squareSpaceApi = new ApiService(VendorApiUrl.Prototype);
    const squareSpaceProducts = await squareSpaceApi.fetchSquareSpaceProducts();
    const vendorLocation = await ProductsDatabase.getVendorCountryLocation(
      this.vendor
    );
    const currency = await ProductsDatabase.getCountryCurrency(vendorLocation);
    console.log('Prototype Scraper started');
    try {
      for (let i = 0; i < squareSpaceProducts.length; i++) {
        const id =
          squareSpaceProducts[i].fullUrl.split('/')[
            squareSpaceProducts[i].fullUrl.split('/').length - 1
          ];
        const prototypeResponse: AxiosResponse<ISquareSpaceProductResponse> =
          await axios.get(
            PrototypeClient.baseUrl + '/shop/' + id + '?format=json-pretty'
          );
        if (
          !unwantedTitles.some((unwantedString) =>
            squareSpaceProducts[i].title
              .toLowerCase()
              .includes(unwantedString.toLowerCase())
          )
        ) {
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
          const productUrl = this.baseUrl + squareSpaceProducts[i].fullUrl;
          const isSoldOut = await this.factory.getSoldOut(
            this.baseUrl + squareSpaceProducts[i].fullUrl
          );
          const tastingNotes = this.factory.getTastingNotes(
            prototypeResponse.data.item
          );
          const title = this.factory.getTitle(prototypeResponse.data.item);
          const variety = this.factory.getVariety(prototypeResponse.data.item);
          const weight = this.factory.getWeight(prototypeResponse.data.item);
          const type = this.factory.getType(prototypeResponse.data.item);

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
            type,
          };
          if (this.config.logProducts) {
            console.log(product);
          }
          this.prototypeProducts.push(product);
        }
      }

      if (this.config.useDatabase) {
        await ProductsDatabase.updateDb(this.prototypeProducts, this.vendor);
      }
    } catch (err) {
      console.error(err);
    }
    console.log('Prototype Scraper ended');
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
