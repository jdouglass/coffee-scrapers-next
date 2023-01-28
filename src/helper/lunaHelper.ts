import { CheerioAPI, load } from 'cheerio';

export class LunaHelper {
  public static getProductUrls = async (
    productPageUrl: string,
    partialProductUrl: string
  ): Promise<string[]> => {
    const productUrls = new Array<string>();
    await fetch(productPageUrl).then(async (res) => {
      if (res.ok) {
        const $ = load(await res.text());
        $('a')
          .toArray()
          .map((el) => $(el).attr('href'))
          .filter((href) => {
            if (href?.includes(partialProductUrl)) {
              productUrls.push(href);
            }
          });
      }
    });
    return productUrls;
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
    return $('.product-summary')
      .find('p')
      .toArray()
      .map((node) => $(node).text());
  };
}
