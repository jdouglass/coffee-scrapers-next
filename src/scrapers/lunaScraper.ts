import { ProcessCategory } from '../enums/processCategory';
import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { IWordpressScraper } from '../interfaces/wordpress/wordpressScraper.interface';
import { CheerioAPI } from 'cheerio';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { VendorApiUrl } from '../enums/vendorApiUrls';

export default class LunaScraper implements IWordpressScraper, IScraper {
  private vendor = Vendor.Luna;

  getContinent = (country: string): string => {
    return worldData.get(country) ?? 'Unknown';
  };

  getProcessCategory = (process: string): string => {
    if (
      process === ProcessCategory[ProcessCategory.Washed] ||
      process === ProcessCategory[ProcessCategory.Natural] ||
      process === ProcessCategory[ProcessCategory.Honey] ||
      process === ProcessCategory[ProcessCategory.Unknown]
    ) {
      return process;
    }
    return ProcessCategory[ProcessCategory.Experimental];
  };

  getProductUrl = (item: IWordpressProductResponseData): string => {
    return item.link;
  };

  getVendor = (): string => {
    return this.vendor;
  };

  getVendorApiUrl = (): string => {
    return VendorApiUrl.Luna;
  };

  getBrand = (
    _item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string => {
    return this.vendor;
  };

  getCountry = (
    item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string => {
    const countryList = new Set<string>();
    for (const country of worldData.keys()) {
      if (item.title.rendered.includes(country)) {
        countryList.add(country);
      }
    }
    if (!countryList.size && item.title.rendered.includes('Origin:')) {
      let country = item.title.rendered.split('Origin:')[1].trim();
      country = country.split('<')[0].trim();
      for (const country of worldData.keys()) {
        if (item.title.rendered.includes(country)) {
          countryList.add(country);
        }
      }
      if (!countryList.size) {
        return 'Unknown';
      }
    }
    if (countryList.size === 1) {
      return [...countryList][0];
    }
    return 'Multiple';
  };

  getDateAdded = (item: IWordpressProductResponseData): string => {
    return new Date(item.modified).toISOString();
  };

  getHandle = (slug: string): string => {
    return slug;
  };

  getImageUrl = ($: CheerioAPI): string => {
    const imageElement = $('.wp-post-image').attr('src');
    return imageElement as string;
  };

  getPrice = ($: CheerioAPI): number => {
    const priceContent = $('.price').text();
    if (priceContent !== '') {
      let price = priceContent.split('$')[1];
      price = price.split(' ')[0].trim();
      return Number(Number(price).toFixed(2));
    }
    return 0;
  };

  getProcess = (
    item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string => {
    let process = '';
    if (item.content.rendered.includes('Processing:')) {
      process = item.content.rendered.split('Processing:')[1].trim();
    }
    if (process === '') {
      return 'Unknown';
    }
    process = process.split('<')[0].trim();
    process = Helper.firstLetterUppercase([process]).join(' ');
    process = Helper.convertToUniversalProcess(process);
    return process;
  };

  getSoldOut = ($: CheerioAPI): boolean => {
    const cartButton = $('[class^="single_add_to_cart_button"]').text();
    if (cartButton.includes('Add to cart')) {
      return false;
    }
    return true;
  };

  getVariety = (
    item: IWordpressProductResponseData,
    _$?: CheerioAPI
  ): string[] => {
    let variety = '';
    if (item.content.rendered.includes('Variety:')) {
      variety = item.content.rendered.split('Variety:')[1].trim();
    } else if (item.content.rendered.includes('Varieties:')) {
      variety = item.content.rendered.split('Varieties:')[1].trim();
    } else if (item.content.rendered.includes('Cultivar:')) {
      variety = item.content.rendered.split('Cultivar:')[1].trim();
    }
    if (variety === '') {
      return ['Unknown'];
    }
    variety = variety.split('<')[0].trim();

    let varietyOptions = variety
      .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+/)
      .map((element) => element.trim())
      .filter((element) => element !== '');
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    varietyOptions = Array.from([...new Set(varietyOptions)]);
    return varietyOptions;
  };

  getWeight = (_item: IWordpressProductResponseData, $: CheerioAPI): number => {
    const gramsToKg = 1000;
    let weightOptions = $('.variation-radios')
      .find('label')
      .toArray()
      .map((node) => $(node).text());
    const weightSet = new Set(weightOptions);
    weightOptions = Array.from(weightSet);
    for (let i = 0; i < weightOptions.length; i++) {
      if (weightOptions[i]?.includes('kg')) {
        weightOptions[i] = weightOptions[i]?.split('kg')[0];
        weightOptions[i] = (Number(weightOptions[i]) * gramsToKg).toString();
      } else if (weightOptions[i]?.includes('g')) {
        weightOptions[i] = weightOptions[i]?.split('g')[0];
      }
    }
    const stockContent = $('[class^="single_add_to_cart_button"]').text();
    if (stockContent.includes('Add to cart')) {
      return weightOptions[0] ? Number(weightOptions[0]) : 0;
    }
    return weightOptions[weightOptions.length - 1]
      ? Number(weightOptions[weightOptions.length - 1])
      : 0;
  };

  getTitle = (item: IWordpressProductResponseData, _$?: CheerioAPI): string => {
    let title = item.title.rendered;
    if (item.title.rendered.includes(' in ')) {
      title = title.split(' in ')[0].trim();
    }
    title = title.replaceAll('&#8211;', '-');
    title = title.replaceAll('&#038;', '&');
    return title;
  };

  getTastingNotes = (
    item: IWordpressProductResponseData,
    _$: CheerioAPI
  ): string[] => {
    let notes = '';
    if (item.content.rendered.includes('Tasting:')) {
      notes = item.content.rendered.split('Tasting:')[1].trim();
    } else if (item.content.rendered.includes('notes:')) {
      notes = item.content.rendered.split('notes:')[1].trim();
    } else {
      return ['Unknown'];
    }
    console.log(notes);
    notes = notes.split('<')[0].trim();
    if (notes !== '') {
      const notesArr = notes
        .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+/)
        .map((element) => element.trim())
        .filter((element) => element !== '');
      return Helper.firstLetterUppercase(notesArr);
    }
    return ['Unknown'];
  };
}
