import { CheerioAPI } from 'cheerio';
import { IProduct } from '../interfaces/product';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { WordpressScraperType } from '../types/wordpressScraperType';

export class WordpressHelper {
  public static scrape<T extends WordpressScraperType>(
    scraper: T,
    item: IWordpressProductResponseData,
    $: CheerioAPI
  ): IProduct {
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
      title: scraper.getTitle(item),
      variety: scraper.getVariety(item, $),
      weight: scraper.getWeight(item, $),
      vendor: scraper.getVendor(),
    };
  }
}
