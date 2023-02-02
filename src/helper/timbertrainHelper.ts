import { CheerioAPI, load } from 'cheerio';

export class TimbertrainHelper {
  public static getProductUrls = async (
    productPageUrl: string,
    partialProductUrl: string
  ): Promise<string[]> => {
    const productUrls = new Set<string>();

    await fetch(productPageUrl).then(async (res) => {
      if (res.ok) {
        const $ = load(await res.text());
        $('[class="shop-container"]')
          .find('a')
          .toArray()
          .map((el) => $(el).attr('href'))
          .filter((href) => {
            if (href?.includes(partialProductUrl)) {
              productUrls.add(href);
            }
          });
      }
    });
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
    return $('[class="product-short-description"]')
      .find('p')
      .toArray()
      .map((node) => $(node).text());
  };
}

// async function main() {
//   await fetch(
//     'https://timbertraincoffeeroasters.com/shop/alma-guatemala/'
//   ).then(async (res) => {
//     if (res.ok) {
//       const $ = load(await res.text());
//       console.log(
//         $('[class="product-short-description"]')
//           .find('span')
//           .toArray()
//           .map((node) => $(node).text().replace('\n', ''))
//       );
//     }
//   });
// }

// void main();
