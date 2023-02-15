import { ProductsDatabase } from '../database';
import { ApiService } from '../service/apiService';
import { EightOunceHelper } from '../helper/eightOunceHelper';
import { IProduct } from '../interfaces/product';
import { ShopifyScraperType } from '../types/shopifyScraperType';
import { Vendor } from '../enums/vendors';
import { ShopifyHelper } from '../helper/shopifyHelper';
import { MonogramHelper } from '../helper/monogramHelper';
import { PhilAndSebastianHelper } from '../helper/philAndSebastianHelper';
import { SubtextHelper } from '../helper/subtextHelper';
import config from '../config.json';

export class ShopifyClient {
  public static async run(scraper: ShopifyScraperType): Promise<void> {
    const products = new Array<IProduct>();
    const vendor = scraper.getVendor();
    const vendorApiUrl = scraper.getVendorApiUrl();
    let productDetails: string[] | undefined;
    console.log(vendor, 'started');
    try {
      const shopifyProducts = await new ApiService(
        vendorApiUrl
      ).fetchShopifyProducts();
      for (const product of shopifyProducts) {
        if (vendor === Vendor.EightOunce) {
          productDetails = await EightOunceHelper.getProductInfo(
            scraper.getProductUrl(product)
          );
        } else if (vendor === Vendor.Monogram) {
          productDetails = await MonogramHelper.getProductInfo(
            scraper.getProductUrl(product)
          );
        } else if (vendor === Vendor.PhilAndSebastian) {
          productDetails = await PhilAndSebastianHelper.getProductInfo(
            scraper.getProductUrl(product)
          );
        } else if (vendor === Vendor.Subtext) {
          productDetails = await SubtextHelper.getProductInfo(
            scraper.getProductUrl(product)
          );
        }

        if (productDetails) {
          products.push(ShopifyHelper.scrape(scraper, product, productDetails));
        } else {
          products.push(ShopifyHelper.scrape(scraper, product));
        }
        if (config.logProducts) {
          console.log(products.at(-1));
        }
      }
      await ProductsDatabase.updateDb(products);
    } catch (err) {
      console.error(err);
    }
    console.log(vendor, 'ended');
  }
}
