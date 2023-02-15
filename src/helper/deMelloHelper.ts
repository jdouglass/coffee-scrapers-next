import { CheerioAPI, load } from 'cheerio';
import { unwantedTitles } from '../data/unwantedTitles';

export class DeMelloHelper {
  public static getProductUrls = async (
    productPageUrl: string,
    partialProductUrl: string
  ): Promise<string[]> => {
    const pageNumbers = await this.getPageNumbers(productPageUrl);
    const productUrls = new Set<string>();
    for (const pageNumber of pageNumbers) {
      if (!isNaN(Number(pageNumber))) {
        await fetch(productPageUrl + 'page/' + pageNumber).then(async (res) => {
          if (res.ok) {
            const $ = load(await res.text());
            $('[class^="products"]')
              .find('li[class*="product_tag-beans"]')
              .find('a')
              .toArray()
              .map((el) => $(el).attr('href'))
              .filter((href) => {
                if (href?.includes(partialProductUrl)) {
                  let containsUnwantedString = false;
                  for (const unwantedString of unwantedTitles) {
                    if (href.includes(unwantedString.toLowerCase())) {
                      containsUnwantedString = true;
                    }
                  }
                  if (!containsUnwantedString) {
                    productUrls.add(href);
                  }
                  containsUnwantedString = false;
                }
              });
          }
        });
      }
    }
    return new Array(...productUrls);
  };

  public static getTitle = async (productUrl: string) => {
    return fetch(productUrl).then(async (res) => {
      if (res.ok) {
        const $ = load(await res.text());
        return $('head > title').text();
      } else {
        return 'Unknown';
      }
    });
  };

  public static getProductElement = async (
    productUrl: string
  ): Promise<CheerioAPI> => {
    return fetch(productUrl).then(async (res) => {
      if (res.ok) {
        return load(await res.text());
      }
    }) as Promise<CheerioAPI>;
  };

  public static getProductInfo = ($: CheerioAPI): string[] => {
    return $('[class="wpb_wrapper"]')
      .first()
      .find('[class^="vc_row"]')
      .toArray()
      .map((node) => $(node).text());
  };

  private static getPageNumbers = async (
    productPageUrl: string
  ): Promise<string[]> => {
    return (await fetch(productPageUrl).then(async (res) => {
      if (res.ok) {
        const $ = load(await res.text());
        return $('[class="page-numbers"]')
          .find('li')
          .toArray()
          .map((node) => $(node).text());
      }
    })) as string[];
  };
}
