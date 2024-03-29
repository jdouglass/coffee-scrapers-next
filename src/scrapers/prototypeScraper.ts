import { worldData } from '../data/worldData';
import Helper from '../helper/helper';
import { ISquareSpaceBaseScraper } from '../interfaces/squareSpace/squareSpaceScraper.interface';
import { ISquareSpaceProductResponseData } from '../interfaces/squareSpace/squareSpaceResponseData.interface';
import { SquareSpaceBaseScraper } from '../baseScrapers/squareSpaceBaseScraper';
import { Vendor } from '../enums/vendors';
import { IScraper } from '../interfaces/scrapers/scraper.interface';
import { UNKNOWN, UNKNOWN_ARR } from '../constants';

export default class PrototypeScraper
  extends SquareSpaceBaseScraper
  implements ISquareSpaceBaseScraper, IScraper
{
  private vendor = Vendor.Prototype;

  getVendor = (): string => {
    return this.vendor;
  };

  getBrand = (_item: ISquareSpaceProductResponseData): string => {
    return this.vendor;
  };

  getCountry = (item: ISquareSpaceProductResponseData): string => {
    const title = item.title;
    const excerpt = item.excerpt;
    const countryList: Array<string> = [];
    for (const country of worldData.keys()) {
      if (title.includes(country)) {
        countryList.push(country);
      }
    }
    if (countryList.length === 0) {
      for (const country of worldData.keys()) {
        if (excerpt.includes(country)) {
          countryList.push(country);
        }
      }
    }
    if (countryList.length === 0) {
      return 'Unknown';
    }
    if (countryList.length === 1) {
      return countryList[0];
    }
    return 'Multiple';
  };

  getProcess = (item: ISquareSpaceProductResponseData): string => {
    let process = '';
    if (item.body.includes('Process')) {
      process = item.body.split('Process')[1];
      process = process.replaceAll('&nbsp;', '');
      process = process.split('/')[0];
      process = process.split(':')[1];
      if (process.includes('#')) {
        process = process.split('#')[0];
      }
      return process.trim();
    }
    return 'Unknown';
  };

  getVariety = (item: ISquareSpaceProductResponseData): string[] => {
    let variety = '';
    if (item.body.includes('Cultivar')) {
      variety = item.body.split('Cultivar')[1];
      variety = variety.replaceAll('&nbsp;', '');
      variety = variety.split('/')[0];
      variety = variety.split(':')[1].trim();
    } else {
      return UNKNOWN_ARR;
    }
    let varietyOptions = variety
      .split(/, | & | and /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]);
  };

  getVarietyString = (item: ISquareSpaceProductResponseData): string => {
    let variety = '';
    if (item.body.includes('Cultivar')) {
      variety = item.body.split('Cultivar')[1];
      variety = variety.replaceAll('&nbsp;', '');
      variety = variety.split('/')[0];
      variety = variety.split(':')[1].trim();
    } else {
      return UNKNOWN;
    }
    let varietyOptions = variety
      .split(/, | & | and /)
      .map((variety: string) => variety.trim());
    varietyOptions = Helper.firstLetterUppercase(varietyOptions);
    varietyOptions = Helper.convertToUniversalVariety(varietyOptions);
    return Array.from([...new Set(varietyOptions)]).join(', ');
  };

  getWeight = (item: ISquareSpaceProductResponseData): number => {
    let body = item.excerpt;
    body = body.replaceAll(/<p class=\"\">/g, ' ');
    const words = body.split(' ');
    const weightOptions = words.filter((word) => word.match(/\d+g/g));
    let weight = weightOptions[0];
    weight = weight.split('g')[0].trim();
    if (weight.includes('>')) {
      weight = weight.split('>')[weight.split('>').length - 1].trim();
    }
    if (!isNaN(parseInt(weight))) {
      return parseInt(weight);
    }
    return 0;
  };

  getTitle = (item: ISquareSpaceProductResponseData): string => {
    let title = item.title;
    if (title.includes(',')) {
      title = title.split(',')[0];
    }
    if (title.includes('(')) {
      title = title.split('(')[0];
    }
    return title.trim();
  };

  getTastingNotes = (item: ISquareSpaceProductResponseData): string[] => {
    let notes = '';
    if (item.excerpt.includes('Notes:')) {
      notes = item.excerpt.split('Notes:')[1].trim();
    } else if (item.body.includes('Notes:')) {
      notes = item.body.split('Notes:')[1].trim();
    } else {
      return UNKNOWN_ARR;
    }
    if (notes !== '') {
      notes = notes.split('<')[0];
      notes = notes.replace('.', '').trim();
      const notesArr = notes
        .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+/)
        .map((element) => element.trim())
        .filter((element) => element !== '');
      return Helper.firstLetterUppercase(notesArr);
    }
    return UNKNOWN_ARR;
  };

  getTastingNotesString = (item: ISquareSpaceProductResponseData): string => {
    let notes = '';
    if (item.excerpt.includes('Notes:')) {
      notes = item.excerpt.split('Notes:')[1].trim();
    } else if (item.body.includes('Notes:')) {
      notes = item.body.split('Notes:')[1].trim();
    } else {
      return UNKNOWN;
    }
    if (notes !== '') {
      notes = notes.split('<')[0];
      notes = notes.replace('.', '').trim();
      const notesArr = notes
        .split(/,| \/ | and | \+ | \&amp; | \& |\s+\|\s+/)
        .map((element) => element.trim())
        .filter((element) => element !== '');
      return Helper.firstLetterUppercase(notesArr).join(', ');
    }
    return UNKNOWN;
  };
}
