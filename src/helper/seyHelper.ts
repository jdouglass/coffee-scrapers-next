import axios from 'axios';
import { load } from 'cheerio';

export class SeyHelper {
  public static async getProductInfo(productUrl: string): Promise<string[]> {
    return (await axios(productUrl)
      .then((res) => {
        if (res.data) {
          const $ = load(res.data as string);
          const details = $('div[class="coffee_technicalDetails_details"]')
            .text()
            .trim()
            .split('\n')
            .filter((element) => element.match(/[a-zA-Z]/))
            .map((element) => element.trim());
          const cleanedDetails = Array.from(
            { length: details.length / 2 },
            (_, i) => details[2 * i] + ': ' + details[2 * i + 1]
          );
          const origin =
            'Origin: ' +
            $('span[class="coffeeTitle_country"]').contents().first().text();
          const process =
            'Process: ' +
            $('span[class="coffeeTitle_varietyProcess"]')
              .contents()
              .first()
              .text();
          cleanedDetails.push(origin);
          cleanedDetails.push(process);
          return cleanedDetails;
        }
      })
      .catch((e) => {
        console.error(e);
      })) as string[];
  }
}
