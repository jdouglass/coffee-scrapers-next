import axios, { AxiosResponse } from 'axios';
import RevolverScraper from '../scraperFactory/revolverScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IProductResponse } from '../interfaces/productResponse';
import { IProductResponseData } from '../interfaces/productResponseData';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';

export class RevolverClient {
  private static vendor: string = 'Revolver Coffee';
  private static baseUrl: string = 'https://revolvercoffee.ca';
  private static revolverProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: RevolverScraper = new RevolverScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const revolverResponse: AxiosResponse<IProductResponse> = await axios.get(
      'https://revolvercoffee.ca/collections/coffee/products.json?limit=250'
    );
    const revolverData: IProductResponseData[] = revolverResponse.data.products;
    for (const item of revolverData) {
      if (
        !unwantedTitles.some((unwantedString) =>
          item.title.includes(unwantedString)
        )
      ) {
        const brand = this.factory.getBrand(item);
        const country = this.factory.getCountry(item);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded(item.published_at);
        const handle = this.factory.getHandle(item.handle);
        const imageUrl = this.factory.getImageUrl(item.images);
        const price = this.factory.getPrice(item.variants);
        const process = this.factory.getProcess(item);
        const processCategory = this.factory.getProcessCategory(process);
        const productUrl = this.factory.getProductUrl(item, this.baseUrl);
        const isSoldOut = this.factory.getSoldOut(item.variants);
        const title = this.factory.getTitle(item.title, brand, country);
        const variety = this.factory.getVariety(item);
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
        this.revolverProducts.push(product);
      }
    }
    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.revolverProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await RevolverClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
