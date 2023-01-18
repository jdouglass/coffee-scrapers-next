import { IShopifyImage } from '../interfaces/shopify/shopifyImage';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant';
import { Scraper } from './scraper';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper';

export class ShopifyBaseScraper extends Scraper implements IShopifyBaseScraper {
  readonly noImageAvailableUrl =
    'https://via.placeholder.com/300x280.webp?text=No+Image+Available';

  getImageUrl = (images: IShopifyImage[]): string => {
    if (images.length !== 0) {
      return images[0].src;
    }
    return this.noImageAvailableUrl;
  };

  getPrice = (variants: IShopifyVariant[]): number => {
    const price: any = variants.map((variant) => {
      if (variant.available) {
        return Number(Number(variant.price).toFixed(2));
      }
    });
    if (!price) {
      return Number(Number(variants[0].price).toFixed(2));
    }
    return Number(Number(variants[0].price).toFixed(2));
  };

  getSoldOut = (variants: IShopifyVariant[]): boolean => {
    let isAvailable = true;
    for (const variant of variants) {
      if (variant.available) {
        isAvailable = false;
      }
    }
    return isAvailable;
  };

  getWeight = (item: IShopifyProductResponseData): number => {
    for (const variant of item.variants) {
      if (variant.available) {
        return variant.grams;
      }
    }
    return item.variants[0].grams;
  };
}
