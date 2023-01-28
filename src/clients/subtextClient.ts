import SubtextScraper from '../scrapers/subtextScraper';
import { ProductsDatabase } from '../database';
import { IProduct } from '../interfaces/product';
import { unwantedTitles } from '../data/unwantedTitles';
import { IConfig } from '../interfaces/config';
import config from '../config.json';
import Helper from '../helper/helper';
import { BaseUrl } from '../enums/baseUrls';
import { Vendor } from '../enums/vendors';
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { ApiService } from '../service/apiService';
import { SubtextHelper } from '../helper/subtextHelper';

export class SubtextClient {
  private static vendor: string = Vendor.Subtext;
  private static baseUrl: string = BaseUrl.Subtext;
  private static subtextProducts: Array<IProduct> = new Array<IProduct>();
  private static factory: SubtextScraper = new SubtextScraper();
  private static config: IConfig = config;

  public static async run(): Promise<void> {
    const shopifyApi = new ApiService(VendorApiUrl.Subtext);
    const shopifyProducts = await shopifyApi.fetchShopifyProducts();
    for (let i = 0; i < shopifyProducts.length; i++) {
      const item = shopifyProducts[i];
      const productUrl =
        this.baseUrl +
        '/collections/filter-coffee-beans/products/' +
        item.handle;
      const newBodyText = await SubtextHelper.getProductInfo(productUrl);
      item.title = await Helper.getPageTitle(productUrl);
      if (newBodyText.length) {
        item.body_html = newBodyText.join('\n');
      }
      if (
        !unwantedTitles.some((unwantedString) =>
          item.title.includes(unwantedString)
        )
      ) {
        const brand = this.vendor;
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
        const title = this.factory.getTitle(item);
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
        if (this.config.logProducts) {
          console.log(product);
        }
        this.subtextProducts.push(product);
      }
    }
    if (this.config.useDatabase) {
      await ProductsDatabase.updateDb(this.subtextProducts);
    }
  }
}

const main = async (): Promise<void> => {
  try {
    await SubtextClient.run();
  } catch (error) {
    console.error(error);
  }
};

void main();
