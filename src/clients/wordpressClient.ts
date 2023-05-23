import { ProductsDatabase } from '../database';
import { ApiService } from '../service/apiService';
import { IProduct } from '../interfaces/product';
import { WordpressScraperType } from '../types/wordpressScraperType';
import { WordpressHelper } from '../helper/wordpressHelper';
import config from '../config.json';
import { Vendor } from '../enums/vendors';
import { DeMelloHelper } from '../helper/deMelloHelper';
import { TimbertrainHelper } from '../helper/timbertrainHelper';
import { LunaHelper } from '../helper/lunaHelper';
import { CheerioAPI } from 'cheerio';

export class WordpressClient {
  public static async run(scraper: WordpressScraperType): Promise<void> {
    const products = new Array<IProduct>();
    const vendor = scraper.getVendor();
    const vendorApiUrl = scraper.getVendorApiUrl();
    let $: CheerioAPI | undefined;
    console.log(vendor, 'started');
    try {
      const wordpressProducts = await new ApiService(
        vendorApiUrl
      ).fetchWordpressProducts(vendor);
      for (const product of wordpressProducts) {
        if (vendor === Vendor.DeMello) {
          $ = await DeMelloHelper.getProductElement(
            scraper.getProductUrl(product)
          );
        } else if (vendor === Vendor.Timbertrain) {
          $ = await TimbertrainHelper.getProductElement(
            scraper.getProductUrl(product)
          );
        } else if (vendor === Vendor.Luna) {
          $ = await LunaHelper.getProductElement(
            scraper.getProductUrl(product)
          );
        }
        if ($) {
          products.push(await WordpressHelper.scrape(scraper, product, $));
        }
        if (config.logProducts) {
          console.log(products.at(-1));
        }
      }
      await ProductsDatabase.updateDb(products, vendor);
    } catch (err) {
      console.error(err);
    }
    console.log(vendor, 'ended');
  }
}
