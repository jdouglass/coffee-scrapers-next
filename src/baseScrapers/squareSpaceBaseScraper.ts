import { Page } from 'puppeteer';
import { ISquareSpaceProductResponseData } from '../interfaces/squareSpace/squareSpaceResponseData.interface';
import { ISquareSpaceBaseScraper } from '../interfaces/squareSpace/squareSpaceScraper.interface';
import { Scraper } from './scraper';

export class SquareSpaceBaseScraper
  extends Scraper
  implements ISquareSpaceBaseScraper
{
  getDateAdded = (item: ISquareSpaceProductResponseData): string => {
    return new Date(item.updatedOn).toISOString();
  };

  getHandle = (item: ISquareSpaceProductResponseData): string => {
    let handle = item.title.toLowerCase();
    if (handle.includes(',')) {
      handle = handle.split(',')[0];
    }
    handle = handle.replaceAll(' ', '-');
    handle = handle.replaceAll('(', '');
    handle = handle.replaceAll(')', '');
    return handle;
  };

  getImageUrl = (image: string): string => {
    return image;
  };

  getPrice = (item: ISquareSpaceProductResponseData): number => {
    return Number(item.variants[0].priceMoney.value);
  };

  getProductUrl = (
    baseUrl: string,
    item: ISquareSpaceProductResponseData
  ): string => {
    return baseUrl + item.fullUrl;
  };

  getSoldOut = async (page: Page, selector: string): Promise<boolean> => {
    try {
      await page.waitForSelector(selector);
      return false;
    } catch (e) {
      return true;
    }
  };
}