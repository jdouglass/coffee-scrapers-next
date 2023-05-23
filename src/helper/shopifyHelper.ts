import { IProduct } from '../interfaces/product';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { ShopifyScraperType } from '../types/shopifyScraperType';

export class ShopifyHelper {
  public static async scrape<T extends ShopifyScraperType>(
    scraper: T,
    item: IShopifyProductResponseData
  ): Promise<IProduct>;

  public static async scrape<T extends ShopifyScraperType>(
    scraper: T,
    item: IShopifyProductResponseData,
    productDetails: string[]
  ): Promise<IProduct>;

  public static async scrape<T extends ShopifyScraperType>(
    scraper: T,
    item: IShopifyProductResponseData,
    productDetails?: string[]
  ): Promise<IProduct> {
    const country = scraper.getCountry(item, productDetails);
    const process = scraper.getProcess(item, productDetails);
    return {
      brand: scraper.getBrand(item),
      country,
      continent: scraper.getContinent(country),
      dateAdded: scraper.getDateAdded(item.published_at),
      handle: scraper.getHandle(item.handle),
      imageUrl: scraper.getImageUrl(item.images),
      price: scraper.getPrice(item.variants),
      process,
      processCategory: scraper.getProcessCategory(process),
      productUrl: scraper.getProductUrl(item),
      isSoldOut: scraper.getSoldOut(item.variants),
      tastingNotes: scraper.getTastingNotes(item, productDetails),
      title: scraper.getTitle(item),
      variety: scraper.getVariety(item, productDetails),
      weight: scraper.getWeight(item),
      vendor: scraper.getVendor(),
      vendorLocation: await scraper.getVendorCountryLocation(
        scraper.getVendor()
      ),
    };
  }
}
