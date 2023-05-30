import { IShopifyImage } from '../interfaces/shopify/shopifyImage.interface';
import { IShopifyProductResponseData } from '../interfaces/shopify/shopifyResponseData.interface';
import { IShopifyVariant } from '../interfaces/shopify/shopifyVariant.interface';
import { Scraper } from './scraper';
import { IShopifyBaseScraper } from '../interfaces/shopify/shopifyBaseScraper.interface';
import { CoffeeType } from '../enums/coffeeTypes';

export class ShopifyBaseScraper extends Scraper implements IShopifyBaseScraper {
  getDateAdded = (date: string): string => {
    return new Date(date).toISOString();
  };

  getImageUrl = (images: IShopifyImage[]): string => {
    if (images.length !== 0) {
      return images[0].src;
    }
    return this.noImageAvailableUrl;
  };

  getHandle = (handle: string): string => {
    return handle;
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

  getType = (item: IShopifyProductResponseData): string => {
    if (item.title.toLowerCase().includes(CoffeeType.Capsule.toLowerCase())) {
      return CoffeeType.Capsule;
    } else if (
      item.title.toLowerCase().includes(CoffeeType.Instant.toLowerCase())
    ) {
      return CoffeeType.Instant;
    } else if (item.title.toLowerCase().includes('green')) {
      return CoffeeType.GreenWholeBean;
    }
    return CoffeeType.RoastedWholeBean;
  };
}
