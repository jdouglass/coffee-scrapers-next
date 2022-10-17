import axios, { AxiosResponse } from 'axios';
import RossoScraper from '../abstractFactory/rossoScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IProductResponse } from '../interfaces/productResponse';
import { IProductResponseData } from '../interfaces/productResponseData';

export class RossoClient {
  private static vendor: string = 'Rosso Coffee';
  private static baseUrl: string = 'https://rossocoffeeroasters.com';
  private static rossoProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: RossoScraper = new RossoScraper();

  public static async run(): Promise<void> {
    const rossoResponse: AxiosResponse<IProductResponse> = await axios.get(
      'https://www.rossocoffeeroasters.com/collections/coffee/products.json?limit=250'
    );
    const rossoData: IProductResponseData[] = rossoResponse.data.products;
    for (const item of rossoData) {
      if (
        !item.title.includes('Instant') &&
        !item.title.includes('Decaf') &&
        !item.title.includes('Box')
      ) {
        const country = this.factory.getCountry(item);
        const continent = this.factory.getContinent(country);
        const dateAdded = this.factory.getDateAdded(item.published_at);
        const handle = this.factory.getHandle(item.handle);
        const imageUrl = this.factory.getImageUrl(item.images);
        const price = this.factory.getPrice(item.variants);
        const process = this.factory.getProcess(item.body_html);
        const processCategory = this.factory.getProcessCategory(process);
        const productUrl = this.factory.getProductUrl(item, this.baseUrl);
        const isSoldOut = this.factory.getSoldOut(item.variants);
        const title = this.factory.getTitle(item.title);
        const variety = this.factory.getVariety(item);
        const weight = this.factory.getWeight(item.variants);
        const product: IProduct = {
          brand: this.vendor,
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
        this.rossoProducts.push(product);
      }
    }
    await ProductsDatabase.updateDb(this.rossoProducts);
  }
}

const main = async (): Promise<void> => {
  try {
    await RossoClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
