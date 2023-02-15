import { CheerioAPI, load } from 'cheerio';

export class HatchHelper {
  public static getProductUrls = async (
    productPageUrl: string,
    partialProductUrl: string
  ): Promise<string[]> => {
    const pageNumbers = await this.getPageNumbers(productPageUrl);
    const productUrls = new Array<string>();
    for (const pageNumber of pageNumbers) {
      await fetch(productPageUrl + pageNumber).then(async (res) => {
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
    }
    return productUrls;
  };

  public static getProductCategory = async (
    productPageUrl: string
  ): Promise<string> => {
    return (await fetch(productPageUrl).then(async (res) => {
      if (res.ok) {
        const $ = load(await res.text());
        return $('.product-category').first().text();
      }
    })) as string;
  };

  public static getProductDetails = ($: CheerioAPI): string[] => {
    return $('p[class="product-detail-description"]')
      .first()
      .text()
      .split('\n')
      .filter((element) => element !== '');
  };

  private static getPageNumbers = async (
    productPageUrl: string
  ): Promise<string[]> => {
    return (await fetch(productPageUrl).then(async (res) => {
      if (res.ok) {
        const $ = load(await res.text());
        return $('li[class^="product_page"]')
          .find('a')
          .toArray()
          .map((node) => $(node).text());
      }
    })) as string[];
  };
}
