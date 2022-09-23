import axios, { AxiosResponse } from 'axios';
import { IProduct } from '../interfaces/product';
import { IProductResponse } from '../interfaces/productResponse';
import { IProductResponseData } from '../interfaces/productResponseData';
import MonogramScraper from './monogramScraper';

const scrapeMonogram = async (): Promise<void> => {
  const monogramResponse: AxiosResponse<IProductResponse> = await axios.get(
    'https://monogramcoffee.com/collections/whole-bean-coffee/products.json?limit=250'
  );
  const baseUrl = 'https://monogramcoffee.com';
  const vendor = 'Monogram';
  const monogramData: IProductResponseData[] = monogramResponse.data.products;
  const monogramFactory: MonogramScraper = new MonogramScraper();
  const monogramProducts: Array<IProduct> = new Array<IProduct>();
  for (const item of monogramData) {
    if (
      !item.title.includes('Decaf') &&
      !item.title.includes('Gift') &&
      !item.title.includes('Instant') &&
      !item.title.includes('Drip')
    ) {
      const brand = monogramFactory.getBrand(item);
      const country = monogramFactory.getCountry(item.body_html);
      const continent = monogramFactory.getContinent(country);
      const dateAdded = monogramFactory.getDateAdded(item.published_at);
      const handle = monogramFactory.getHandle(item.handle);
      const imageUrl = monogramFactory.getImageUrl(item.images);
      const price = monogramFactory.getPrice(item.variants);
      const process = monogramFactory.getProcess(item.body_html);
      const processCategory = monogramFactory.getProcessCategory(process);
      const productUrl = monogramFactory.getProductUrl(item, baseUrl);
      const isSoldOut = monogramFactory.getSoldOut(item.variants);
      const title = monogramFactory.getTitle(item.title);
      const variety = monogramFactory.getVariety(item.body_html);
      const weight = monogramFactory.getWeight(item.variants);
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
        vendor,
      };
      monogramProducts.push(product);
    }
  }
};

const main = async () => {
  await scrapeMonogram();
};

void main();
