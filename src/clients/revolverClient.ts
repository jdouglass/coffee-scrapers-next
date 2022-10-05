import axios, { AxiosResponse } from 'axios';
import RevolverScraper from '../abstractFactory/revolverScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IProductResponse } from '../interfaces/productResponse';
import { IProductResponseData } from '../interfaces/productResponseData';

export class RevolverClient {
  private static vendor: string = 'Revolver Coffee';
  private static baseUrl: string = 'https://revolvercoffee.ca';
  private static revolverProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: RevolverScraper = new RevolverScraper();

  public static async run(): Promise<void> {
    const revolverResponse: AxiosResponse<IProductResponse> = await axios.get(
      'https://revolvercoffee.ca/collections/coffee/products.json?limit=250'
    );
    const revolverData: IProductResponseData[] = revolverResponse.data.products;
    for (const item of revolverData) {
      if (
        !item.title.includes('Sample') &&
        !item.title.includes('Instant') &&
        !item.title.includes('Decaf') &&
        !item.title.includes('Drip Kit') &&
        !item.title.includes('Varie') &&
        !item.title.includes('Tea') &&
        !item.title.includes('Advent') &&
        !item.title.includes('Cans')
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
        const title = this.factory.getTitle(item.title, brand, country);
        const variety = this.factory.getVariety(item);
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
        this.revolverProducts.push(product);
      }
    }
    await ProductsDatabase.updateDb(this.revolverProducts);
  }
}
