import axios from 'axios';
import { load } from 'cheerio';

export class MonogramHelper {
  public static async getProductInfo(productUrl: string): Promise<string[]> {
    return (await axios(productUrl)
      .then((res) => {
        if (res.data) {
          const $ = load(res.data as string);
          const details = $('.metafield-multi_line_text_field')
            .first()
            .toArray()
            .map((node) => $(node).text());
          const tastingNotes = $('.product__callouts-mini-items')
            .toArray()
            .map((node) =>
              $(node)
                .text()
                .trim()
                .split('\n')
                .filter((element) => element.match(/[a-zA-Z]/))
                .map((element) => element.trim())
            )
            .join(', ')
            .split(',')
            .map((element) => element.trim());
          tastingNotes.pop();
          return details.concat(tastingNotes);
        }
      })
      .catch((e) => {
        console.error(e);
      })) as string[];
  }
}
