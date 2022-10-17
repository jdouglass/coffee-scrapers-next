import axios, { AxiosResponse } from 'axios';
import EightOunceScraper from '../abstractFactory/eightOunceScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IProductResponse } from '../interfaces/productResponse';
import { IProductResponseData } from '../interfaces/productResponseData';
import { unwantedTitles } from '../data/unwantedTitles';

export class EightOunceClient {
  private static vendor: string = 'Eight Ounce Coffee';
  private static baseUrl: string = 'https://eightouncecoffee.ca';
  private static eightOunceProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: EightOunceScraper = new EightOunceScraper();

  public static async run(): Promise<void> {
    const eightOunceResponse: AxiosResponse<IProductResponse> = await axios.get(
      'https://eightouncecoffee.ca/collections/newest-coffee/products.json?limit=250'
    );
    const eightOunceData: IProductResponseData[] =
      eightOunceResponse.data.products;
    for (const item of eightOunceData) {
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
        const title = this.factory.getTitle(item.title, brand);
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
        console.log(product);
        this.eightOunceProducts.push(product);
      }
    }
    // await ProductsDatabase.updateDb(this.eightOunceProducts);
  }
}

const main = async (): Promise<void> => {
  try {
    await EightOunceClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();