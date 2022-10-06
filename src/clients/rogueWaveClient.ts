import axios, { AxiosResponse } from 'axios';
import RogueWaveScraper from '../abstractFactory/rogueWaveScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { IProductResponse } from '../interfaces/productResponse';
import { IProductResponseData } from '../interfaces/productResponseData';

export class RogueWaveClient {
  private static vendor: string = 'Rogue Wave Coffee';
  private static baseUrl: string = 'https://roguewavecoffee.ca';
  private static rogueWaveProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: RogueWaveScraper = new RogueWaveScraper();

  public static async run(): Promise<void> {
    const rogueWaveResponse: AxiosResponse<IProductResponse> = await axios.get(
      'https://www.roguewavecoffee.ca/collections/coffee/products.json?limit=250'
    );
    const rogueWaveData: IProductResponseData[] =
      rogueWaveResponse.data.products;
    for (const item of rogueWaveData) {
      if (
        !item.title.includes('Garage') &&
        !item.title.includes('Pack') &&
        !item.title.includes('Surprise') &&
        !item.title.includes('Decaf') &&
        !item.title.includes('Dried Coffee') &&
        !item.title.includes('LOW CAF')
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
        this.rogueWaveProducts.push(product);
      }
    }
    await ProductsDatabase.updateDb(this.rogueWaveProducts);
  }
}
