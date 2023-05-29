import { load } from 'cheerio';
import { UNKNOWN } from '../constants';

export class HeartHelper {
  public static getTastingNotes = async (
    productPageUrl: string
  ): Promise<string[]> => {
    return (await fetch(productPageUrl)
      .then(async (res) => {
        if (res.ok) {
          const $ = load(await res.text());
          return $('[class="ProductMeta__Text"]').text().trim().split(', ');
        } else {
          return UNKNOWN;
        }
      })
      .catch((err) => {
        console.error(err);
      })) as string[];
  };
}
