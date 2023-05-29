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
import { VendorApiUrl } from '../enums/vendorApiUrls';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { NemesisHelper } from '../helper/nemesisHelper';
import { ProdigalHelper } from '../helper/prodigalHelper';
import { HeartHelper } from '../helper/heartHelper';

export class ShopifyClient {
  public static async run(scraper: ShopifyScraperType): Promise<void> {
    const products = new Array<IProduct>();
    const vendor = scraper.getVendor();
    const vendorApiUrl = scraper.getVendorApiUrl();
    const vendorLocation = await ProductsDatabase.getVendorCountryLocation(
      vendor
    );
    const currency = await ProductsDatabase.getCountryCurrency(vendorLocation);
    let productDetails: string[] | undefined;
    console.log(vendor, 'started');
    try {
      let shopifyProducts: IShopifyProductResponseData[] = [];
      if (vendor === Vendor.BlackCreek) {
        const blendProducts = await new ApiService(
          VendorApiUrl.BlackCreekBlend
        ).fetchShopifyProducts();
        const singleOriginProducts = await new ApiService(
          VendorApiUrl.BlackCreekSingleOrigin
        ).fetchShopifyProducts();
        shopifyProducts = blendProducts.concat(singleOriginProducts);
      } else {
        shopifyProducts = await new ApiService(
          vendorApiUrl
        ).fetchShopifyProducts();
      }
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
        } else if (vendor === Vendor.Nemesis) {
          productDetails = await NemesisHelper.getProductInfo(
            scraper.getProductUrl(product)
          );
        } else if (vendor === Vendor.Prodigal) {
          productDetails = await ProdigalHelper.getProductInfo(
            scraper.getProductUrl(product)
          );
        } else if (vendor === Vendor.Heart) {
          productDetails = await HeartHelper.getTastingNotes(
            scraper.getProductUrl(product)
          );
        }

        if (productDetails) {
          products.push(
            ShopifyHelper.scrape(
              scraper,
              product,
              vendorLocation,
              currency,
              productDetails
            )
          );
        } else {
          products.push(
            ShopifyHelper.scrape(scraper, product, vendorLocation, currency)
          );
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
