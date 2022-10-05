import axios, { AxiosResponse } from 'axios';
import PiratesScraper from '../abstractFactory/piratesScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IProductResponse } from '../interfaces/productResponse';
import { IProductResponseData } from '../interfaces/productResponseData';

export class PiratesClient {
  private static vendor: string = 'Pirates of Coffee';
  private static baseUrl: string = 'https://piratesofcoffee.com';
  private static piratesProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: PiratesScraper = new PiratesScraper();

  public static async run(): Promise<void> {
    const piratesResponse: AxiosResponse<IProductResponse> = await axios.get(
      'https://piratesofcoffee.com/collections/coffee/products.json?limit=250'
    );
    const piratesData: IProductResponseData[] = piratesResponse.data.products;
    for (const item of piratesData) {
      if (
        !item.title.includes('Sample') &&
        !item.title.includes('Panama Ninety Plus Estates') &&
        !item.title.includes('TREASURE BOX') &&
        !item.title.includes('Subscription') &&
        !item.title.includes('Blend') &&
        !item.title.includes('BAGS') &&
        !item.title.includes('Tea')
      ) {
        const brand = this.factory.getBrand(item);
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
        const variety = this.factory.getVariety(item.body_html);
        const weight = this.factory.getWeight(item.variants);
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
        this.piratesProducts.push(product);
      }
    }
    await ProductsDatabase.updateDb(this.piratesProducts);
  }
}
