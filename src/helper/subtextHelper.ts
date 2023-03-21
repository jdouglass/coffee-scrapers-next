import axios from 'axios';
import { load } from 'cheerio';

export class SubtextHelper {
  public static async getProductInfo(productUrl: string): Promise<string[]> {
    return (await axios(productUrl)
      .then((res) => {
        if (res.data) {
          const $ = load(res.data as string);
          const details = $(
            'div[class="shg-rich-text shg-default-text-content"]'
          )
            .find('p')
            .toArray()
            .map((node) => $(node).text());
          const tastingNotes = $(
            'div[class="shg-rich-text shg-theme-text-content"]'
          ).text();
          return details.concat(tastingNotes);
        }
      })
      .catch((e) => {
        console.error(e);
      })) as string[];
  }
}
