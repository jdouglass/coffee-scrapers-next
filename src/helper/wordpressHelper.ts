import { CheerioAPI } from 'cheerio';
import { IProduct } from '../interfaces/product';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { WordpressScraperType } from '../types/wordpressScraperType';
import { ProductsDatabase } from '../database';

export class WordpressHelper {
  public static async scrape<T extends WordpressScraperType>(
    scraper: T,
    item: IWordpressProductResponseData,
    $: CheerioAPI
  ): Promise<IProduct> {
    const country = scraper.getCountry(item, $);
    const process = scraper.getProcess(item, $);
    return {
      brand: scraper.getBrand(item),
      country,
      continent: scraper.getContinent(country),
      dateAdded: scraper.getDateAdded(item),
      handle: scraper.getHandle(item.slug),
      imageUrl: scraper.getImageUrl($),
      price: scraper.getPrice($),
      process,
      processCategory: scraper.getProcessCategory(process),
      productUrl: scraper.getProductUrl(item),
      isSoldOut: scraper.getSoldOut($),
      tastingNotes: scraper.getTastingNotes(item, $),
      title: scraper.getTitle(item),
      variety: scraper.getVariety(item, $),
      weight: scraper.getWeight(item, $),
      vendor: scraper.getVendor(),
      vendorLocation: await ProductsDatabase.getVendorCountryLocation(
        scraper.getVendor()
      ),
    };
  }
}
